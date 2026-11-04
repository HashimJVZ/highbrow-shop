-- Highbrow Shop product catalogue + admin access.
-- Run this in Supabase SQL Editor. Never put the service-role key in the website.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null default '',
  category text not null default 'Accessories',
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  amazon_url text not null default '',
  price_note text not null default '',
  specifications jsonb not null default '{}'::jsonb,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone can read published products. Only users whose app_metadata.role is admin can manage products.
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products" on public.products
  for select using (status = 'published' or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
  for insert with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
  for update using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
  for update using (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
