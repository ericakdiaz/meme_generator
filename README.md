# Vibecode Meme Generator

A modern web application that generates and manages memes using AI. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- AI-powered meme generation
- Real-time meme voting system
- Trending memes page with infinite scroll
- Responsive design for all screen sizes
- Clean and modern UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma with SQLite
- **API**: Next.js API Routes
- **AI Integration**: OpenAI

## Getting Started

1. Clone the repository:

```bash
git clone [your-repo-url]
cd vibecode
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

- Copy `.env.example` to `.env`
- Add your OpenAI API key and other required variables

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file with the following variables:

```
OPENAI_API_KEY=your_api_key_here
```

## Project Structure

- `/src/app` - Next.js app router pages and components
- `/src/app/api` - API routes for meme generation and management
- `/prisma` - Database schema and migrations
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
