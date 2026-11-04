# Highbrow Shop

A Next.js 14 + TypeScript + Tailwind starter for `shop.highbrowdirector.in`.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel; framework preset should be Next.js.
3. Deploy, then add `shop.highbrowdirector.in` in Vercel Project Settings → Domains.
4. Add the DNS record Vercel requests at your DNS provider (typically a CNAME for `shop` pointing to `cname.vercel-dns.com`; follow the exact value shown in Vercel).
5. Wait for DNS verification and HTTPS provisioning.

## Before applying to Amazon Associates

- Replace the starter articles with original, genuinely useful and fact-checked content. The current guides are scaffolding, not finished reviews or proof of hands-on testing.
- Add author/editorial information and real contact details. Verify the email address shown in the site.
- Add real product research, comparison criteria, clear pros/cons and sources where appropriate.
- Use only your own or properly licensed images. Current Unsplash images are illustrative remote image URLs; verify usage rights and consider replacing with your own licensed assets.
- Add Amazon affiliate links only after the correct Associates account is approved and the required link disclosures are in place.
- Ensure the exact Amazon-required Associate disclosure remains visible on the site and near relevant affiliate content where required.
- Update the privacy policy to reflect the actual analytics, cookies, hosting and other services you enable. Legal pages are starter text, not legal advice.
- Confirm your Associates account status with Amazon before creating another account if the previous one was terminated. Do not try to bypass an account closure.

## Content editing

Edit article data in `lib/content.ts`. Add full article pages under `app/guides/[slug]/page.tsx` or replace the starter template with a CMS when ready.
