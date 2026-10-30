-- ============================================================
--  Sample content (the same the demo site shows).
--  Made by scripts/make-seed.mjs. Run AFTER 01_schema.sql.
-- ============================================================

USE voz_del_desierto;
SET NAMES utf8mb4;
SET time_zone = '+00:00';  -- dates in UTC, same as the API

-- Felipe is user 1, with role 'felipe'. Demo password: desierto
-- A visitor account for testing: rosa@example.com / demo1234
-- (only the hashes are stored; change both before going live)
INSERT INTO users (id, name, email, password_hash, role, town) VALUES (1, 'Felipe Lerma', 'felipe@example.com', '$2y$10$mgeLc3J/ALDiyPPuSLZYieo4Fh7zzTPn5eg5fJY91ExDONSUGUTzK', 'felipe', 'Chihuahua');
INSERT INTO users (id, name, email, password_hash, role, town) VALUES (2, 'Rosa M.', 'rosa@example.com', '$2y$10$P6aI2Fe.ctELVXSlXK.yMeeQ/BdT5OksKNnd4ALwn1NWtOujLCVyS', 'user', 'Chihuahua');

-- ---------- articles (+ their comments) ----------
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('mercado-nocturno-plaza-de-armas', 'Local', 'The night market is back in the Plaza de Armas after four years, and the whole city came out', 'Forty stalls lined the Plaza de Armas in front of the cathedral on Saturday as the night market returned, with food, music and crafts until midnight. Organizers say it will run every second Saturday through spring.', 'For the first time in four years, the cathedral square filled with lanterns, smoke from the grills and the sound of a brass band tuning up. The night market, once a fixture of the town calendar, returned on Saturday with forty stalls and a crowd that organizers put at nearly three thousand.

Vendors sold tamales, roasted corn, hand-woven blankets and pottery. A local trio played rancheras from the cathedral steps until the last stall closed at midnight.

The market will now run every second Saturday through the end of spring, weather permitting.', 'The Valley Courier', 'I walked the whole square twice. The tamale lady from the old days is still there, same cart, same smile. This is what a town looks like when it remembers itself. Go, and bring your grandchildren.', NULL, 'img/cathedral.webp', '50% 40%', 6, TRUE, NOW() - INTERVAL 3 HOUR);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Rosa M.', 'Don Felipe, I saw you by the band! The tamale lady is my tía, she said thank you for the kind words.', FALSE, NOW() - INTERVAL 1 HOUR);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Tell her the green chile ones are still the best in the state. I''ll be back for more.', TRUE, NOW() - INTERVAL 50 MINUTE);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Tomás R.', 'Took my kids for the first time. They didn''t want to leave.', FALSE, NOW() - INTERVAL 40 MINUTE);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('guitarrero-de-delicias', 'Music', 'A 78-year-old guitar maker is teaching his craft to the next generation', 'In a small workshop in Delicias, a luthier who has built guitars for half a century now takes four apprentices a year, free of charge.', 'In a small workshop in Delicias, between the smell of cedar and glue, a luthier who has built guitars for fifty years now spends his mornings teaching.

Every year he takes four apprentices, free of charge. They learn to choose the wood, bend the sides with heat and set the frets by hand. Each one finishes the year with a guitar of their own.

“A guitar is not finished when it is built,” he says. “It is finished when somebody plays it at a wedding.”', 'High Desert Weekly', 'Wood remembers the hands that shaped it. So do people. Bless this man.', 'I''ve played one of his guitars. The sound is warm like a kitchen at Christmas. What he''s doing for these young people is worth more than any record deal. Wood remembers the hands that shaped it. So do people.', 'img/cactus.webp', '50% 40%', 4, FALSE, NOW() - INTERVAL 5 HOUR);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Daniel P.', 'I was one of his apprentices in 2019. He''s the real thing.', FALSE, NOW() - INTERVAL 3 HOUR);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Then you carry his voice too, Daniel. Send me a recording, I''d love to play it on the show.', TRUE, NOW() - INTERVAL 2 HOUR);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('casas-de-adobe-casas-grandes', 'Culture', 'Families are restoring a row of 100-year-old adobe homes, brick by brick', 'Volunteers mix mud, straw and water by hand each weekend to repair the oldest street in Casas Grandes, using the same methods their great-grandparents did.', 'Every Saturday and Sunday morning, families in Casas Grandes gather on the town''s oldest street with buckets, shovels and piles of straw.

They mix mud, straw and water by hand and press it into wooden molds to make new adobe bricks, the same way the houses were built a hundred years ago.

So far they have repaired four of the eleven houses. Anyone can help: the work starts at eight and there is always coffee.', 'The Valley Courier', 'Mud, straw and patience. The recipe hasn''t changed in a hundred years, and neither has the love.', 'My father built with adobe. He used to say a house made of the land keeps you cool because it knows the sun. It moves me to see young families with their sleeves rolled up. Mud, straw and patience. The recipe hasn''t changed.', 'img/adobe.webp', '40% 55%', 5, FALSE, NOW() - INTERVAL 8 HOUR);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Lucía G.', 'We''re out there every Sunday at 8. Anyone can come help!', FALSE, NOW() - INTERVAL 6 HOUR);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Save me a shovel, Lucía. My back is old but my hands still work.', TRUE, NOW() - INTERVAL 5 HOUR);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('caballos-salvajes', 'Nature', 'Wild horse herd grows to its largest count in a decade', 'Rangers counted 212 horses across the plains of northern Chihuahua this spring, including 31 foals, after two wet winters brought back the grass.', 'Rangers counted 212 wild horses across the plains of northern Chihuahua this spring, the largest number in ten years.

Thirty-one of them were foals born this year. Two wet winters in a row brought back the grass and filled the watering holes.

Rangers remind visitors to watch the herds from a distance and never feed them.', 'Range & Sky Journal', 'Thirty-one foals. Some good news from the plains for once, and I''ll take it with my coffee.', 'When I was a boy you could see them from the road at sunset. Then for years, almost nothing. Thirty-one foals. Rain does what speeches can''t. Some good news from the plains for once, and I''ll take it with my coffee.', 'img/horses.webp', '55% 55%', 3, FALSE, NOW() - INTERVAL 1 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Marisol V.', 'Saw a group of them near the dry lake last week. Beautiful.', FALSE, NOW() - INTERVAL 20 HOUR);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Keep your distance and your camera ready, mija. That''s the right way to love them.', TRUE, NOW() - INTERVAL 18 HOUR);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('desierto-en-flor', 'Nature', 'After a wet winter, the desert is in full bloom for the first time in years', 'Cactus flowers, poppies and desert marigolds are covering the hills of the Chihuahuan Desert in color, and visitors are asked to stay on the trails.', 'After the wettest winter in years, the Chihuahuan Desert is in full bloom.

Cactus flowers, poppies and desert marigolds are covering the hills in red, orange and yellow. Botanists say the bloom should last until the first heat of summer.

Visitors are asked to stay on the trails and not pick the flowers, so the seeds can fall for next year.', 'Range & Sky Journal', 'The desert is never empty. It''s only waiting. Go see it before the heat comes.', 'People who don''t know the desert think it''s empty. It''s not empty, it''s patient. Give it one good winter and look what it does. Go early in the morning, stay on the trail, and take somebody you love.', 'img/sunset.webp', '60% 60%', 4, FALSE, NOW() - INTERVAL 2 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Javier O.', 'The hills by the reservoir are completely orange right now.', FALSE, NOW() - INTERVAL 1 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('conciertos-en-el-rialto', 'Music', 'The old Rialto theater will host free Sunday concerts all summer', 'The 1930s theater in downtown Chihuahua reopens its doors for local bands, mariachi groups and school orchestras, with no ticket needed.', 'The old Rialto theater in downtown Chihuahua will open its doors every Sunday afternoon this summer for free concerts.

Local bands, mariachi groups and school orchestras will take turns on the stage, which was restored last year with its original red curtains.

No ticket is needed. Doors open at five, and the first rows fill up fast.', 'High Desert Weekly', 'I had my first dance at the Rialto. I''ll be in row five, if anybody wants to say hello.', 'I had my first dance at the Rialto, 1968, with a girl in a yellow dress who later became my wife. Music should be free on a Sunday. I''ll be in row five, if anybody wants to say hello.', 'img/cathedral.webp', '50% 25%', 5, FALSE, NOW() - INTERVAL 3 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Elena S.', 'This is the sweetest thing I''ve read all week ❤️', FALSE, NOW() - INTERVAL 2 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'She''d have liked you, Elena. Come to the show.', TRUE, NOW() - INTERVAL 2 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('panaderia-de-parral', 'Local', 'The oldest bakery in Parral is turning 75', 'Three generations of the same family still bake conchas and bolillos before sunrise, and they''re celebrating with free coffee all week.', 'The oldest bakery in Parral is turning seventy-five, and the same family is still running it.

Three generations bake conchas, bolillos and orejas before sunrise in the original brick oven. The grandmother, now ninety, still checks the dough every morning.

To celebrate, there is free coffee all week for everyone who comes in.', 'The Valley Courier', 'They still know your name and ask about your mother. Seventy-five years of good manners.', 'They still know your name and ask about your mother. You can''t download that. Stop by this week, have the free coffee, and buy an extra concha for your neighbor.', 'img/adobe.webp', '70% 50%', 2, FALSE, NOW() - INTERVAL 4 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Ray C.', 'Been buying my bread there since ''82. Best people in Parral.', FALSE, NOW() - INTERVAL 3 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('campana-de-la-sierra', 'Faith', 'A small chapel in the Sierra rings its restored bell again after 40 years', 'Families in a mountain village near Creel raised money for two years to recast the bronze bell that cracked in a winter storm in the 1980s.', 'On Sunday morning, the bell of the small chapel above the village rang for the first time in four decades. It had cracked during a hard winter in the 1980s and had been silent ever since.

Families started a collection two years ago: tamale sales, raffles, a little from every paycheck. The bronze was recast in a foundry in the city and carried back up the mountain road in the back of a pickup truck.

The priest blessed it before the first mass, and the children were allowed to pull the rope.', 'The Valley Courier', 'When that bell rang, half the village cried. The other half was already crying.', 'Some sounds belong to a place. My grandmother used to say the bell called the people and the people answered. Forty years of silence, and now it calls again. When it rang, half the village cried. The other half was already crying.', 'img/cathedral.webp', '50% 12%', 3, FALSE, NOW() - INTERVAL 5 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Guadalupe T.', 'My mother was baptized in that chapel. Thank you for sharing it, Don Felipe.', FALSE, NOW() - INTERVAL 5 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Then the bell rang for her too, Guadalupe. God bless your family.', TRUE, NOW() - INTERVAL 5 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('escuela-de-acordeon', 'Music', 'An accordion school for kids opens in Cuauhtémoc', 'A retired norteño musician is teaching twenty children to play the accordion on Saturday mornings, with instruments donated by local families.', 'Every Saturday at nine, a retired norteño musician opens the doors of an old garage in Cuauhtémoc and twenty children come in carrying accordions almost as big as they are.

Most of the instruments were donated by families who had one sitting in a closet. The lessons are free; parents bring coffee and pan dulce.

The students will give their first concert in the town square at the end of the year.', 'High Desert Weekly', 'Twenty little accordions. The neighbors are going to need patience, and they''re going to love it.', 'The accordion is the heart of the music up here. It cries and it dances in the same song. Twenty children learning it on a Saturday morning is the best news I''ve read this month. The neighbors are going to need patience, and they''re going to love it.', 'img/cactus.webp', '30% 50%', 3, FALSE, NOW() - INTERVAL 5 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Héctor A.', 'My son is in that class! He practices every night.', FALSE, NOW() - INTERVAL 4 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Tell him to play me a redova when he''s ready. I''ll put it on the radio.', TRUE, NOW() - INTERVAL 4 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('arboles-rio-chuviscar', 'Nature', 'Volunteers plant two thousand trees along the Chuvíscar River', 'Neighbors, students and retirees spent the weekend planting willows and cottonwoods along the riverbank that runs through Chihuahua City.', 'Over two days, more than three hundred volunteers planted willows and cottonwoods along the banks of the Chuvíscar, the river that crosses Chihuahua City.

Organizers said the trees will give shade to the walking path, hold the soil when the summer rains come, and bring birds back to the river.

Each tree has a small wooden tag with the name of the person or the class that planted it.', 'Range & Sky Journal', 'Old men plant trees whose shade they''ll never sit in. That''s the whole idea of a good life.', 'There''s an old saying: a people grows great when old men plant trees whose shade they know they''ll never sit in. I saw young and old with shovels on Saturday. In twenty years somebody''s grandchild will read under those willows.', 'img/horses.webp', '75% 40%', 3, FALSE, NOW() - INTERVAL 6 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Sofía R.', 'Our class planted forty of them! The kids named every one.', FALSE, NOW() - INTERVAL 5 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('estacion-de-creel', 'Local', 'The old train station in Creel gets a fresh coat of paint', 'The station where the mountain train stops on its way through the Copper Canyon has been repainted in its original colors, ochre and cream.', 'The train station in Creel, where the mountain train stops on its way through the Copper Canyon, has been repainted in its original colors: ochre walls and cream window frames.

The work took three weeks and was done by local painters, who also repaired the wooden benches on the platform.

Visitors and neighbors say the station looks the way it did fifty years ago.', 'The Valley Courier', 'Ochre and cream. Somebody up there has good taste. Now let''s ride that train again.', 'I took that train with my father when I was eleven. I remember the tunnels, the cold air and the bread he bought from a lady at the window. Ochre and cream, just like I remember it. Now let''s ride that train again.', 'img/adobe.webp', '20% 60%', 2, FALSE, NOW() - INTERVAL 7 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Andrés M.', 'I work at the station. Come visit, Don Felipe, the coffee is on me.', FALSE, NOW() - INTERVAL 6 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Careful, Andrés. I''ll hold you to that.', TRUE, NOW() - INTERVAL 6 DAY);
INSERT INTO articles (slug, category, title, summary, body, source, take, long_take, photo, photo_pos, read_minutes, is_lead, published_at) VALUES ('coro-de-parral', 'Faith', 'A children''s choir from Parral will sing at Christmas Eve mass', 'Forty children from Parral''s public schools have been rehearsing villancicos every afternoon since September for the Christmas Eve mass at the old church downtown.', 'Every afternoon since September, forty children from public schools in Parral have stayed after class to rehearse traditional villancicos.

Their teacher says the children chose the songs themselves, starting with the ones their grandparents taught them.

They will sing at the Christmas Eve mass at the old church downtown. Families are asked to arrive early: last year there was standing room only.', 'High Desert Weekly', 'Forty little voices singing villancicos. Bring a handkerchief, you''ll need it.', 'Nothing sounds like Christmas the way children singing in an old church does. I still know every word of “Los peces en el río.” Forty little voices this year. Bring a handkerchief, you''ll need it.', 'img/cathedral.webp', '50% 65%', 3, FALSE, NOW() - INTERVAL 8 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, NULL, 'Patricia L.', 'My granddaughter is in the choir, she sings in the front row!', FALSE, NOW() - INTERVAL 7 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('article', @item, 1, 'Felipe Lerma', 'Then I''ll be looking at the front row, Patricia.', TRUE, NOW() - INTERVAL 7 DAY);

-- ---------- videos (+ their comments) ----------
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('amanecer-en-la-sierra', 'Sunrise over the Sierra, with a cup of coffee', 'felipe', 'Felipe Lerma', 'Felipe sets up his camera before dawn on a hill near Casas Grandes and lets the sun do the talking. No music, just the wind, the birds and a few words about why he still gets up early.', 'I''ve watched a thousand sunrises and I''m not tired of them yet. Put this on while you have breakfast.', '24:10', 3100, 'img/adobe.webp', '50% 55%', NOW() - INTERVAL 1 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, NULL, 'Marisol V.', 'I watched the whole thing. So peaceful.', FALSE, NOW() - INTERVAL 20 HOUR);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, 1, 'Felipe Lerma', 'That''s the idea, mija. The day can wait twenty minutes.', TRUE, NOW() - INTERVAL 18 HOUR);
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('mercado-nocturno-en-video', 'A walk through the night market in the Plaza de Armas', 'community', 'Rosa M.', 'Rosa filmed the first night of the market with her phone: the tamale carts, the band on the cathedral steps and a lot of happy faces.', 'Rosa sent me this one. Look at minute five, that''s the tamale lady I wrote about.', '8:40', 12000, 'img/cathedral.webp', '50% 32%', NOW() - INTERVAL 3 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, NULL, 'Tomás R.', 'My kids and I are in the background at 3:12!', FALSE, NOW() - INTERVAL 2 DAY);
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('el-desierto-en-flor', 'The desert in bloom, filmed from the road', 'community', 'Javier O.', 'Javier drove the back roads south of the city with a camera on the dashboard. Half an hour of red, orange and yellow hills.', 'Turn the sound up, Javier left the radio on. Good music, too.', '31:02', 4600, 'img/cactus.webp', '50% 45%', NOW() - INTERVAL 4 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, NULL, 'Sofía R.', 'Where is the road at minute 14? I want to go.', FALSE, NOW() - INTERVAL 3 DAY);
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('caballos-al-atardecer', 'Wild horses at dusk', 'felipe', 'Felipe Lerma', 'Five quiet minutes with a group of wild horses on the plains of northern Chihuahua, filmed from far away so as not to bother them.', 'I waited two hours in the truck for these five minutes. Worth every one.', '5:15', 27000, 'img/horses.webp', '50% 55%', NOW() - INTERVAL 6 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, NULL, 'Ana Lucía T.', 'Thank you for keeping your distance, Don Felipe. That''s how it''s done.', FALSE, NOW() - INTERVAL 5 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('video', @item, 1, 'Felipe Lerma', 'I learned from the best. Thank you for the work you do out there.', TRUE, NOW() - INTERVAL 5 DAY);
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('una-tarde-en-casas-grandes', 'An afternoon in Casas Grandes', 'community', 'Lucía G.', 'Lucía shows the street the families are restoring, brick by brick, and talks with the neighbors who started it.', 'Those are the hands that are saving that street. Watch and then go help them.', '12:30', 2200, 'img/adobe.webp', '20% 60%', NOW() - INTERVAL 1 WEEK);
SET @item = LAST_INSERT_ID();
INSERT INTO videos (slug, title, from_who, creator, description, note, length, views, photo, photo_pos, published_at) VALUES ('la-catedral-de-noche', 'The cathedral at night, from the plaza', 'felipe', 'Felipe Lerma', 'The lights come on one by one on the cathedral towers while the plaza fills up. Filmed on a warm Saturday evening.', 'My favorite hour in the city. The bells at the end are a gift.', '6:48', 8900, 'img/cathedral.webp', '50% 60%', NOW() - INTERVAL 2 WEEK);
SET @item = LAST_INSERT_ID();

-- ---------- songs ----------
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (1, 'Viento del norte', 'Los Hermanos Durán', 'Camino Real', 'Norteño', 246, 18000, 'img/cactus.webp', '78% 48%', NOW() - INTERVAL 10 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (2, 'Luna de Parral', 'Trío Las Palomas', 'Serenatas', 'Bolero', 221, 9400, 'img/sunset.webp', '60% 55%', NOW() - INTERVAL 1 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (3, 'El caballo bayo', 'Conjunto Sierra Alta', 'Corridos del llano', 'Corrido', 178, 12000, 'img/horses.webp', '50% 55%', NOW() - INTERVAL 12 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (4, 'Adobe y paja', 'Rosario Villa', 'Tierra', 'Ranchera', 260, 21000, 'img/adobe.webp', '50% 50%', NOW() - INTERVAL 13 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (5, 'Campanas de mi pueblo', 'Coro Infantil de Parral', 'Villancicos', 'Sacred', 204, 6100, 'img/cathedral.webp', '50% 30%', NOW() - INTERVAL 14 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (6, 'Flor del desierto', 'Los Hermanos Durán', 'Camino Real', 'Norteño', 195, 15000, 'img/cactus.webp', '30% 50%', NOW() - INTERVAL 15 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (7, 'Noche en la Plaza de Armas', 'Trío Las Palomas', 'Serenatas', 'Bolero', 233, 7800, 'img/cathedral.webp', '50% 65%', NOW() - INTERVAL 16 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (8, 'Tren de la sierra', 'Conjunto Sierra Alta', 'Corridos del llano', 'Corrido', 212, 11000, 'img/sunset.webp', '30% 60%', NOW() - INTERVAL 17 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (9, 'Redova del sábado', 'Escuela de Acordeón de Cuauhtémoc', 'Primeros pasos', 'Norteño', 152, 2400, 'img/adobe.webp', '75% 45%', NOW() - INTERVAL 1 DAY);
INSERT INTO songs (id, title, artist, album, genre, length_seconds, plays, photo, photo_pos, added_at) VALUES (10, 'Café de la mañana', 'Rosario Villa', 'Tierra', 'Ranchera', 189, 16000, 'img/horses.webp', '75% 40%', NOW() - INTERVAL 19 DAY);

-- ---------- dedications ----------
INSERT INTO dedications (name, to_whom, song_id, message, created_at) VALUES ('Elena S.', 'My husband, Ramiro', 2, 'Forty years married and you still sing it off key. I love you.', NOW() - INTERVAL 2 HOUR);
INSERT INTO dedications (name, to_whom, song_id, message, created_at) VALUES ('Tomás R.', 'My mother in Delicias', 10, 'For your coffee every morning. We miss you up here.', NOW() - INTERVAL 1 DAY);
INSERT INTO dedications (name, to_whom, song_id, message, created_at) VALUES ('Guadalupe T.', 'Everyone in the Sierra', 5, 'For the bell that rings again.', NOW() - INTERVAL 3 DAY);

-- ---------- podcast episodes (+ their comments) ----------
INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (12, 'el-hombre-que-camino-el-camino-real', 'The man who walked the old royal road', 'Ramón Estrada', 'Walked from Chihuahua to Santa Fe on foot', 'Ramón spent four months walking the old Camino Real, sleeping in small towns and listening to strangers. He tells Felipe what the road taught him about patience, kindness and blisters.', 'I''ve driven that road a hundred times and never really seen it. Ramón saw all of it. Listen to the part about the lady with the water jug.', '0:00 Welcome
2:15 Why walk it?
14:40 The kindness of strangers
31:05 The hardest day
44:30 What he''d tell his grandchildren', '52:10', 'img/sunset.webp', '50% 55%', NOW() - INTERVAL 3 DAY);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('episode', @item, NULL, 'Héctor A.', 'The story at minute 31 made me cry in the truck.', FALSE, NOW() - INTERVAL 2 DAY);
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('episode', @item, 1, 'Felipe Lerma', 'Me too, Héctor, and I was sitting right across from him.', TRUE, NOW() - INTERVAL 2 DAY);
INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (11, 'cincuenta-anos-de-guitarras', 'Fifty years of guitars', 'Aurelio Méndez', 'Guitar maker in Delicias', 'The luthier from our news story sits down with Felipe in his workshop. They talk about wood, weddings, apprentices and the guitar he''ll never sell.', 'Recorded in his workshop, so you''ll hear a saw now and then. I left it in. That''s the real sound of the place.', '0:00 Welcome
3:30 The first guitar
17:20 Choosing the wood
29:45 The apprentices
40:10 The guitar he''ll never sell', '47:02', 'img/cactus.webp', '50% 40%', NOW() - INTERVAL 1 WEEK);
SET @item = LAST_INSERT_ID();
INSERT INTO comments (item_type, item_id, user_id, name, text, is_felipe, created_at) VALUES ('episode', @item, NULL, 'Daniel P.', 'That''s my teacher! Thank you, Don Felipe.', FALSE, NOW() - INTERVAL 6 DAY);
INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (10, 'las-panaderas-de-parral', 'The bakers of Parral', 'Carmen Ruiz', 'Third generation at the oldest bakery in Parral', 'Carmen gets up at three every morning to light the brick oven her grandfather built. She talks about bread, family and why the recipe for conchas has never been written down.', 'Don''t listen to this one hungry. I warned you.', '0:00 Welcome
4:05 Three in the morning
19:30 The grandmother''s rules
36:15 The recipe nobody wrote down
49:00 Seventy-five years', '55:40', 'img/adobe.webp', '70% 50%', NOW() - INTERVAL 2 WEEK);
SET @item = LAST_INSERT_ID();
INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (9, 'las-canciones-de-mi-madre', 'The songs my mother sang', 'Rosario Villa', 'Ranchera singer', 'Rosario learned to sing in her mother''s kitchen. She sings three of those songs live for Felipe and tells the story behind each one.', 'She sang the last one with her eyes closed. So did I.', '0:00 Welcome
3:10 Her mother''s kitchen
12:00 First song, live
24:40 Leaving home to sing
35:20 Last song, live', '41:18', 'img/horses.webp', '75% 40%', NOW() - INTERVAL 3 WEEK);
SET @item = LAST_INSERT_ID();
INSERT INTO episodes (number, slug, title, guest, guest_role, summary, note, chapters, length, photo, photo_pos, published_at) VALUES (8, 'lluvia-caballos-y-llanuras', 'Rain, horses and the plains', 'Ana Lucía Torres', 'Park ranger in northern Chihuahua', 'Ana Lucía counts the wild horses every spring. She explains what two wet winters did for the herd and how to watch them without bothering them.', 'If you''ve ever stopped your car to watch the horses, this one is for you.', '0:00 Welcome
2:50 Counting horses
15:10 What the rain changed
27:30 How to watch them', '38:45', 'img/horses.webp', '50% 55%', NOW() - INTERVAL 1 MONTH);
SET @item = LAST_INSERT_ID();

-- ---------- From Felipe's desk ----------
INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES ('shared', 'Shared the night market story with his take.', NULL, NULL, NOW() - INTERVAL 2 HOUR);
INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES ('note', 'Up before sunrise again. The light on the hills this morning looked like honey. Some days I don''t need the radio.', NULL, NULL, NOW() - INTERVAL 6 HOUR);
INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES ('music', 'Added a new song to the playlist. Play it loud with the windows down.', '[Track title] · [Artist]', NULL, NOW() - INTERVAL 1 DAY);
INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES ('podcast', 'Recorded episode 13 today with a guest who has walked the old trail on foot. Out on Friday.', 'Voices of the world · Ep. 13', NULL, NOW() - INTERVAL 2 DAY);
INSERT INTO desk_notes (kind, text, meta, photo, created_at) VALUES ('photo', 'The hills behind the old adobe, after the rain.', NULL, 'img/adobe.webp', NOW() - INTERVAL 3 DAY);

