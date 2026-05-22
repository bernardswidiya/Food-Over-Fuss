import os
import uuid
from pathlib import PurePosixPath

from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile, HTTPException

_CONTAINER = "uploads"
_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")


def upload_image_to_azure(file: UploadFile, subfolder: str) -> str:
    """
    Upload an image file to Azure Blob Storage and return its public URL.

    :param file:      FastAPI UploadFile object (must be an image).
    :param subfolder: Logical folder inside the container, e.g. "avatars" or "recipes".
    :returns:         Public HTTPS URL of the uploaded blob.
    :raises HTTPException 400: if the file is not an image.
    :raises HTTPException 500: if the upload fails for any reason.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar.")

    # Derive extension from original filename, fallback to content_type
    original_name = file.filename or ""
    suffix = PurePosixPath(original_name).suffix  # e.g. ".jpg"
    if not suffix:
        suffix = "." + (file.content_type.split("/")[-1] or "jpg")

    blob_name = f"{subfolder}/{uuid.uuid4().hex}{suffix}"

    if not _CONNECTION_STRING:
        raise HTTPException(
            status_code=500,
            detail="Azure Storage tidak dikonfigurasi (AZURE_STORAGE_CONNECTION_STRING kosong).",
        )

    try:
        service_client = BlobServiceClient.from_connection_string(_CONNECTION_STRING)
        blob_client = service_client.get_blob_client(container=_CONTAINER, blob=blob_name)

        # Reset stream position in case it was read before
        file.file.seek(0)
        blob_client.upload_blob(file.file, overwrite=True)

        return blob_client.url

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mengupload gambar ke Azure: {exc}",
        ) from exc
