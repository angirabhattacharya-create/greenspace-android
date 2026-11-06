-- Paw & Petal: shared marketplace foundation
-- Apply in the Supabase SQL Editor or with Supabase CLI.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','partner','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table if not exists public.partner_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text,
  partner_type text not null check (partner_type in (
    'gardening_professional','nursery_seller','plant_expert',
    'pet_groomer','dog_walker','pet_sitter','boarding_provider',
    'veterinary_professional','veterinary_clinic'
  )),
  description text,
  service_area text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending','under_review','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id text primary key,
  name text not null,
  vertical text not null check (vertical in ('gardening','pet_care')),
  is_active boolean not null default true
);

create table if not exists public.services (
  id text primary key,
  category_id text not null references public.service_categories(id),
  name text not null,
  description text,
  starting_price numeric(10,2) not null default 0 check (starting_price >= 0),
  price_unit text not null default 'per service',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_categories (id,name,vertical) values
 ('gardening','Plants & Gardening','gardening'),
 ('pet_care','Pets & Animal Care','pet_care')
on conflict (id) do nothing;

insert into public.services (id,category_id,name,description,starting_price,price_unit) values
 ('video-consultation','gardening','Video consultation','Speak with a gardening expert',299,'per session'),
 ('repotting','gardening','Repotting','Fresh soil and suitable potting advice',199,'starting price'),
 ('pruning','gardening','Pruning & trimming','Plant pruning and shaping',249,'starting price'),
 ('garden-cleanup','gardening','Garden cleanup','Basic garden cleanup',299,'starting price'),
 ('monthly-garden-care','gardening','Monthly garden care','Scheduled recurring maintenance',999,'per month'),
 ('plant-doctor','gardening','Plant Doctor consultation','Help identify plant health problems',199,'per session'),
 ('pet-grooming','pet_care','Pet grooming','Bathing, brushing and basic grooming',599,'starting price'),
 ('dog-walking','pet_care','Dog walking','Scheduled dog walking',199,'per walk'),
 ('pet-sitting','pet_care','Pet sitting','In-home companion animal care',499,'starting price'),
 ('veterinary-appointment','pet_care','Veterinary appointment','Request an appointment with a veterinary professional',0,'appointment')
on conflict (id) do nothing;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  partner_id uuid references public.partner_profiles(id),
  service_id text not null references public.services(id),
  service_address text not null,
  preferred_at timestamptz not null,
  customer_notes text,
  status text not null default 'requested'
    check (status in ('requested','pending_confirmation','confirmed','partner_assigned','in_progress','completed','cancelled','rejected')),
  quoted_amount numeric(10,2) check (quoted_amount is null or quoted_amount >= 0),
  final_amount numeric(10,2) check (final_amount is null or final_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_customer_created_idx on public.bookings(customer_id, created_at desc);
create index if not exists bookings_partner_status_idx on public.bookings(partner_id, status);
create index if not exists bookings_preferred_at_idx on public.bookings(preferred_at);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  old_status text,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.partner_service_areas (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_profiles(id) on delete cascade,
  area_name text not null,
  postal_code text,
  created_at timestamptz not null default now(),
  unique (partner_id, area_name, postal_code)
);

alter table public.profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
alter table public.partner_service_areas enable row level security;

create policy "Users can read their own profile" on public.profiles
 for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "Users can create their own profile" on public.profiles
 for insert to authenticated with check (id = (select auth.uid()) and role = 'customer');
create policy "Users can update their own basic profile" on public.profiles
 for update to authenticated using (id = (select auth.uid()) or public.is_admin())
 with check (id = (select auth.uid()) or public.is_admin());

create policy "Partners can read own partner profile" on public.partner_profiles
 for select to authenticated using (id = (select auth.uid()) or public.is_admin());
create policy "Users can apply as partners" on public.partner_profiles
 for insert to authenticated with check (
   id = (select auth.uid()) and verification_status = 'pending'
 );
create policy "Partners can update own application while pending" on public.partner_profiles
 for update to authenticated using (id = (select auth.uid()) and verification_status in ('pending','under_review'))
 with check (id = (select auth.uid()) and verification_status in ('pending','under_review'));

create policy "Active service categories are public" on public.service_categories
 for select to anon, authenticated using (is_active or public.is_admin());
create policy "Active services are public" on public.services
 for select to anon, authenticated using (is_active or public.is_admin());

create policy "Customers can create their own bookings" on public.bookings
 for insert to authenticated with check (
   customer_id = (select auth.uid()) and partner_id is null and status = 'requested'
 );
create policy "Customers partners and admins can read relevant bookings" on public.bookings
 for select to authenticated using (
   customer_id = (select auth.uid())
   or partner_id = (select auth.uid())
   or public.is_admin()
 );

create policy "Relevant users can read booking events" on public.booking_events
 for select to authenticated using (
   exists (
     select 1 from public.bookings b
     where b.id = booking_id
       and (b.customer_id = (select auth.uid()) or b.partner_id = (select auth.uid()))
   ) or public.is_admin()
 );

create policy "Partners can read own service areas" on public.partner_service_areas
 for select to authenticated using (partner_id = (select auth.uid()) or public.is_admin());
create policy "Partners can add own service areas" on public.partner_service_areas
 for insert to authenticated with check (partner_id = (select auth.uid()));

-- No client-side role escalation or direct booking reassignment is provided.
-- Admin workflows and partner assignment will be implemented through trusted server-side functions.
