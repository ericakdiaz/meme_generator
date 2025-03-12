import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PAGE_SIZE = 9;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page");
    const pageNum = page ? parseInt(page, 10) : 0;

    if (page && isNaN(pageNum)) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }

    const memes = await prisma.meme.findMany({
      skip: pageNum * PAGE_SIZE,
      take: PAGE_SIZE + 1,
      orderBy: [{ votes: "desc" }, { id: "desc" }],
      select: {
        id: true,
        imageUrl: true,
        votes: true,
        createdAt: true,
      },
    });

    const hasNextPage = memes.length > PAGE_SIZE;
    if (hasNextPage) {
      memes.pop(); // Remove the extra item we fetched
    }

    return NextResponse.json({
      items: memes,
      nextPage: hasNextPage ? (pageNum + 1).toString() : null,
    });
  } catch (error) {
    console.error("Error fetching trending memes:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending memes" },
      { status: 500 }
    );
  }
}
