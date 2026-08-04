const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

/**
 * Ubah daftar teks menjadi vektor 1024 dimensi lewat AI service (Python).
 * Mengembalikan null bila layanan tidak dapat dihubungi, sehingga pemanggil
 * bisa melanjutkan tanpa embedding daripada menggagalkan operasi pengguna.
 */
export const embedTexts = async (texts: string[]): Promise<number[][] | null> => {
  const clean = texts.map((t) => String(t ?? "").trim()).filter(Boolean);
  if (clean.length === 0) return [];

  try {
    const res = await fetch(`${AI_SERVICE_URL}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: clean }),
      signal: AbortSignal.timeout(60_000), // model CPU bisa lambat
    });
    if (!res.ok) {
      console.warn(`[ai-service] /embed gagal dengan status ${res.status}`);
      return null;
    }
    const data: any = await res.json();
    return data?.embeddings ?? null;
  } catch (err: any) {
    console.warn("[ai-service] tidak dapat dihubungi:", err?.message);
    return null;
  }
};