from __future__ import annotations

import os
from typing import Optional

from openai import OpenAI
from sqlalchemy.orm import Session

from ..models import Preference, User

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
MODEL_NAME = os.getenv("GITHUB_MODEL_NAME", "gpt-4o-mini")
GITHUB_MODELS_BASE_URL = "https://models.inference.ai.azure.com"


def _get_client() -> OpenAI:
    return OpenAI(
        base_url=GITHUB_MODELS_BASE_URL,
        api_key=GITHUB_TOKEN,
    )


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
    parts.append(f"Anggaran harian: Rp{int(pref.daily_budget):,}".replace(",", "."))
    if pref.allergies:
        parts.append(f"Pantangan/alergi: {pref.allergies.replace(',', ', ')}")
    return "\n".join(parts)


SYSTEM_PROMPT_TEMPLATE = """\
Kamu adalah Foodie Assistant, asisten nutrisi dan memasak cerdas dari platform Food Over Fuss.
Kamu membantu pengguna dengan resep masakan Indonesia maupun internasional, tips memasak, \
informasi nutrisi, ide menu harian, dan saran pola makan sehat — berdasarkan pengetahuanmu \
yang luas tentang dunia kuliner dan gizi.

{user_context}\
Panduan:
- Rekomendasikan resep nyata dari pengetahuanmu (bukan hanya database internal).
- Berikan estimasi kalori, protein, dan bahan utama jika relevan.
- Perhatikan tujuan diet, anggaran, dan alergi pengguna saat memberi rekomendasi.
- Jika pengguna menyebutkan bahan tertentu, berikan ide resep yang bisa dibuat dengan bahan itu.
- Berikan tips memasak, substitusi bahan, atau cara penyimpanan jika ditanya.
- Jawab dalam Bahasa Indonesia yang santai, ramah, dan informatif.
- Gunakan emoji seperlunya agar lebih menarik.
"""


def _build_api_messages(messages: list[dict], system_prompt: str) -> list[dict]:
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
    user_context = _build_user_context(db, user)

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        user_context=f"Informasi pengguna:\n{user_context}\n\n" if user_context else "",
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
