-- CreateTable
CREATE TABLE "Meme" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "template" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Meme_pkey" PRIMARY KEY ("id")
);
