-- Gym website: Supabase (PostgreSQL) schema
-- Run in Supabase Dashboard -> SQL Editor

-- ========== TABLES ==========

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'member' check (role in ('member', 'admin')),
  active boolean not null default true,          -- soft delete: removed members get active = false
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_name text not null,                       -- e.g. Monthly, Quarterly, Yearly
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now()
);

create table public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  period date not null,                          -- first day of the billing month
  amount numeric(10,2) not null,
  status text not null default 'unpaid' check (status in ('paid', 'unpaid')),
  paid_on date,
  unique (user_id, period)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.workout_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  sets int not null check (sets > 0),
  reps int not null check (reps > 0),
  performed_on date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  trainer_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index on public.workout_requests (member_id, status);
create index on public.workout_requests (status, created_at);

-- ========== HELPERS ==========

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin' and active
  );
$$;

-- Auto-create a profile row whenever a user signs up (role is always 'member' here;
-- promote the trainer to 'admin' manually, see bottom of file)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== ROW LEVEL SECURITY ==========

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.fee_payments enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_requests enable row level security;

-- profiles: member sees own row, admin sees and manages everyone
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- memberships: member reads own, admin full access
create policy "memberships_select" on public.memberships
  for select using (user_id = auth.uid() or public.is_admin());
create policy "memberships_admin_write" on public.memberships
  for all using (public.is_admin()) with check (public.is_admin());

-- fee_payments: member reads own, only admin can mark paid / unpaid
create policy "fees_select" on public.fee_payments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "fees_admin_write" on public.fee_payments
  for all using (public.is_admin()) with check (public.is_admin());

-- exercises: any logged-in user can read, only admin can add / remove
create policy "exercises_select" on public.exercises
  for select using (auth.uid() is not null);
create policy "exercises_admin_write" on public.exercises
  for all using (public.is_admin()) with check (public.is_admin());

-- workout_requests: member creates own (always pending), reads own; admin reviews
create policy "requests_select" on public.workout_requests
  for select using (member_id = auth.uid() or public.is_admin());
create policy "requests_member_insert" on public.workout_requests
  for insert with check (member_id = auth.uid() and status = 'pending');
create policy "requests_admin_update" on public.workout_requests
  for update using (public.is_admin()) with check (public.is_admin());

-- ========== MAKE THE TRAINER AN ADMIN ==========
-- 1. Sign up the trainer through the website first.
-- 2. Then run (replace the email):
--
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'trainer@example.com');
