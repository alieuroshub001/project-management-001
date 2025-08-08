-- Enable required extensions
create extension if not exists pgcrypto;
create extension if not exists plpgsql;

-- Roles enum
create type app_role as enum ('admin', 'hr', 'team', 'client');

-- Status enums
create type task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type leave_status as enum ('pending', 'approved', 'rejected');
create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue');

-- Profiles table mapping to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role app_role not null default 'team',
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Helper functions to check role
create or replace function public.current_role() returns app_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable;

create or replace function public.is_admin() returns boolean as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$ language sql stable;

create or replace function public.is_hr() returns boolean as $$
  select coalesce((select role = 'hr' from public.profiles where id = auth.uid()), false);
$$ language sql stable;

create or replace function public.is_team() returns boolean as $$
  select coalesce((select role = 'team' from public.profiles where id = auth.uid()), false);
$$ language sql stable;

create or replace function public.is_client() returns boolean as $$
  select coalesce((select role = 'client' from public.profiles where id = auth.uid()), false);
$$ language sql stable;

-- Profiles policies
create policy "profiles self read" on public.profiles for select using (auth.uid() = id or is_admin() or is_hr());
create policy "profiles self update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles admin manage" on public.profiles for all using (is_admin()) with check (true);

-- Organizations and clients
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.organizations enable row level security;
create policy "orgs readable" on public.organizations for select using (is_admin() or is_hr() or is_team() or is_client());
create policy "orgs admin crud" on public.organizations for all using (is_admin()) with check (true);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  contact_email text,
  created_at timestamp with time zone default now()
);

alter table public.clients enable row level security;
create policy "clients readable" on public.clients for select using (true);
create policy "clients admin crud" on public.clients for all using (is_admin()) with check (true);

-- Projects and membership
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  organization_id uuid references public.organizations(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.projects enable row level security;

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text,
  primary key (project_id, user_id)
);

alter table public.project_members enable row level security;

-- Project policies
create policy "projects admin full" on public.projects for all using (is_admin()) with check (true);
create policy "projects hr read" on public.projects for select using (is_hr());
create policy "projects team member read" on public.projects for select using (
  exists (select 1 from public.project_members m where m.project_id = projects.id and m.user_id = auth.uid())
  or projects.created_by = auth.uid()
);
create policy "projects team create" on public.projects for insert with check (is_team() or is_admin() or is_hr());
create policy "projects team update own" on public.projects for update using (projects.created_by = auth.uid()) with check (projects.created_by = auth.uid());
create policy "projects team delete own" on public.projects for delete using (projects.created_by = auth.uid());
create policy "projects client read" on public.projects for select using (
  is_client() and exists (
    select 1 from public.clients c where c.id = projects.client_id
  )
);

-- Project members policies
create policy "members admin full" on public.project_members for all using (is_admin()) with check (true);
create policy "members read own" on public.project_members for select using (user_id = auth.uid());
create policy "members maintainer add self" on public.project_members for insert with check (user_id = auth.uid());
create policy "members maintainer remove self" on public.project_members for delete using (user_id = auth.uid());

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status not null default 'todo',
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table public.tasks enable row level security;
create policy "tasks admin full" on public.tasks for all using (is_admin()) with check (true);
create policy "tasks project members read" on public.tasks for select using (
  exists (select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid())
  or tasks.created_by = auth.uid()
  or tasks.assigned_to = auth.uid()
);
create policy "tasks create if member" on public.tasks for insert with check (
  exists (select 1 from public.project_members m where m.project_id = tasks.project_id and m.user_id = auth.uid())
  or is_admin()
);
create policy "tasks update own or assigned" on public.tasks for update using (
  tasks.created_by = auth.uid() or tasks.assigned_to = auth.uid() or is_admin()
) with check (true);
create policy "tasks delete own" on public.tasks for delete using (tasks.created_by = auth.uid() or is_admin());

-- Timesheets
create table if not exists public.timesheets (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  hours numeric(5,2) not null check (hours > 0),
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.timesheets enable row level security;
create policy "timesheets own crud" on public.timesheets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "timesheets admin hr read" on public.timesheets for select using (is_admin() or is_hr());

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  status invoice_status not null default 'draft',
  issued_at date default now(),
  due_date date
);

alter table public.invoices enable row level security;
create policy "invoices admin full" on public.invoices for all using (is_admin()) with check (true);
create policy "invoices client read own" on public.invoices for select using (
  is_client() and exists (select 1 from public.clients c where c.id = invoices.client_id)
);
create policy "invoices hr read" on public.invoices for select using (is_hr());

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  status text check (status in ('present','absent','remote','leave')),
  created_at timestamp with time zone default now(),
  unique (user_id, date)
);

alter table public.attendance enable row level security;
create policy "attendance self crud" on public.attendance for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "attendance admin hr read" on public.attendance for select using (is_admin() or is_hr());

-- Leaves
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  status leave_status not null default 'pending',
  created_at timestamp with time zone default now()
);

alter table public.leave_requests enable row level security;
create policy "leaves self crud" on public.leave_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "leaves hr admin manage" on public.leave_requests for update using (is_hr() or is_admin()) with check (true);
create policy "leaves hr admin read" on public.leave_requests for select using (is_hr() or is_admin());

-- Performance reviews
create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewee_id uuid references auth.users(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  rating int check (rating between 1 and 5),
  feedback text,
  created_at timestamp with time zone default now()
);

alter table public.performance_reviews enable row level security;
create policy "perf self read" on public.performance_reviews for select using (reviewee_id = auth.uid());
create policy "perf hr admin read" on public.performance_reviews for select using (is_hr() or is_admin());
create policy "perf hr admin create" on public.performance_reviews for insert with check (is_hr() or is_admin());
create policy "perf hr admin update" on public.performance_reviews for update using (is_hr() or is_admin()) with check (true);

-- Tickets / support
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  body text,
  status text not null default 'open',
  created_at timestamp with time zone default now()
);

alter table public.tickets enable row level security;
create policy "tickets own crud" on public.tickets for all using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "tickets admin read" on public.tickets for select using (is_admin() or is_hr());

-- Ensure profile row on signup
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Optional: set role for first user as admin
create or replace function public.promote_first_user_to_admin() returns trigger as $$
begin
  if (select count(1) from public.profiles) = 0 then
    update public.profiles set role = 'admin' where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger after_profile_insert_promote
  after insert on public.profiles
  for each row execute function public.promote_first_user_to_admin();