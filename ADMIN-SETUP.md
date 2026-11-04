# Highbrow Shop admin setup

The admin dashboard uses Supabase for authentication, the product database, and product-image storage. The browser uses only the Supabase **anon/public** key. Never add a Supabase service-role key to `.env.local`, Vercel, or client-side code.

## 1. Create a Supabase project

1. Create a project at https://supabase.com/dashboard.
2. Open **Project Settings → API** and copy the Project URL and `anon` / publishable key.
3. In the project root, copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
   ```

4. Add the same two environment variables in Vercel → Project → Settings → Environment Variables for Production, Preview, and Development.

## 2. Create the database and image bucket

1. In Supabase, open **SQL Editor → New query**.
2. Paste and run the contents of `supabase-schema.sql`.
3. This creates the `products` table, row-level security policies, and a public `product-images` bucket. Public visitors can read only published products. Only authenticated users with the admin app-metadata role can create, edit, publish, or delete products and upload images.

Run the SQL once on a new Supabase project. If you rerun it, remove existing policies first or convert the policy statements to `drop policy if exists` + `create policy`.

## 3. Create your admin login

1. In Supabase, open **Authentication → Users → Add user**.
2. Create the email/password account you will use for Highbrow Shop administration. Confirm the user if your project requires email confirmation.
3. Open **SQL Editor** and run the following, replacing the email with your admin email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'YOUR-ADMIN-EMAIL@example.com';
   ```

4. Sign in at `https://shop.highbrowdirector.in/admin`.
5. If you were already signed in before granting the role, sign out and sign in again so the refreshed token contains the admin role.

Do not grant the admin role through user-editable `user_metadata`. The dashboard checks the protected `app_metadata.role` claim and the database independently enforces it with RLS.

## 4. Add products

Open `/admin`, sign in, and use the product form. You can:

- add a name, brand, category, descriptions, specifications, pros and cons;
- upload a JPG, PNG, or WebP image up to 5 MB, or provide an image URL;
- add the Amazon product URL and a non-price-specific price note;
- save as Draft or publish immediately;
- feature products and edit/delete existing listings.

Published products appear at `/products` and each gets a detail page at `/products/<slug>`. Drafts remain private to admins.

## 5. Deploy

Commit and push the changes, then redeploy in Vercel. Make sure the two `NEXT_PUBLIC_SUPABASE_*` environment variables are present in Vercel before deploying. After changing Vercel environment variables, trigger a new deployment.

## Notes

- Use your valid Amazon Associates tracking URL only after the correct Associates account is approved and active.
- Keep product claims, specifications, pros/cons, and images accurate. Do not claim hands-on testing unless you actually tested the product.
- The product image bucket is public by design so product images can appear on the public catalogue; uploads and deletes are admin-only.
- The admin route is excluded from search indexing, and the database is the actual security boundary. Do not rely on hiding the admin URL as security.
