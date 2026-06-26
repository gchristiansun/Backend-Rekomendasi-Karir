// import prisma from '../src/config/prisma'
// import pl from 'nodejs-polars'

// async function main() {
//   console.log('Reading parquet file')

//   const df = pl.readParquet('./data_seeds/clos_encoded.parquet');

//   console.log(`Rows found: ${df.height}`)

//   const rows = df.toRecords() as any[];

//   const batchSize = 1000;

//   for (let i = 0; i < rows.length; i += batchSize) {
//     const batch = rows.slice(i, i + batchSize);

//     await prisma.cLOEmbedding.createMany({
//       data: batch.map((row) => ({
//         mata
//       }))
//     })
//   }
// }





