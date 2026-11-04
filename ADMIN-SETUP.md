# Highbrow Shop admin setup

The admin dashboard uses Supabase Auth, PostgreSQL and Storage. The browser uses only the Supabase publishable key. Never put a Supabase secret or service-role key in a `NEXT_PUBLIC_*` variable or client-side code.

## Environment

Set these variables in Vercel for Production, Preview and Development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

They are already configured for the Highbrow Shop Vercel project.

## Admin account

The administrator account is `highbrowdirector@gmail.com`. Create/confirm that user in Supabase Authentication → Users, then ensure its user ID is present in `public.admin_users`. The dashboard checks this table after sign-in; it does not trust editable user metadata.

## Database and storage

The production Supabase project has these tables:

- `products`: product details, Amazon URL, specs, pros/cons, draft/published status and featured flag.
- `categories`: catalogue categories.
- `my_setup_items`: items and hotspot coordinates for the My Setup page.
- `admin_users`: users permitted to administer the site.

Row Level Security is enabled. Visitors can read published products and visible setup items. Only users in `admin_users` can manage catalogue data and upload images to the public `product-images` bucket. Image uploads are limited to 5 MB and supported image formats.

## Admin dashboard

Visit `https://shop.highbrowdirector.in/admin` and sign in with the administrator email and password. The dashboard supports creating, editing, publishing, featuring and deleting products, plus image uploads. Product records appear on `/products` and `/products/<slug>`.

## Notes

- Keep product claims, specifications, pros/cons and images accurate. Do not claim hands-on testing unless you actually tested the product.
- Use valid Amazon Associates tracking links only while the relevant Associates account is active and approved.
- The image bucket is public for product image delivery; writes are admin-only.
