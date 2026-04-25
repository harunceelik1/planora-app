This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

TODO

1. Dashboard -> home olabilir (naming)
2. Home kısmını kaldır
3. Login olduktan sonra project sayfasına gitsin, project yok ise create new project ekranı gelsin, proje var ise var olan projeler listelensin ve sağ üstte yeni proje oluşturabileceği bir buton olsun yeni proje oluşturma akışına girsin. proje oluşturulduktan sonra tekrar project ekranına geri dönsün.

## Production: Rate limiting and Upstash

This project includes an optional Redis-backed rate limiter that integrates with Upstash. To enable it in production, set the following environment variables in your deployment:

- `UPSTASH_REDIS_REST_URL` — Upstash REST URL
- `UPSTASH_REDIS_REST_TOKEN` — Upstash REST token

If these are not set, the app falls back to an in-memory rate limiter (not suitable for multi-instance production). The primary use is to protect AI endpoints like `POST /api/ai/decompose`.

Recommended steps for production:

1. Create an Upstash Redis instance and copy the REST URL & token.
2. Add them to your deployment environment settings (Vercel/Netlify/etc.).
3. Ensure `GOOGLE_GEMINI_KEY` and `DATABASE_URL` are also configured.

Note: In-memory fallback is useful for local development but will not synchronize across multiple server instances.
