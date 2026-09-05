import json, os
from safetensors import safe_open
from sentence_transformers import SentenceTransformer

PATH = os.getenv("MODEL_PATH", r"C:\ITERA\BRIN\pairscore-me5-N40")

# 1. Susunan modul
model = SentenceTransformer(PATH)
print("=== Susunan modul ===")
print(model)

# 2. Keluaran encode itu berupa apa?
out = model.encode("Mahasiswa mampu merancang dan membangun REST API.")
print("\n=== Keluaran encode ===")
print("tipe   :", type(out))
print("bentuk :", getattr(out, "shape", None))
print("cuplikan:", out[:5])

# 3. Arsitektur menurut config
cfg = json.load(open(os.path.join(PATH, "config.json"), encoding="utf-8"))
print("\n=== config.json ===")
print("architectures:", cfg.get("architectures"))
print("is_decoder   :", cfg.get("is_decoder", False))

# 4. Adakah kepala untuk menghasilkan teks?
with safe_open(os.path.join(PATH, "model.safetensors"), framework="pt") as f:
    keys = list(f.keys())
kepala = [k for k in keys if any(t in k.lower() for t in ["lm_head", "decoder", "generator"])]
print("\n=== Kepala generasi teks ===")
print("total bobot :", len(keys))
print("ditemukan   :", kepala if kepala else "TIDAK ADA")