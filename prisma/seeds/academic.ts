import { SeedContext } from './types'

type AcademicInput = {
  prodi: any
}

export default async function seedAcademic(
  { prisma }: SeedContext, 
  { prodi }: AcademicInput
) {
  const curriculum = await prisma.curriculum_versions.create({
    data: {
      prodi_id: prodi.id,
      year: 2025,
      active: true
    }
  })

  const matkul = await prisma.matkul.create({
    data: {
      kode: 'IF101',
      nama: 'Dasar Pemrograman',
      sks: 3,
      semester: 1,
      prodi_id: prodi.id,
      curriculum_version_id: curriculum.id
    }
  })

  const clo = await prisma.clos.create({
    data: {
      matkul_id: matkul.id,
      clo_code: 'CLO1',
      clo_text: 'Mahasiswa mampu memahami dasar pemrograman'
    }
  })

  return {
    curriculum,
    matkul,
    clo
  }
}