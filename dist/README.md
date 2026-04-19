# HUSTI Elite

This app now supports two modes:

- Local mode with `localStorage`
- Cloud sync mode with Supabase auth plus a per-user JSON state row

## Local run

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Supabase setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Supabase Auth, keep Email auth enabled.
4. Add your project URL and anon key to [`supabase-config.js`](./supabase-config.js), or set `SUPABASE_URL` and `SUPABASE_ANON_KEY` during deployment.

## Deploy

The project includes both [`vercel.json`](./vercel.json) and [`netlify.toml`](./netlify.toml).

- Vercel build command: `npm run build`
- Vercel output directory: `dist`
- Netlify build command: `npm run build`
- Netlify publish directory: `dist`

If you set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the hosting platform, the build step writes them into `dist/supabase-config.js`.
