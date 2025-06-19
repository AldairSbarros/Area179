/*
  Warnings:

  - You are about to drop the column `codigoManual` on the `Despesa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Despesa" DROP COLUMN "codigoManual",
ADD COLUMN     "notaFiscalFoto" TEXT;
