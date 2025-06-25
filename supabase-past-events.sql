-- SQL: Create a past event for each city in the app

insert into public.events (name, description, city, start_time, end_time, latitude, longitude, radius)
values
  ('Berlin Art Past', 'Vergangenes Happening in Berlin.', 'Berlin', '2024-06-01T18:00:00+02:00', '2024-06-01T22:00:00+02:00', 52.5200, 13.4050, 1000),
  ('LA Art Past', 'Past event in Los Angeles.', 'Los Angeles', '2024-06-08T18:00:00-07:00', '2024-06-08T22:00:00-07:00', 34.0522, -118.2437, 1000),
  ('Hong Kong Art Past', 'Past event in Hong Kong.', 'Hong Kong', '2024-06-15T18:00:00+08:00', '2024-06-15T22:00:00+08:00', 22.3193, 114.1694, 1000),
  ('Singapore Art Past', 'Past event in Singapore.', 'Singapore', '2024-06-22T18:00:00+08:00', '2024-06-22T22:00:00+08:00', 1.3521, 103.8198, 1000),
  ('Forlì Art Past', 'Past event in Forlì.', 'Forlì', '2024-06-29T18:00:00+02:00', '2024-06-29T22:00:00+02:00', 44.2225, 12.0408, 1000),
  ('Basel Art Past', 'Past event in Basel.', 'Basel', '2024-07-06T18:00:00+02:00', '2024-07-06T22:00:00+02:00', 47.5596, 7.5886, 1000);