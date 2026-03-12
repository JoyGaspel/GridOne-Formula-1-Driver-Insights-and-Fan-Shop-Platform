-- Seed teams from f1api.dev (2026)
begin;
insert into public.teams (id, name, base, color, drivers, image, logo, car) values
  ('mercedes', 'Mercedes Formula 1 Team', 'Germany', '#00d2be', '["George Russell","Andrea Kimi Antonelli"]'::jsonb, '', '', ''),
  ('ferrari', 'Scuderia Ferrari', 'Italy', '#dc0000', '["Charles Leclerc","Lewis Hamilton"]'::jsonb, '', '', ''),
  ('mclaren', 'McLaren Formula 1 Team', 'Great Britain', '#ff8700', '["Lando Norris","Oscar Piastri"]'::jsonb, '', '', ''),
  ('red_bull', 'Red Bull Racing', 'Austria', '#1e41ff', '["Max Verstappen","Isack Hadjar"]'::jsonb, '', '', ''),
  ('haas', 'Haas F1 Team', 'United States', '#b6babd', '["Oliver Bearman","Esteban Ocon"]'::jsonb, '', '', ''),
  ('rb', 'RB F1 Team', 'Italy', '#2b4562', '["Arvid Lindblad","Liam Lawson"]'::jsonb, '', '', ''),
  ('audi', 'Audi Revolut F1 Team', 'Germany', '#52e252', '["Gabriel Bortoleto","Nico Hulkenberg"]'::jsonb, '', '', ''),
  ('alpine', 'Alpine F1 Team', 'France', '#0090ff', '["Pierre Gasly","Franco Colapinto"]'::jsonb, '', '', ''),
  ('williams', 'Williams Racing', 'Great Britain', '#005aff', '["Alex Albon","Carlos Sainz"]'::jsonb, '', '', ''),
  ('cadillac', 'Cadillac Formula 1 Team', 'United States', '#D6D6D6', '["Sergio Pérez","Valtteri Bottas"]'::jsonb, '', '', ''),
  ('aston_martin', 'Aston Martin F1 Team', 'Great Britain', '#006f62', '["Fernando Alonso","Lance Stroll"]'::jsonb, '', '', '')
on conflict (id) do update set name = excluded.name, base = excluded.base, color = excluded.color, drivers = excluded.drivers;
commit;
