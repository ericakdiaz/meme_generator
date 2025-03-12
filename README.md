# AI Meme Generator

A fun web application that generates AI-powered memes using DALL-E 3. Users can generate new memes, upvote/downvote them, and view trending memes.

## Features

- Generate AI-powered memes using DALL-E 3
- Upvote and downvote memes
- View trending memes
- Responsive design
- PostgreSQL database for storing memes and votes

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your database and OpenAI API credentials:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- OpenAI API (DALL-E 3)
- React Icons

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `OPENAI_API_KEY`: Your OpenAI API key

## License

MIT
