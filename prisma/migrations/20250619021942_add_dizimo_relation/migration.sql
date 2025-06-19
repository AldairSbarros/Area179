-- CreateTable
CREATE TABLE "Dizimo" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovante" TEXT NOT NULL,
    "numeroRecibo" TEXT NOT NULL,

    CONSTRAINT "Dizimo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dizimo" ADD CONSTRAINT "Dizimo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
