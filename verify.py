import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer(os.getenv("MODEL_PATH", r"C:\ITERA\BRIN\pairscore-me5-N40"))
print("Dimensi:", model.get_sentence_embedding_dimension())

# ---------- Uji 1: skor pasangan masuk akal ----------
clo = "Mampu merancang dan membangun REST API menggunakan framework backend serta mengelola basis data relasional."
reqs = [
    "Membangun dan memelihara REST API perusahaan",       # harus tinggi
    "Merancang kampanye pemasaran media sosial",          # harus rendah
]
e_clo = model.encode(clo)
for teks, vec in zip(reqs, model.encode(reqs)):
    print(f"{float(np.dot(e_clo, vec)):.3f}  <-  {teks}")

# ---------- Uji 2: cocokkan dengan embedding CLO di database ----------
# Ambil SATU baris dari Prisma Studio: salin teks/parafrase CLO-nya ke sini,
# dan simpan kolom embedding-nya sebagai clo_embedding.json di folder ini.
TEKS_CLO_DARI_DB = "Mampu merancang dan membuat tampilan aplikasi bergerak (frontend) dengan mengadopsi kaidah user experience yang baik melalui modifikasi template yang tersedia, serta mampu mengembangkan layanan web service/backend untuk aplikasi tersebut. Menguasai pembuatan aplikasi yang dapat mengakses web service dan/atau local storage untuk fungsi penyimpanan, entri, tampilan detail, daftar data, serta pembaruan dan penghapusan data, yang terintegrasi secara keseluruhan dengan antarmuka pengguna."

if os.path.exists("clo_embedding.json"):
    tersimpan = np.array(json.load(open("clo_embedding.json")))
    print("\nPanjang embedding tersimpan:", len(tersimpan))
    baru = model.encode(TEKS_CLO_DARI_DB)
    print(f"Kemiripan tersimpan vs hasil model: {float(np.dot(tersimpan, baru)):.4f}")
    print("-> mendekati 1.000 berarti embedding CLO memang dari model ini")