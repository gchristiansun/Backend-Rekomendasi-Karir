
## Setup AI Service


### 1. Siapkan folder project
```bash
mkdir ai-service
cd ai-service
```

### 2. Buat virtual environment
Gunakan Python venv untuk isolasi dependency.
```bash
    python -m venv venv
    venv\Scripts\activate
```

### 3. Install dependency
Pasang library FastAPI, Uvicorn, Sentence Transformers, Torch.
```bash
pip install fastapi "uvicorn[standard]" sentence-transformers torch
```
Torch cukup besar (~2 GB), sabarr.

### 4. Konfigurasi environment
Set variabel environment untuk path model.
```bash
MODEL_PATH=C:\....\pairscore-me5-N40
```

## 5. ambil main.py nya
buat file main.py nya
terus isi source code di main.py

## 6. isi codenya
Load model dari MODEL_PATH
Endpoint /health untuk cek status
Endpoint /embed untuk ubah teks jadi vektor 1024 dimensi

## 7. ambil main.py nya
Gunakan Uvicorn untuk menjalankan API.
```bash
uvicorn main:app --port 8000
```
unggu hingga muncul log: Model siap. Dimensi vektor: 1024