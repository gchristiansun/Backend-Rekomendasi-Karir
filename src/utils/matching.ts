// Logika kecocokan skill (PLACEHOLDER untuk "Layanan AI" / model AI).

// Modul ini SENGAJA murni (tanpa Prisma/DB) supaya:
//   1. Mudah diunit-test.
//   2. Mudah ditukar dengan panggilan AI service sungguhan nanti.
// Pendekatan saat ini: weighted skill coverage.
//   score = (Σ bobot skill dibutuhkan yang dimiliki) / (Σ bobot dibutuhkan) * 100
//   gap   = skill dibutuhkan tetapi TIDAK dimiliki mahasiswa

export interface SkillRef {
  id: string;
  name: string;
}

export interface RequiredSkill {
  skillId: string;
  name: string;
  weight?: number; // default 1
}

export interface MatchResult {
  score: number; // 0..100 (dibulatkan)
  matchedSkills: SkillRef[];
  missingSkills: SkillRef[]; // skill gap yang perlu di-highlight
  totalRequired: number;
  totalMatched: number;
}

/**
 * Hitung kecocokan antara skill mahasiswa dan skill yang dibutuhkan lowongan.
 * @param ownedSkillIds daftar skillId yang dimiliki mahasiswa
 * @param required      daftar skill yang dibutuhkan lowongan (boleh berbobot)
 */
export function computeMatch(
  ownedSkillIds: Iterable<string>,
  required: RequiredSkill[],
): MatchResult {
  const owned = new Set(ownedSkillIds);

  const matchedSkills: SkillRef[] = [];
  const missingSkills: SkillRef[] = [];
  let weightTotal = 0;
  let weightMatched = 0;

  for (const r of required) {
    const w = r.weight && r.weight > 0 ? r.weight : 1;
    weightTotal += w;
    if (owned.has(r.skillId)) {
      weightMatched += w;
      matchedSkills.push({ id: r.skillId, name: r.name });
    } else {
      missingSkills.push({ id: r.skillId, name: r.name });
    }
  }

  // Lowongan tanpa syarat skill: tidak bisa dihitung kecocokannya.
  const score =
    weightTotal === 0 ? 0 : Math.round((weightMatched / weightTotal) * 100);

  return {
    score,
    matchedSkills,
    missingSkills,
    totalRequired: required.length,
    totalMatched: matchedSkills.length,
  };
}

/**
 * Urutkan banyak item (lowongan ATAU kandidat) berdasarkan skor tertinggi.
 * Generic supaya bisa dipakai dua arah (rekomendasi lowongan & rekomendasi kandidat).
 */
export function rankByMatch<T>(
  items: T[],
  getOwned: (item: T) => Iterable<string>,
  getRequired: (item: T) => RequiredSkill[],
): Array<T & { match: MatchResult }> {
  return items
    .map((item) => ({
      ...item,
      match: computeMatch(getOwned(item), getRequired(item)),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

/**
 * Hitung frekuensi kemunculan skill dari kumpulan daftar skill (mis. seluruh
 * lowongan aktif) -> untuk dashboard tren skill Kaprodi.
 */
export function aggregateSkillFrequency(
  skillLists: Array<Array<{ skillId: string; name: string }>>,
): Array<{ skillId: string; name: string; count: number }> {
  const counter = new Map<string, { name: string; count: number }>();
  for (const list of skillLists) {
    for (const s of list) {
      const prev = counter.get(s.skillId);
      if (prev) prev.count += 1;
      else counter.set(s.skillId, { name: s.name, count: 1 });
    }
  }
  return Array.from(counter.entries())
    .map(([skillId, v]) => ({ skillId, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count);
}