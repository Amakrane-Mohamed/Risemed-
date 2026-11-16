# RISE MED

Entrepreneurship and social innovation learning for young people in Tunisia.

## Local preview

Run `npm install`, then `npm run build`. Serve this directory with `python3 -m http.server 8000` and open `http://localhost:8000`.

- Landing page: `/`
- Sign in: `/app.html#/login`
- Create account: `/app.html#/signup`

`npm run dev` also serves the project through Vite. Run `npm run build` after editing the React account screens.

## UI

The landing page and workspace use the existing HTML/CSS/JavaScript application. Login, registration and the four-step profile setup are React screens in `ui/main.jsx`, using GSAP, Tailwind CSS and official [shadcn/ui](https://ui.shadcn.com/) components in `ui/components/ui/` (Radix primitives). The production bundle in `ui-dist/` is included so the site still works with a static server.

The account screens use the existing Supabase integration and profile metadata. Posts, memberships, example lesson progress and funding requests remain browser-local. The questionnaire saves each completed step and supports both youth and investor accounts.

## Checks

`npm test` builds the UI and checks login rendering, password visibility, role selection, both questionnaire paths, progress, review, back navigation, saved values and authentication/workspace handoff in a DOM environment. `npm run check` validates legacy JavaScript syntax. These checks do not replace browser visual QA.
