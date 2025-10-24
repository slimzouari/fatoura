# Fatoura - Invoice Management System

## Architecture Overview
This is a Next.js 16.0.0 app with App Router for building an invoice management system. Uses TypeScript, Tailwind CSS v4, and system fonts (no Google Fonts to avoid Turbopack issues).

## Key Project Structure
- `src/app/` - App Router pages and layouts
- `src/app/layout.tsx` - Root layout with system fonts and dark mode support
- `src/app/page.tsx` - Landing page with Next.js starter content
- `src/app/globals.css` - CSS variables for theming and Tailwind imports

## Critical Development Commands
```bash
npm run dev  # Uses NEXT_TURBOPACK_DISABLED=1 to avoid font loading issues
npm run build
npm run lint  # ESLint with Next.js TypeScript config
```

## Project-Specific Patterns

### Styling & Theming
- Uses CSS variables in `globals.css` for `--background`/`--foreground` with dark mode support
- Tailwind v4 with PostCSS plugin (`@tailwindcss/postcss`)
- System fonts via `font-sans` class instead of Google Fonts
- Dark mode via `prefers-color-scheme` media queries

### TypeScript Configuration
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled with Next.js plugin
- Target ES2017 with bundler module resolution

### Known Issues & Workarounds
- **Turbopack disabled**: `NEXT_TURBOPACK_DISABLED=1` in dev script to prevent Google Fonts module resolution errors
- **Font strategy**: Deliberately using system fonts instead of `next/font/google` to avoid Turbopack compatibility issues

### ESLint Setup
- Uses flat config (`eslint.config.mjs`) with Next.js core web vitals and TypeScript rules
- Custom global ignores for Next.js build directories

## File Naming Conventions
- React components use PascalCase exports (`Home`, `RootLayout`)
- CSS uses kebab-case custom properties (`--color-background`)
- Config files use `.mjs` extension for ESM compatibility

When building invoice features, prioritize TypeScript safety, responsive Tailwind classes, and App Router patterns. The system is set up to avoid font loading complexities that can break the dev server.