import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { memeId, voteType } = await request.json();

    const updatedMeme = await prisma.meme.update({
      where: { id: memeId },
      data: {
        votes: {
          increment: voteType === "up" ? 1 : -1,
        },
      },
    });

    return NextResponse.json(updatedMeme);
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json(
      { error: "Failed to update vote" },
      { status: 500 }
    );
  }
}
