import prisma from "../config/prisma";
import { embedTexts } from "../config/aiService";

const BATCH = 32;

const main = async () => {
  const rows = await prisma.jobRequirement.findMany({
    where: { embedding: null },
    select: { id: true, requirement: true },
  });

  console.log(`Ditemukan ${rows.length} requirement tanpa embedding.`);
  if (rows.length === 0) return;

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const vectors = await embedTexts(chunk.map((r) => r.requirement));

    if (!vectors || vectors.length !== chunk.length) {
      console.error("Gagal mendapatkan embedding. Pastikan ai-service berjalan di port 8000.");
      return;
    }

    // vectors sudah dipastikan tidak null oleh penjaga di atas
    const vecs = vectors;
    await Promise.all(
      chunk.map((r, j) =>
        prisma.jobRequirement.update({
          where: { id: r.id },
          data: { embedding: JSON.stringify(vecs[j]) },
        }),
      ),
    );
    console.log(`  ${Math.min(i + BATCH, rows.length)}/${rows.length} selesai`);
  }

  console.log("Backfill selesai.");
};

main().finally(() => prisma.$disconnect());