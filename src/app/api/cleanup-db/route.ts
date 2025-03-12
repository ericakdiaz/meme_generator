import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Delete memes where imageUrl doesn't start with METADATA: or contains direct DALL-E URLs
    const deletedMemes = await prisma.meme.deleteMany({
      where: {
        OR: [
          {
            NOT: {
              imageUrl: {
                startsWith: "METADATA:",
              },
            },
          },
          {
            imageUrl: {
              contains: "oaidalleapiprodscus.blob.core.windows.net",
            },
          },
        ],
      },
    });

    return NextResponse.json({
      message: `Successfully deleted ${deletedMemes.count} invalid memes`,
      count: deletedMemes.count,
    });
  } catch (error) {
    console.error("Error cleaning up database:", error);
    return NextResponse.json(
      { error: "Failed to clean up database" },
      { status: 500 }
    );
  }
}
