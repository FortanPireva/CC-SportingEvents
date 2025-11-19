# CC Sporting Events - Frontend

React + Vite + TypeScript frontend for the CC Sporting Events platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Update the `VITE_API_URL` if your backend is running on a different port

3. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable components
├── pages/           # Page components
├── services/        # API services
├── hooks/           # Custom React hooks
├── stores/          # Zustand state stores
├── types/           # TypeScript types
├── utils/           # Helper functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client

