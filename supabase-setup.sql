-- AlaricCode V5.1 - stockage des quantités uniquement.
-- Une ligne absente = stock illimité.
-- stock = 0 = épuisé ; stock > 0 = quantité disponible.

create table if not exists public.stocks (
  item_id text primary key,
  stock integer not null check (stock >= 0)
);

alter table public.stocks enable row level security;

grant select on table public.stocks to anon, authenticated;
grant insert, update, delete on table public.stocks to authenticated;

-- Lecture publique pour la boutique GitHub Pages.
drop policy if exists "stocks_public_read" on public.stocks;
create policy "stocks_public_read"
on public.stocks
for select
to anon, authenticated
using (true);

-- Écriture réservée aux utilisateurs authentifiés.
-- Pour ce projet, garde les inscriptions publiques désactivées dans Supabase
-- et crée uniquement ton compte MJ depuis Authentication > Users.
drop policy if exists "stocks_authenticated_insert" on public.stocks;
create policy "stocks_authenticated_insert"
on public.stocks
for insert
to authenticated
with check (true);

drop policy if exists "stocks_authenticated_update" on public.stocks;
create policy "stocks_authenticated_update"
on public.stocks
for update
to authenticated
using (true)
with check (true);

drop policy if exists "stocks_authenticated_delete" on public.stocks;
create policy "stocks_authenticated_delete"
on public.stocks
for delete
to authenticated
using (true);
