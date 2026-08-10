import prisma from "../../config/prisma";
import Papa from "papaparse";
import { hashPassword } from "../../utils/password";
import { ROLES, USER_STATUS } from "../../constants";
import { HttpError } from "../../utils/httpError";
import { AddStudentManualInput } from "./import.validation";

// Tambah 1 mahasiswa manual. Password default = NIM.
export const addStudentManual = async (
  input: AddStudentManualInput,
  universityId: string | null,
) => {
  // cek email & NIM belum dipakai
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) throw new HttpError(409, "Email sudah terdaftar");
  const existingNim = await prisma.student.findUnique({ where: { nim: input.nim } });
  if (existingNim) throw new HttpError(409, "NIM sudah terdaftar");

  // password default = NIM (mahasiswa diharapkan segera menggantinya)
  const hashed = await hashPassword(input.nim);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: ROLES.STUDENT,
      status: USER_STATUS.ACTIVE,
      student: {
        create: {
          nim: input.nim,
          major: input.major,
          semester: input.semester,
          faculty: input.faculty,
          entryYear: input.entryYear,
          gpa: input.gpa,
          universityId,
        },
      },
    },
    include: { student: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    student: user.student,
    defaultPasswordInfo: "Password default = NIM",
  };
};

// Import banyak mahasiswa dari CSV.
// Kolom diharapkan: name, email, nim, major, semester
// Pakai transaksi: semua baris valid di-insert atomik.
interface CsvRow {
  name?: string;
  email?: string;
  nim?: string;
  major?: string;
  semester?: string;
  faculty?: string;
  entryyear?: string;   // header di-lowercase, jadi "entryYear" jadi "entryyear"
  gpa?: string;
}

export const importStudentsCsv = async (
  csvContent: string,
  universityId: string | null,
) => {
  const parsed = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(), // header tidak peka huruf besar/spasi
  });

  if (parsed.errors.length > 0) {
    throw new HttpError(400, `Format CSV tidak valid: ${parsed.errors[0].message}`);
  }

  const rows = parsed.data;
  if (rows.length === 0) throw new HttpError(400, "CSV kosong / tidak ada data");

  // ambil email & NIM yang sudah ada di DB (untuk cek duplikat)
  const existingUsers = await prisma.user.findMany({ select: { email: true } });
  const existingEmails = new Set(existingUsers.map((u: any) => u.email.toLowerCase()));
  const existingStudents = await prisma.student.findMany({ select: { nim: true } });
  const existingNims = new Set(
    existingStudents.map((s: any) => s.nim).filter(Boolean) as string[],
  );

  const skipped: { row: number; reason: string }[] = [];
  const valid: {
    name: string; email: string; nim: string; major?: string; semester?: number; faculty?: string; entryYear?: number; gpa?: number;
  }[] = [];
  const seenEmail = new Set<string>();
  const seenNim = new Set<string>();

  rows.forEach((r, idx) => {
    const rowNum = idx + 2; // +2: baris 1 = header, index mulai 0
    const name = r.name?.trim();
    const email = r.email?.trim().toLowerCase();
    const nim = r.nim?.trim();

    if (!name || !email || !nim) {
      skipped.push({ row: rowNum, reason: "name/email/nim kosong" });
      return;
    }
    if (existingEmails.has(email) || seenEmail.has(email)) {
      skipped.push({ row: rowNum, reason: `email ${email} duplikat` });
      return;
    }
    if (existingNims.has(nim) || seenNim.has(nim)) {
      skipped.push({ row: rowNum, reason: `NIM ${nim} duplikat` });
      return;
    }
    seenEmail.add(email);
    seenNim.add(nim);

    let semester: number | undefined = undefined;
    if (r.semester) {
      const n = parseInt(r.semester, 10);
      if (Number.isFinite(n)) semester = n;
    }

    let entryYear: number | undefined = undefined;
    if (r.entryyear) {
      const n = parseInt(r.entryyear, 10);
      if (Number.isFinite(n)) entryYear = n;
    }
    let gpa: number | undefined = undefined;
    if (r.gpa) {
      const n = parseFloat(r.gpa);
      if (Number.isFinite(n) && n >= 0 && n <= 4) gpa = n;
    }

    valid.push({
      name, email, nim,
      major: r.major?.trim() || undefined,
      semester,
      faculty: r.faculty?.trim() || undefined,
      entryYear,
      gpa,
    });
  });

  // pre-hash password (= NIM) di LUAR transaksi.
  // bcrypt itu berat; jangan menahan transaksi terlalu lama.
 const prepared: Array<{
    name: string;
    email: string;
    nim: string;
    faculty?: string; 
    entryYear?: number; 
    gpa?: number;
    major?: string;
    semester?: number;
    hashed: string;
  }> = [];
  for (const v of valid) {
    prepared.push({ ...v, hashed: await hashPassword(v.nim) });
  }

  // insert semua yang valid dalam SATU transaksi (atomik).
  let createdCount = 0;
  if (prepared.length > 0) {
    await prisma.$transaction(
      async (tx: any) => {
        for (const v of prepared) {
          await tx.user.create({
            data: {
              name: v.name,
              email: v.email,
              password: v.hashed,
              role: ROLES.STUDENT,
              status: USER_STATUS.ACTIVE,
              student: {
                create: {
                  nim: v.nim,
                  major: v.major,
                  semester: v.semester,
                  universityId,
                  faculty: v.faculty,
                  entryYear: v.entryYear,
                  gpa: v.gpa,
                },
              },
            },
          });
          createdCount++;
        }
      },
      { timeout: 20000 }, // beri waktu lebih untuk batch besar
    );
  }

  return {
    totalRows: rows.length,
    createdCount,
    skippedCount: skipped.length,
    skipped,
    defaultPasswordInfo: "Password default tiap mahasiswa = NIM masing-masing",
  };
};