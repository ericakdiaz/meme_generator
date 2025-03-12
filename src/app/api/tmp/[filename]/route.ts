import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(process.cwd(), "tmp", params.filename);
    const fileBuffer = await fs.readFile(filePath);

    // Return the image with proper content type
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving meme image:", error);
    return new NextResponse("Image not found", { status: 404 });
  }
}
