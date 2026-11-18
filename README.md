# Grind — Job Search & Career Progress Platform

Grind is a React-based job-tracking application with a companion Express API. It combines job-application management with preparation, challenges, social accountability, and leaderboard features.

## Repositories

- **Web client:** [Nashid-k/grind-client](https://github.com/Nashid-k/grind-client)
- **API server:** [Nashid-k/grind-server](https://github.com/Nashid-k/grind-server)

## Product areas

- Landing, sign-in, and authenticated dashboard experiences
- Job tracking workflows
- Preparation resources and challenges
- Friends and social accountability
- Leaderboard
- Focus timer (Grind Mode)

The client uses React 18, React Router, and Vite. Pages are lazy-loaded and authenticated routes are protected through shared authentication context.

## Local development

```bash
git clone https://github.com/Nashid-k/grind-client.git
cd grind-client
npm install
npm run dev
```

Create a production build with `npm run build` and preview it with `npm run preview`.

## Repository structure

```text
src/
├── components/   # Shared UI and Grind Mode timer
├── context/      # Authentication and job state providers
├── data/         # Application data
├── pages/        # Landing, login, dashboard, welcome, leaderboard
├── App.jsx       # Routes, providers, and lazy-loaded pages
└── main.jsx      # Client entry point
```

## Security and maintenance

Do not commit `.env` files, build output, or dependency directories. Keep API configuration and credentials out of source control.
