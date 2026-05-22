from __future__ import annotations

import os
import random
from typing import Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from ..models import Recipe, Preference, User

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
MODEL_NAME = os.getenv("GITHUB_MODEL_NAME", "gpt-4o-mini")
GITHUB_MODELS_BASE_URL = "https://models.inference.ai.azure.com"

# Ambil 50 resep dari DB, acak, potong ke 20 untuk konteks prompt.
# Ini membuat chatbot "tahu" menu yang berbeda setiap sesi.
_RECIPE_POOL_SIZE = 50
_RECIPE_CONTEXT_SIZE = 20


def _get_client() -> OpenAI:
    return OpenAI(
        base_url=GITHUB_MODELS_BASE_URL,
        api_key=GITHUB_TOKEN,
    )


def _format_ingredients(ingredients: list) -> str:
    """Konversi list ingredient (dict atau string) ke teks ringkas."""
    if not ingredients:
        return "-"
    parts: list[str] = []
    for item in ingredients:
        if isinstance(item, dict):
            name = item.get("name", "")
            qty  = item.get("qty", "")
            unit = item.get("unit", "")
            if qty and unit:
                parts.append(f"{qty} {unit} {name}".strip())
            else:
                parts.append(name)
        else:
            parts.append(str(item))
    return ", ".join(parts)


def _build_recipe_context(db: Session) -> str:
    # Ambil pool besar, acak, ambil sampel untuk prompt
    all_recipes = (
        db.query(Recipe)
        .filter(Recipe.is_published == True)
        .limit(_RECIPE_POOL_SIZE)
        .all()
    )
    if not all_recipes:
        return "Belum ada resep yang tersedia di database."

    sample = random.sample(all_recipes, min(_RECIPE_CONTEXT_SIZE, len(all_recipes)))

    lines = ["Berikut daftar resep yang tersedia di platform Food Over Fuss:\n"]
    for r in sample:
        ingredients_str = _format_ingredients(r.ingredients)
        allergens_str = (
            ", ".join(r.allergens) if r.allergens else "tidak ada"
        )
        lines.append(
            f"- **{r.name}** ({r.meal_type.value}) | "
            f"{r.calories} kkal | Protein {r.protein}g | "
            f"Karbo {r.carbs}g | Lemak {r.fat}g | "
            f"Estimasi Rp{r.estimated_cost:,} | "
            f"Prep: {r.prep_time} menit | "
            f"Alergen: {allergens_str} | "
            f"Bahan: {ingredients_str}"
        )
    return "\n".join(lines)


def _build_user_context(db: Session, user: User) -> str:
    pref: Optional[Preference] = (
        db.query(Preference).filter(Preference.user_id == user.id).first()
    )
    if not pref:
        return ""
    parts = [f"Nama pengguna: {user.name}"]
    goal_map = {
        "lose_weight": "turun berat badan",
        "maintain": "mempertahankan berat badan",
        "build_muscle": "membangun otot",
    }
    parts.append(f"Tujuan diet: {goal_map.get(pref.diet_goal, pref.diet_goal)}")
    parts.append(f"Anggaran mingguan: Rp{int(pref.daily_budget):,}".replace(",", "."))
    if pref.allergies:
        parts.append(f"Pantangan/alergi: {pref.allergies.replace(',', ', ')}")
    return "\n".join(parts)


SYSTEM_PROMPT_TEMPLATE = """\
Kamu adalah Foodie Assistant, asisten memasak cerdas dari platform Food Over Fuss. \
Kamu membantu pengguna menemukan resep, ide menu, tips memasak, dan informasi nutrisi \
dalam Bahasa Indonesia yang santai, ramah, dan informatif.

{user_context}

{recipe_context}

Panduan:
- Rekomendasikan resep dari daftar di atas jika relevan dengan pertanyaan pengguna.
- Sertakan detail kalori, protein, atau bahan jika ditanya.
- Jika pengguna menyebutkan bahan tertentu, cari resep yang cocok dari daftar.
- Perhatikan alergen dan anggaran pengguna saat memberikan rekomendasi.
- Jawab dengan ringkas tapi lengkap. Gunakan emoji seperlunya agar lebih menarik.
- Jika resep yang diminta tidak ada di daftar, tetap berikan saran umum yang membantu.
"""


def _build_api_messages(messages: list[dict], system_prompt: str) -> list[dict]:
    """Convert messages to OpenAI API format, handling vision content."""
    result = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        image_url = msg.get("image_url")
        text = msg.get("content", "")
        if image_url:
            content: list | str = []
            if text:
                content.append({"type": "text", "text": text})
            content.append({"type": "image_url", "image_url": {"url": image_url}})
        else:
            content = text
        result.append({"role": msg["role"], "content": content})
    return result


def chat_with_ai(messages: list[dict], db: Session, user: User) -> str:
    recipe_context = _build_recipe_context(db)
    user_context = _build_user_context(db, user)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        user_context=f"Informasi pengguna:\n{user_context}\n" if user_context else "",
        recipe_context=recipe_context,
    )

    api_messages = _build_api_messages(messages, system_prompt)

    client = _get_client()
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=api_messages,
        temperature=0.7,
        max_tokens=800,
    )
    return response.choices[0].message.content or "Maaf, saya tidak bisa menjawab saat ini."
