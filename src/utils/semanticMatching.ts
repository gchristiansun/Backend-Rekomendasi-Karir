import prisma from "../config/prisma";
import { PASSING_SCORE } from "../constants";

// ============================================================
// PARAMETER PENCOCOKAN SEMANTIK
// Nilai-nilai ini adalah keputusan riset, bukan angka baku.
// Ubah di sini bila ingin bereksperimen.
// ============================================================

// Model dilatih dengan label 0.1-0.95. Pasangan tidak relevan bernilai ~0.22,
// pasangan sangat relevan ~0.93. Tanpa penskalaan, kandidat yang sama sekali
// tidak cocok akan tampil sebagai 22%.
const SIM_FLOOR = 0.25; // dipetakan ke 0%
const SIM_CEIL = 0.90;  // dipetakan ke 100%

// Sebuah requirement dianggap "terpenuhi" bila ada CLO dengan kemiripan mentah
// minimal sebesar ini. Dipakai untuk penjelasan, bukan untuk skor.
const COVERAGE_THRESHOLD = 0.60;

// Batas jumlah CLO yang dipertimbangkan per mahasiswa, demi menjaga waktu
// tanggap saat menghitung banyak kandidat sekaligus.
const MAX_CLO_PER_STUDENT = 80;

const rescale = (sim: number): number => {
  const v = (sim - SIM_FLOOR) / (SIM_CEIL - SIM_FLOOR);
  return Math.max(0, Math.min(1, v));
};

// Kedua vektor sudah ternormalisasi oleh model, sehingga dot product = cosine.
const dot = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

export const parseVector = (raw?: string | null): number[] | null => {
  if (!raw) return null;
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(v) && v.length > 0 && typeof v[0] === "number" ? v : null;
  } catch {
    return null;
  }
};

// ============================================================
// CACHE VEKTOR CLO
// CLO adalah data kurikulum yang jarang berubah, sementara mem-parse ratusan
// vektor 1024 dimensi dari JSON itu mahal. Disimpan di memori dengan masa
// berlaku singkat supaya penambahan CLO baru tetap terbaca.
// ============================================================
export interface CloVector {
  cloId: string;
  subjectId: string;
  code: string;
  text: string;
  vec: number[];
  weight?: number;      // bobot nilai matkul asal (0-1)
  gradeLabel?: string;  // nilai apa adanya, untuk tampilan
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { at: number; bySubject: Map<string, CloVector[]> } | null = null;

export const getCloVectorsBySubject = async (): Promise<Map<string, CloVector[]>> => {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.bySubject;

  const rows = await prisma.cLO.findMany({ where: { embedding: { not: null } } });
  const bySubject = new Map<string, CloVector[]>();

  for (const c of rows as any[]) {
    const vec = parseVector(c.embedding);
    if (!vec) continue;
    const list = bySubject.get(c.subjectId) ?? [];
    list.push({
      cloId: c.id,
      subjectId: c.subjectId,
      code: c.code ?? c.kode ?? `CLO${list.length + 1}`,
      text: c.paraphrase ?? c.parafrase ?? c.description ?? c.deskripsi ?? c.text ?? "",
      vec,
    });
    bySubject.set(c.subjectId, list);
  }

  cache = { at: Date.now(), bySubject };
  return bySubject;
};

// Dipanggil bila kurikulum berubah (impor CLO baru), agar cache tidak basi.
export const resetCloCache = () => {
  cache = null;
};

// ============================================================
// PENGUMPULAN CLO MAHASISWA
// ============================================================
export const isPassedGrade = (score?: number | null, grade?: string | null): boolean => {
  if (typeof score === "number") return score >= PASSING_SCORE;
  if (grade) {
    const g = String(grade).trim().toUpperCase();
    return g !== "E" && g !== "F";
  }
  return false;
};

/**
 * Kumpulkan vektor CLO dari matkul yang SUDAH DILULUSI mahasiswa.
 * subjectsTaken cukup berisi { subjectId, score, grade }.
 */
export const collectStudentCloVectors = (
  subjectsTaken: any[],
  bySubject: Map<string, CloVector[]>,
): CloVector[] => {
  const out: CloVector[] = [];
  for (const st of subjectsTaken ?? []) {
    if (!isPassedGrade(st.score, st.grade)) continue;
    const clos = bySubject.get(st.subjectId);
    if (!clos) continue;
    // Bobot menempel pada matkul, tetapi dibawa per CLO karena penilaian
    // dilakukan per CLO.
    const w = gradeWeight(st.score, st.grade);
    const label = gradeLabel(st.score, st.grade);
    for (const c of clos) out.push({ ...c, weight: w, gradeLabel: label });
  }
  return out.slice(0, MAX_CLO_PER_STUDENT);
};

// ============================================================
// PERHITUNGAN SKOR
// ============================================================
export interface RequirementVector {
  requirement: string;
  vec: number[];
}


// Dipakai juga oleh analisis per-CLO agar skalanya seragam di seluruh aplikasi.
export const rescaleSimilarity = (sim: number): number => rescale(sim);

export interface SemanticMatchResult {
  score: number;              // 0-100, rata-rata kontribusi seluruh CLO
  covered: number;            // requirement yang terpenuhi (untuk penjelasan)
  totalRequirements: number;
  totalClos: number;
  // rincian per CLO: inilah dasar perhitungan skor
  perClo: {
    cloId: string;
    cloCode: string;
    subjectId: string;
    similarity: number;        // kemiripan mentah 0-1
    similarityScore: number;   // 0-100 setelah diskalakan
    weight: number;            // bobot nilai 0-1
    gradeLabel: string;
    contribution: number;      // 0-100 = similarityScore x weight
    matchedRequirement: string | null;
  }[];
  // rincian per requirement: dipakai untuk menjelaskan cakupan lowongan
  perRequirement: {
    requirement: string;
    similarity: number;
    score: number;
    cloCode: string | null;
    cloText: string | null;
  }[];
}

/**
 * Skor akhir = rata-rata kontribusi tiap CLO, di mana
 *   kontribusi = kemiripan semantik terbaik CLO itu x bobot nilai matkulnya.
 * Menjawab "seberapa besar kompetensi yang benar-benar dikuasai mahasiswa
 * menyentuh kebutuhan lowongan ini".
 */
export const computeSemanticMatch = (
  cloVecs: CloVector[],
  reqVecs: RequirementVector[],
): SemanticMatchResult => {
  const kosong: SemanticMatchResult = {
    score: 0,
    covered: 0,
    totalRequirements: reqVecs.length,
    totalClos: cloVecs.length,
    perClo: [],
    perRequirement: [],
  };
  if (cloVecs.length === 0 || reqVecs.length === 0) return kosong;

  // --- kontribusi per CLO (dasar skor) ---
  const perClo: SemanticMatchResult["perClo"] = [];
  let totalKontribusi = 0;

  for (const clo of cloVecs) {
    let best = -1;
    let bestReq: string | null = null;

    for (const req of reqVecs) {
      const sim = dot(clo.vec, req.vec);
      if (sim > best) {
        best = sim;
        bestReq = req.requirement;
      }
    }

    const similarityScore = Math.round(rescale(best) * 100);
    const weight = clo.weight ?? 1;
    const contribution = Math.round(similarityScore * weight);
    totalKontribusi += contribution;

    perClo.push({
      cloId: clo.cloId,
      cloCode: clo.code,
      subjectId: clo.subjectId,
      similarity: Number(best.toFixed(4)),
      similarityScore,
      weight,
      gradeLabel: clo.gradeLabel ?? "-",
      contribution,
      matchedRequirement: bestReq,
    });
  }

  // --- cakupan per requirement (hanya untuk penjelasan, bukan skor) ---
  const perRequirement: SemanticMatchResult["perRequirement"] = [];
  let covered = 0;

  for (const req of reqVecs) {
    let best = -1;
    let bestClo: CloVector | null = null;
    for (const clo of cloVecs) {
      const sim = dot(clo.vec, req.vec);
      if (sim > best) {
        best = sim;
        bestClo = clo;
      }
    }
    if (best >= COVERAGE_THRESHOLD) covered += 1;
    perRequirement.push({
      requirement: req.requirement,
      similarity: Number(best.toFixed(4)),
      score: Math.round(rescale(best) * 100),
      cloCode: bestClo?.code ?? null,
      cloText: bestClo?.text ?? null,
    });
  }

  return {
    score: Math.round(totalKontribusi / cloVecs.length),
    covered,
    totalRequirements: reqVecs.length,
    totalClos: cloVecs.length,
    perClo,
    perRequirement,
  };
};

// Bobot nilai huruf -> 0..1. Sesuaikan dengan skala kampus bila berbeda.
const GRADE_WEIGHT: Record<string, number> = {
  A: 1.0,
  AB: 0.875,
  "B+": 0.875,
  B: 0.75,
  BC: 0.625,
  "C+": 0.625,
  C: 0.5,
  D: 0.25,
  E: 0,
  F: 0,
};

/**
 * Bobot penguasaan materi dari nilai matkul.
 * Menerima nilai angka (0-100) maupun huruf; bila keduanya kosong,
 * dianggap 1.0 agar CLO tetap terhitung penuh.
 */
export const gradeWeight = (score?: number | null, grade?: string | null): number => {
  // Nilai angka bisa tersimpan di kolom score, atau di kolom grade sebagai teks.
  if (typeof score === "number" && Number.isFinite(score)) {
    return Math.max(0, Math.min(1, score / 100));
  }

  const teks = String(grade ?? "").trim();
  if (teks === "") return 1;

  const angka = Number(teks);
  if (Number.isFinite(angka)) return Math.max(0, Math.min(1, angka / 100));

  const g = teks.toUpperCase();
  return g in GRADE_WEIGHT ? GRADE_WEIGHT[g] : 1;
};

// Label nilai untuk ditampilkan apa adanya di layar.
export const gradeLabel = (score?: number | null, grade?: string | null): string => {
  if (grade) return String(grade);
  if (typeof score === "number") return String(score);
  return "-";
};