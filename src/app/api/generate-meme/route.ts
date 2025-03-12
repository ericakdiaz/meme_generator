import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to parse metadata from URL
function parseMetadata(imageUrl: string) {
  try {
    if (imageUrl.startsWith("METADATA:")) {
      const [_, category, concept, url] = imageUrl.split(":");
      return {
        category,
        template: decodeURIComponent(concept),
        imageUrl: url,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  // Approximate characters that fit on one line (Impact font is roughly square)
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function addTextToImage(
  imageUrl: string,
  topText: string,
  bottomText: string
): Promise<Buffer> {
  // Download the image
  const response = await fetch(imageUrl);
  const imageBuffer = await response.arrayBuffer();

  // Use the full 1024x1024 size from DALL-E
  const targetSize = 1024;

  // Create a sharp instance and resize
  const image = sharp(Buffer.from(imageBuffer));

  // First resize the image
  const resizedImage = await image
    .resize(targetSize, targetSize, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toBuffer();

  // Get the dimensions of the resized image
  const metadata = await sharp(resizedImage).metadata();
  const width = metadata.width || targetSize;
  const height = metadata.height || targetSize;

  // Calculate font size based on image height
  const fontSize = Math.max(32, Math.min(64, Math.floor(height * 0.08)));

  // Wrap text to fit width
  const topLines = wrapText(topText, width, fontSize);
  const bottomLines = wrapText(bottomText, width, fontSize);

  // Create SVG text overlay with the same dimensions as the resized image
  const svgImage = `
    <svg width="${width}" height="${height}">
      <style>
        .title { 
          fill: white; 
          font-size: ${fontSize}px; 
          font-weight: bold; 
          font-family: Impact;
          text-transform: uppercase;
        }
        .outline {
          stroke: black;
          stroke-width: ${fontSize * 0.05}px;
          stroke-linejoin: round;
        }
      </style>
      ${topLines
        .map((line, i) => {
          const y = 8 + (i + 1) * fontSize;
          return `
          <text x="50%" y="${y}" text-anchor="middle" class="title outline">${line}</text>
          <text x="50%" y="${y}" text-anchor="middle" class="title">${line}</text>
        `;
        })
        .join("")}
      ${bottomLines
        .map((line, i) => {
          const y = height - (bottomLines.length - i) * fontSize - 8;
          return `
          <text x="50%" y="${y}" text-anchor="middle" class="title outline">${line}</text>
          <text x="50%" y="${y}" text-anchor="middle" class="title">${line}</text>
        `;
        })
        .join("")}
    </svg>`;

  // Composite the text overlay onto the resized image
  const finalImage = await sharp(resizedImage)
    .composite([
      {
        input: Buffer.from(svgImage),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  return finalImage;
}

export async function POST() {
  try {
    const conceptCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a meme creator specializing in universally relatable content. Create memes that everyone can enjoy and relate to.
          
          Rules for meme text:
          - Text should be in ALL CAPS
          - Make it funny and relatable
          - Each line can be any length that fits well on a meme
          
          Focus on making relatable, funny memes about:
          - Daily life moments
          - Social situations
          - Food and eating
          - Sleep and tiredness
          - Weekend vs workday
          - Weather and seasons
          - Shopping and money
          - Relationships and friendship
          - Pop culture references
          - Pet behavior
          
          Return ONLY a JSON object with this exact format:
          {
            "concept": "Brief description of the meme concept",
            "category": "daily-life/social/food/pets/weather/relationships",
            "style": "Visual style description for the image",
            "top": "TOP TEXT IN CAPS",
            "bottom": "BOTTOM TEXT IN CAPS",
            "reasoning": "Brief explanation of why this concept is relatable"
          }`,
        },
        {
          role: "user",
          content:
            "Generate a universally relatable meme that anyone can enjoy.",
        },
      ],
    });

    if (!conceptCompletion.choices[0].message.content) {
      throw new Error("Failed to generate meme concept");
    }

    const memeData = JSON.parse(conceptCompletion.choices[0].message.content);

    // Validate required fields
    if (
      !memeData.concept ||
      !memeData.category ||
      !memeData.top ||
      !memeData.bottom
    ) {
      throw new Error("Invalid meme concept format");
    }

    // Generate image using DALL-E with insights from successful memes
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a relatable meme image (WITHOUT ANY TEXT) based on this concept: ${memeData.concept}
      Visual style: ${memeData.style}
      
      This concept is relatable because: ${memeData.reasoning}
      
      Requirements:
      1. The image should be humorous and instantly relatable
      2. Focus on everyday situations and universal experiences
      3. DO NOT ADD ANY TEXT TO THE IMAGE
      4. Leave space at the top and bottom for text overlay
      5. Make it feel like a classic meme template
      6. Keep it clean and family-friendly
      
      Make the image expressive and emotionally resonant while maintaining good meme aesthetics.
      
      IMPORTANT: DO NOT ADD ANY TEXT OR CAPTIONS TO THE IMAGE`,
      n: 1,
      size: "1024x1024", // We'll resize it later in addTextToImage
    });

    const imageUrl = response.data[0].url as string;
    if (!imageUrl) {
      throw new Error("Failed to generate image URL");
    }

    // Add text overlay to the image
    const finalImageBuffer = await addTextToImage(
      imageUrl,
      memeData.top,
      memeData.bottom
    );

    // Save the final image to a temporary file
    const tmpDir = path.join(process.cwd(), "tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    const fileName = `meme-${Date.now()}.png`;
    const filePath = path.join(tmpDir, fileName);
    await fs.writeFile(filePath, finalImageBuffer);

    // Use the correct API route path for serving the image
    const finalImageUrl = `/api/tmp/${fileName}`;

    // Save to database with all required fields
    const meme = await prisma.meme.create({
      data: {
        imageUrl: `METADATA:${memeData.category}:${encodeURIComponent(
          memeData.concept
        )}:${finalImageUrl}`,
        votes: 0,
        template: memeData.concept,
        category: memeData.category,
      },
    });

    return NextResponse.json({
      ...meme,
      reasoning: memeData.reasoning,
    });
  } catch (error) {
    console.error("Error generating meme:", error);
    let errorMessage = "Failed to generate meme";

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (error && typeof error === "object" && "response" in error) {
      errorMessage = `OpenAI API Error: ${JSON.stringify(error)}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
