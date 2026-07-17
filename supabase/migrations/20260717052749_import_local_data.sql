-- Snapshot dos dados publicos do Supabase local em 2026-07-17.
-- Auth, senhas e app_admins nao fazem parte desta migration.
begin;

delete from public.match_events;
delete from public.stat_adjustments;
delete from public.matches;
delete from public.club_settings;
delete from public.players;
delete from public.opponents;
delete from public.fields;

INSERT INTO public.fields (id, name, address, maps_url, is_primary, is_active, created_at, updated_at) VALUES
	('47d195e2-6c68-4f31-81e5-83dbc2b890ef', 'Arena da Ilha', 'R. Cândido Pereira dos Anjos, 4430-4514 - São João do Rio Vermelho, Florianópolis - SC, 88060-300', 'https://share.google/voYyywT8cNdYRiAyf', false, true, '2026-07-17 04:57:40.09869+00', '2026-07-17 04:57:40.09869+00'),
	('fb79b81d-8c67-4a15-81dc-229ada43562d', 'R7', 'Ipe Branco, 100 - São João do Rio Vermelho, Florianópolis - SC, 88060-328', 'https://maps.app.goo.gl/jFFUg73BsbFKyAhY7', false, true, '2026-07-17 04:58:21.141757+00', '2026-07-17 04:58:21.141757+00');

INSERT INTO public.club_settings (id, club_name, bio, about_text, instagram_url, locality, primary_field_id, created_at, updated_at) VALUES
	(true, 'Unidos do RR', 'Unidos pelo bairro.', 'Fut-7 do Rio Vermelho, Florianopolis.', 'https://www.instagram.com/unidosdorr/', 'Rio Vermelho, Florianopolis - SC', NULL, '2026-07-17 04:37:47.146242+00', '2026-07-17 04:58:34.465318+00');

INSERT INTO public.opponents (id, name, crest_url, is_rival, is_primary_rival, rival_title, rival_description, is_active, created_at, updated_at) VALUES
	('380e10e0-0796-425a-8e5d-bc10db5f6d36', 'Muito Paia FC', NULL, true, true, 'Rivalidade do bairro', NULL, true, '2026-07-17 04:56:20.363519+00', '2026-07-17 04:56:20.363519+00'),
	('7bebb58a-ea1c-49f4-b75e-43309dd8500b', 'Time do gregory', NULL, false, false, NULL, NULL, true, '2026-07-17 04:56:30.735798+00', '2026-07-17 04:56:30.735798+00'),
	('e49a309d-14c0-4a1c-9e7f-a8dc041495fc', 'Time do r7', NULL, false, false, NULL, NULL, true, '2026-07-17 04:56:38.04111+00', '2026-07-17 04:56:38.04111+00'),
	('7a24d3e2-0ce9-42ee-a463-16ddcfbfd6d4', 'Time do arena', NULL, false, false, NULL, NULL, true, '2026-07-17 04:57:36.253781+00', '2026-07-17 04:57:36.253781+00');

INSERT INTO public.matches (id, opponent_id, field_id, scheduled_at, status, is_home, started_at, ended_at, notes, created_at, updated_at) VALUES
	('15e4adae-e85f-44d8-aaa2-a7a4125fed0f', '7a24d3e2-0ce9-42ee-a463-16ddcfbfd6d4', '47d195e2-6c68-4f31-81e5-83dbc2b890ef', '2026-07-17 01:30:00+00', 'finished', true, '2026-07-17 05:00:26.381195+00', '2026-07-17 05:00:42.660057+00', NULL, '2026-07-17 05:00:09.320862+00', '2026-07-17 05:00:42.660202+00');

INSERT INTO public.players (id, name, nickname, shirt_number, "position", photo_url, is_active, created_at, updated_at) VALUES
	('54ca01c0-0cd3-4e54-8f64-5144de49295d', 'Eduardo Borges', 'Borges', 19, 'pivo', NULL, true, '2026-07-17 04:54:16.066816+00', '2026-07-17 04:54:16.066816+00'),
	('de5916ff-21a1-4707-aeef-88fb98b06f34', 'Braian', 'Braian', 10, 'meia', NULL, true, '2026-07-17 04:54:28.450327+00', '2026-07-17 04:54:28.450327+00'),
	('7cd58d81-8455-4553-ad9e-184cb5164e58', 'Bernardo', 'Be', 6, 'ala', NULL, true, '2026-07-17 04:54:40.910836+00', '2026-07-17 04:54:40.910836+00'),
	('0f2f5853-2169-4b0c-85de-3424631a2f15', 'Gabriel Geisler', 'Geisler', 11, 'ala', NULL, true, '2026-07-17 04:55:00.489914+00', '2026-07-17 04:55:00.489914+00'),
	('9ca2a51c-e533-4d46-a9f3-a2bd3355e81e', 'Matheus Stocco', 'Stocco', 4, 'fixo', NULL, true, '2026-07-17 04:55:20.690961+00', '2026-07-17 04:55:20.690961+00'),
	('953ce9e8-4b48-40ed-8756-6b46d8c6acb1', 'Gustavo Aleluia', 'Aleluia', 12, 'goleiro', NULL, true, '2026-07-17 04:55:41.637849+00', '2026-07-17 04:55:41.637849+00');

INSERT INTO public.match_events (id, match_id, event_type, beneficiary, is_own_goal, scorer_player_id, assist_player_id, minute_snapshot, occurred_at, client_event_id, deleted_at, created_at, updated_at) VALUES
	('55535604-c64e-421b-a83b-bfe39f36f8b9', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:33.262075+00', '9939fc34-7d6c-415e-a799-418c260deb16', NULL, '2026-07-17 05:00:33.258108+00', '2026-07-17 05:00:33.258108+00'),
	('927b605f-073b-4e13-a0a7-ad16a5ea1ea8', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:34.324112+00', '30e6fe6f-3a88-4bc7-b2c8-79731cd855b2', NULL, '2026-07-17 05:00:34.321066+00', '2026-07-17 05:00:34.321066+00'),
	('1b655eb2-5890-472c-901d-e778664d450b', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:34.56644+00', 'cb295fc5-c210-4b12-8b86-20c8862537fe', NULL, '2026-07-17 05:00:34.557062+00', '2026-07-17 05:00:34.557062+00'),
	('b26da215-a435-425f-9a99-fdf4a0bd7374', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:34.753543+00', 'f548adb8-d67b-48c9-9d33-127a7814ae0e', NULL, '2026-07-17 05:00:34.751934+00', '2026-07-17 05:00:34.751934+00'),
	('9836d656-6b57-493a-a1fe-7ab5ca68044e', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:34.969587+00', 'f3c2085b-7ba3-4f96-b2ff-88d6d781856b', NULL, '2026-07-17 05:00:34.96851+00', '2026-07-17 05:00:34.96851+00'),
	('6ba19b92-1b9f-4655-90e5-82a0cf66d246', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:35.164745+00', '682db2d8-b75e-4daf-ad46-a8acd658ec96', NULL, '2026-07-17 05:00:35.163098+00', '2026-07-17 05:00:35.163098+00'),
	('d679756f-cca4-470e-b2ea-738a96bf7a2c', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:35.380745+00', '0c984122-71df-401a-863a-bd23ae029d68', NULL, '2026-07-17 05:00:35.379448+00', '2026-07-17 05:00:35.379448+00'),
	('a90df400-e632-4d16-9063-5686bfc2fff3', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:35.869441+00', '4cfecb57-c8e8-4a30-94c3-2b149c84d9d9', NULL, '2026-07-17 05:00:35.859928+00', '2026-07-17 05:00:35.859928+00'),
	('f16daf86-9406-4559-a070-bb7e424cafda', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:37.795271+00', 'cc7bb662-5589-4dcb-9042-9c67e33b31a5', NULL, '2026-07-17 05:00:37.793887+00', '2026-07-17 05:00:37.793887+00'),
	('4d5adf20-cb03-4a2a-b965-2e36a7b8d00b', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:38.748666+00', 'd8f79e43-d314-43d0-be87-623468c6b36a', NULL, '2026-07-17 05:00:38.747251+00', '2026-07-17 05:00:38.747251+00'),
	('024d17ee-14ea-4eb7-8bac-fdbec2f2b89d', '15e4adae-e85f-44d8-aaa2-a7a4125fed0f', 'goal', 'opponent', false, NULL, NULL, 0, '2026-07-17 05:00:38.946793+00', '3ee0686d-da1f-4629-9814-cd8995f1f1fa', NULL, '2026-07-17 05:00:38.945561+00', '2026-07-17 05:00:38.945561+00');

INSERT INTO public.stat_adjustments (id, scope, player_id, metric, delta, reason, created_at, updated_at) VALUES
	('ad3cf2b5-2a19-4378-bad8-a52887fbcdd5', 'club', NULL, 'wins', 2, 'Nao tinha nada', '2026-07-17 04:58:50.014282+00', '2026-07-17 04:58:50.014282+00'),
	('800bc759-a263-4b41-8c6a-8348af5f43ba', 'club', NULL, 'losses', 5, 'Somos bagres', '2026-07-17 04:59:16.067066+00', '2026-07-17 04:59:16.067066+00'),
	('0d534d31-59b9-4d4a-8c59-9e06445939ec', 'player', '54ca01c0-0cd3-4e54-8f64-5144de49295d', 'goals', 12, 'Craque', '2026-07-17 04:59:31.707082+00', '2026-07-17 04:59:31.707082+00'),
	('dee1168f-fe0d-41f8-a3f2-bf2a8c79de50', 'player', '54ca01c0-0cd3-4e54-8f64-5144de49295d', 'assists', 4, 'craque', '2026-07-17 04:59:42.692013+00', '2026-07-17 04:59:42.692013+00');

commit;
