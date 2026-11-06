-- Prevent users from granting themselves elevated roles or setting booking prices.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an administrator can change account roles';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.profiles;
create trigger protect_profile_role_trigger
  before update on public.profiles
  for each row execute procedure public.protect_profile_role();

create or replace function public.protect_customer_booking_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.customer_id is distinct from auth.uid()
     or new.partner_id is not null
     or new.status <> 'requested'
     or new.quoted_amount is not null
     or new.final_amount is not null then
    raise exception 'Invalid customer booking request';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_customer_booking_insert_trigger on public.bookings;
create trigger protect_customer_booking_insert_trigger
  before insert on public.bookings
  for each row execute procedure public.protect_customer_booking_insert();
