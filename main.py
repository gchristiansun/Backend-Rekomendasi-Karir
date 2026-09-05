import os
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

MODEL_PATH = os.getenv("MODEL_PATH", r"C:\ITERA\BRIN\pairscore-me5-N40")

# Model dimuat sekali saat start (butuh ~30 detik, ukurannya 2,2 GB).
print(f"Memuat model dari {MODEL_PATH} ...")
model = SentenceTransformer(MODEL_PATH)
DIM = model.get_sentence_embedding_dimension()
print(f"Model siap. Dimensi vektor: {DIM}")

app = FastAPI(title="Pairscore Embedding Service")


class EmbedRequest(BaseModel):
    texts: List[str]


@app.get("/health")
def health():
    return {"status": "ok", "dimension": DIM}


@app.post("/embed")
def embed(req: EmbedRequest):
    """
    Ubah daftar teks menjadi vektor 1024 dimensi.
    Teks dikirim apa adanya - model ini dilatih tanpa prefix query:/passage:.
    """
    texts = [t.strip() for t in req.texts if t and t.strip()]
    if not texts:
        raise HTTPException(400, "texts tidak boleh kosong")
    if len(texts) > 128:
        raise HTTPException(400, "Maksimal 128 teks per permintaan")

    # Model sudah punya layer Normalize; flag ini menjaga hasilnya tetap
    # ternormalisasi seandainya modelnya diganti di kemudian hari.
    vectors = model.encode(texts, normalize_embeddings=True, batch_size=8)
    return {"dimension": DIM, "embeddings": [v.tolist() for v in vectors]}