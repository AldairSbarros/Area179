-- CreateTable
CREATE TABLE "Investimento" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT,
    "codigoManual" TEXT,
    "congregacaoId" INTEGER NOT NULL,

    CONSTRAINT "Investimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Investimento" ADD CONSTRAINT "Investimento_congregacaoId_fkey" FOREIGN KEY ("congregacaoId") REFERENCES "Congregacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
