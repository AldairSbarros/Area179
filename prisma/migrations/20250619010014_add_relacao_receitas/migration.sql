-- CreateTable
CREATE TABLE "Receita" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "observacao" TEXT,
    "codigoManual" TEXT,
    "congregacaoId" INTEGER NOT NULL,

    CONSTRAINT "Receita_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Receita" ADD CONSTRAINT "Receita_congregacaoId_fkey" FOREIGN KEY ("congregacaoId") REFERENCES "Congregacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
