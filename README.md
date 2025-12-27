# Lillian Ruff Pet Spa Website

Official website for Lillian Ruff Pet Spa - Premium pet grooming services.

## Live Site

**[https://lillian-ruff-website.vercel.app/](https://lillian-ruff-website.vercel.app/)**

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Hosting & deployment

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Copy `.env.example` to `.env` and configure the required variables.

## Project Structure

```
/
├── public/          # Static assets (images, favicon, etc.)
├── src/
│   ├── components/  # Reusable UI components
│   ├── layouts/     # Page layouts
│   └── pages/       # Route pages
├── astro.config.mjs # Astro configuration
└── package.json
```

## Deployment

The site automatically deploys to Vercel on push to the main branch.
