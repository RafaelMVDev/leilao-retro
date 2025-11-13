-- TEST COUNTRIES

INSERT INTO Country (nameCountry)
VALUES ('Brasil'), ('Estados Unidos'), ('Alemanha'), ('Japão'), ('África do Sul');

-- TEST STATES

INSERT INTO State (stateName, fkCountryIdCountry)
VALUES ('São Paulo', 1), ('Nova York', 2), ('Baviera', 3);

-- TEST CITIES

INSERT INTO City (nameCity, fkStateIdState)
VALUES ('São Paulo', 1), ('Poá', 1), ('Nova York', 2), ('Munique', 3);

-- TEST ADDRESSES

INSERT INTO Address (zipCode, district, street, numberAddress, complement, fkCityIdCity)
VALUES ('12345678', 'Bairro das Rosas', 'Rua das Roseiras', 123, 'Ap 123', 1),
('87654321', 'Bairro das Laranjas', 'Rua das Laranjeiras', 456, 'Ap 456', 2),
('11223344', 'Bairro dos Céus', 'Rua Celeste', 789, 'Ap 789', 3),
('88776655', 'Bairro dos Aviões', 'Rua dos Aviadores', 012, 'Ap 012', 4);

-- PREDEFINED USERS

INSERT INTO user (nickname, firstName, lastName, email, userPassword, profilePhoto, phone, birthDate, userCookieHash)
VALUES ('juliacalixto', 'Júlia', 'Calixto', 'juliacalixto@marauction.com.br', SHA2('senhaJulia', 256), 'fotojulia.jpg','5511987654321', '1900-01-01', 'hashcookieJulia'),
('rafaelmoreira', 'Rafael', 'Moreira', 'rafaelmoreira@marauction.com.br', SHA2('senhaMoreira', 256), 'fotomoreira.jpg', '5511988776655', '1900-02-02', 'hashcookieMoreira'),
('rafaelmorales', 'Rafael', 'Morales', 'rafaelmorales@marauction.com.br', SHA2('senhaMorales', 256), 'fotomorales.jpg', '5511912345678', '1900-03-03', 'hashcookieMorales'),
('luishenrique', 'Luis', 'Henrique', 'luishenrique@marauction.com.br', SHA2('senhaLuis', 256), 'fotoluis.jpg', '5511911223344', '1900-04-04', 'hashcookieLuis');

INSERT INTO useraddress (fkUserIdUser, fkAddressIdAddress)
VALUES
(1, 1), (2, 2), (3, 3), (4, 4);

-- TEST ACHIEVEMENTS AND CONDITIONS

INSERT INTO achievement (title, description)
VALUES ('Bem-vindo!', 'Seja bem-vindo ao nosso site! Receba 100 moedas para começar com tudo!'),
('Ganhador', 'Parabéns! Você acaba de abater seu primeiro lote! Receba 200 moedas para comemorar!'),
('Leiloeiro', 'Você acaba de criar seu primeiro leilão! Ganhe 100 moedas como recompensa!'),
('É tentando que se aprende', 'Você participou de cinco leilões, mas não abateu nenhum. Pegue 50 moedas como consolo.'),
('Investidor', 'Você já gastou mais de R$1000 em leilões! Receba 100 moedas de congratulações!');

INSERT INTO conditiontable (descriptionCondition)
VALUES ('Fazer login pela primeira vez no site'),
('Ganhar um lote pela primeira vez'),
('Criar um leilão pela primeira vez'),
('Ter participado de pelo menos cinco leilões em que não ganhou nada'),
('Gastar mais de 1000 reais dentro do site');

INSERT INTO conditionachievement (fkAchievementIdAchievement, fkConditionIdCondition)
VALUES (1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- AUCTION 1, LOTS  AND PRODUCTS

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Jogos da Nintendo', 'Você é um fã de carteirinha dos jogos da época de ouro da Nintendo? Então este leilão é para você!', '2025-11-07', '2026-12-31', 'Scheduled', 1);

-- LOTS

INSERT INTO lot (minimumIncrement, minimumBid, lotNumber, fkAuctionIdAuction)
VALUES (30, 200, 1, 1), (100, 500, 2, 1), (20, 100, 3, 1), (200, 1000, 4, 1), (50, 300, 5, 1);

-- PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES ('Donkey Kong Country 1', 'Junte-se a DK e a Diddy numa aventura para recuperar as suas bananas roubadas.', 'Physical', 'Nintendo', 20, 2, 7, 10, 1),
('Donkey Kong Country 2', 'Nesta sequela do famoso Donkey Kong Country, ao estilo de aventura de piratas, orienta Diddy e Dixie Kong através de oito mundos selvagens, cheios de diversão e ação, pela Crocodile Isle infestada de Kremlins.', 'Physical', 'Nintendo', 20, 2, 7, 10, 1),
('The Legend of Zelda: A Link to the Past', 'Um dos maiores clássicos do SNES, embarque em uma jornada lendária para salvar Hyrule e derrotar Ganon.', 'Physical', 'Nintendo', 25, 2, 7, 10, 2),
('The Legend of Zelda: Ocarina of Time', 'Reviva a aventura épica que revolucionou os jogos 3D. Link deve viajar no tempo para impedir Ganondorf de conquistar o mundo.', 'Physical', 'Nintendo', 25, 2, 7, 10, 2),
('Super Mario World', 'Explore Dinosaur Land e salve a Princesa Peach em uma das maiores aventuras de plataforma da Nintendo.', 'Physical', 'Nintendo', 20, 2, 7, 10, 3),
('Super Mario Kart', 'O jogo que iniciou a lendária franquia de corridas da Nintendo. Desafie seus amigos em pistas cheias de emoção!', 'Physical', 'Nintendo', 18, 2, 7, 10, 3),
('Super Nintendo Entertainment System (SNES)', 'Console clássico da Nintendo em perfeito estado de conservação, com dois controles originais.', 'Physical', 'Nintendo', 1500, 5, 25, 30, 4),
('Nintendo 64', 'O icônico console 64-bit que marcou uma geração, acompanha um controle original e cabos.', 'Physical', 'Nintendo', 1600, 6, 25, 30, 4),
('EarthBound', 'RPG cult do Super Nintendo, completo com caixa e manual originais. Uma verdadeira relíquia.', 'Physical', 'Nintendo', 25, 2, 7, 10, 5),
('Chrono Trigger', 'Um dos RPGs mais aclamados de todos os tempos, com enredo envolvente e trilha sonora inesquecível.', 'Physical', 'Square (Distribuído pela Nintendo)', 25, 2, 7, 10, 5);

-- AUCTION 2, LOTS AND PRODUCTS

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Clássicos da Sony', 'Reviva a era de ouro dos games com os maiores sucessos da história do PlayStation. Jogos, consoles e relíquias para fãs e colecionadores.', '2025-12-01', '2026-12-31', 'Scheduled', 2);

-- LOTS

INSERT INTO lot (minimumIncrement, minimumBid, lotNumber, fkAuctionIdAuction)
VALUES (50, 300, 1, 2), (100, 600, 2, 2), (25, 150, 3, 2), (200, 1200, 4, 2), (80, 400, 5, 2);

-- LOT 6 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Final Fantasy VII', 'O RPG que redefiniu uma geração. Acompanhe Cloud e seus aliados na luta contra a corporação Shinra e o lendário Sephiroth.', 'Physical', 'SquareSoft', 25, 2, 7, 10, 6),
('Metal Gear Solid', 'A obra-prima de Hideo Kojima. Ação e espionagem em um enredo cinematográfico e envolvente.', 'Physical', 'Konami', 25, 2, 7, 10, 6);

-- LOT 7 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('God of War', 'Kratos busca vingança contra Ares em uma jornada épica inspirada na mitologia grega.', 'Physical', 'Sony Computer Entertainment', 28, 2, 7, 10, 7);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Shadow of the Colossus (Digital Remaster)', 'Versão remasterizada em HD do clássico do PS2. Inclui conteúdo bônus e trilha sonora digital.', 'Digital', 'Team ICO', 'SCOL-HD-KEY-9273-AZ41', '2027-12-31', 'https://store.playstation.com/shadow-remaster', 7);

-- LOT 8 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Gran Turismo 3: A-Spec', 'Realismo e velocidade no simulador de corrida mais vendido do PS2.', 'Physical', 'Polyphony Digital', 30, 2, 7, 10, 8);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Pro Evolution Soccer 6 (Digital Edition)', 'Versão digital do clássico PES 6, otimizada para emuladores e sistemas modernos.', 'Digital', 'Konami', 'PES6-ONLINE-KEY-5587-FF92', '2026-12-31', 'https://konami.com/pes6-digital', 8);

-- LOT 9 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('PlayStation 1 (PS1)', 'O console que iniciou a revolução 3D. Acompanha dois controles originais e cabos.', 'Physical', 'Sony', 1700, 5, 25, 30, 9),
('PlayStation 2 (PS2 Slim)', 'Versão compacta do console mais vendido de todos os tempos, com um controle e cabos originais.', 'Physical', 'Sony', 1900, 6, 25, 30, 9);

-- LOT 10 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Resident Evil 4 Collector’s Edition', 'Edição especial com caixa metálica, manual ilustrado e disco bônus. Um item raro para fãs da saga.', 'Physical', 'Capcom', 40, 3, 7, 12, 10);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Final Fantasy X (Digital Collector’s Box)', 'Versão digital de colecionador, com trilha sonora e artbook em PDF.', 'Digital', 'Square Enix', 'FFX-DIGI-KEY-8834-ZQ12', '2027-06-30', 'https://store.square-enix.com/ffx-digital-collector', 10);

-- AUCTION 3, LOTS AND PRODUCTS

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Sega Retro Revival', 'Reviva a nostalgia dos anos 80 e 90 com os consoles e jogos mais marcantes da Sega. Um tributo à era dourada dos arcades.', '2026-01-10', '2026-12-31', 'Scheduled', 3);

-- LOTS
INSERT INTO lot (minimumIncrement, minimumBid, lotNumber, fkAuctionIdAuction)
VALUES (30, 200, 1, 3), (50, 300, 2, 3), (25, 150, 3, 3), (100, 700, 4, 3), (70, 400, 5, 3);

-- LOT 11 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Sonic the Hedgehog', 'O ouriço azul mais rápido do mundo em sua primeira aventura para salvar animais das garras do Dr. Robotnik.', 'Physical', 'Sega', 20, 2, 7, 10, 11),
('Streets of Rage 2', 'Clássico beat ’em up do Mega Drive com trilha sonora marcante e jogabilidade cooperativa.', 'Physical', 'Sega', 22, 2, 7, 10, 11);

-- LOT 12 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Sonic Mania (Digital Edition)', 'Um tributo moderno aos jogos 2D clássicos, com fases inéditas e novos personagens jogáveis.', 'Digital', 'Sega', 'SONIC-MANIA-KEY-1122-AZ09', '2027-12-31', 'https://store.sega.com/sonicmania', 12),
('Golden Axe Remake', 'Versão digital remasterizada do lendário jogo de ação com visuais em HD e trilha remasterizada.', 'Digital', 'Sega', 'GAXE-REM-HD-4451-PL88', '2028-06-30', 'https://store.sega.com/goldenaxe', 12);

-- LOT 13 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('OutRun', 'Clássico arcade de corrida com trilha sonora inesquecível e visual retrô vibrante.', 'Physical', 'Sega', 20, 2, 7, 10, 13);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Daytona USA (Digital)', 'Versão digital oficial do jogo de corrida arcade lançado para plataformas modernas.', 'Digital', 'Sega', 'DAYT-USA-KEY-7765-JP21', '2027-08-31', 'https://store.sega.com/daytonausa', 13);

-- LOT 14 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Sega Mega Drive', 'Console original em ótimo estado de conservação, acompanha dois controles e cabos.', 'Physical', 'Sega', 1200, 5, 22, 28, 14),
('Sega Saturn', 'Console de 32 bits completo com dois controles, muito bem preservado.', 'Physical', 'Sega', 1500, 6, 25, 30, 14);

-- LOT 15 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Sega Classics Collection (Digital)', 'Pacote digital com 20 títulos clássicos remasterizados para PC e consoles.', 'Digital', 'Sega', 'SEGACLASS-20GAMES-KEY-6677-AC33', '2028-01-01', 'https://store.sega.com/classics', 15);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Sonic 30th Anniversary Box', 'Caixa de colecionador com artbook, trilha sonora e miniestatueta do Sonic.', 'Physical', 'Sega', 60, 4, 8, 15, 15);

-- AUCTION 4, LOTS AND PRODUCTS

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Nintendo Modern Classics', 'Uma coleção que celebra os melhores títulos e consoles modernos da Nintendo — de Mario Odyssey a Zelda Breath of the Wild.', '2026-03-01', '2026-12-31', 'Scheduled', 4);

-- LOTS

INSERT INTO lot (minimumIncrement, minimumBid, lotNumber, fkAuctionIdAuction)
VALUES (50, 400, 1, 4), (60, 500, 2, 4), (30, 200, 3, 4), (150, 1000, 4, 4), (70, 350, 5, 4);

-- LOT 16 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('The Legend of Zelda: Breath of the Wild (Digital)', 'Explore um vasto mundo aberto com liberdade total de exploração.', 'Digital', 'Nintendo', 'ZELDA-BOTW-KEY-5544-LK90', '2028-12-31', 'https://store.nintendo.com/botw', 16);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Super Mario Odyssey', 'Mario viaja por reinos incríveis em uma aventura 3D inovadora para o Nintendo Switch.', 'Physical', 'Nintendo', 25, 2, 7, 10, 16);

-- LOT 17 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Metroid Dread (Digital)', 'O retorno triunfal de Samus Aran em um jogo de ação 2D intenso e moderno.', 'Digital', 'Nintendo', 'METDREAD-KEY-8822-BB44', '2027-12-31', 'https://store.nintendo.com/metroiddread', 17),
('Splatoon 3 (Digital)', 'Batalhas de tinta coloridas e multiplayer dinâmico em uma das franquias mais queridas da Nintendo.', 'Digital', 'Nintendo', 'SPLAT3-KEY-4421-QW11', '2027-12-31', 'https://store.nintendo.com/splatoon3', 17);

-- LOT 18 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Mario Kart 8 Deluxe', 'A versão definitiva do clássico de corrida da Nintendo, diversão garantida para todos.', 'Physical', 'Nintendo', 25, 2, 7, 10, 18),
('Super Smash Bros. Ultimate', 'Todos os personagens reunidos em batalhas épicas no maior crossover dos games.', 'Physical', 'Nintendo', 25, 2, 7, 10, 18);

-- LOT 19 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Nintendo Switch OLED', 'Versão premium do console híbrido, com tela OLED e dock aprimorado.', 'Physical', 'Nintendo', 1400, 5, 25, 30, 19),
('Nintendo Switch Lite', 'Versão portátil do console, leve e compacta.', 'Physical', 'Nintendo', 900, 4, 20, 25, 19);

-- LOT 20 PRODUCTS

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, activationKey, downloadValidity, downloadUrl, fkLotIdLot)
VALUES
('Animal Crossing: New Horizons (Digital)', 'Crie sua ilha paradisíaca e viva aventuras tranquilas com seus amigos.', 'Digital', 'Nintendo', 'ACNH-KEY-2299-GG77', '2028-03-01', 'https://store.nintendo.com/animalcrossing', 20);

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES
('Zelda Collector’s Chest', 'Caixa de colecionador com pôster, moeda dourada e trilha sonora de Breath of the Wild.', 'Physical', 'Nintendo', 60, 4, 8, 15, 20);

-- CATEGORIES

INSERT INTO category (idCategory, categoryName, descriptionCategory)
VALUES
(1, 'Games', 'Jogos físicos e digitais para todas as plataformas.'),
(2, 'Consoles', 'Consoles novos, retrôs e portáteis.'),
(3, 'Customized', 'Produtos personalizados, edições de colecionador e itens exclusivos.');

-- PRODUCTS IN GAME CATEGORY

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),
(9,1),(10,1),(11,1),(12,1),(13,1),
(17,1),(18,1),(19,1),(20,1),
(25,1),(26,1),(27,1),(28,1);

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES
(33,1),(34,1),(35,1),(36,1),(39,1);

-- PRODUCTS IN CONSOLES CATEGORY

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES
(8,2),(14,2),(21,2),(29,2);

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES
(37,2),(38,2);

-- PRODUCTS IN CUSTOMIZED CATEGORY

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES
(16,3),(23,3),(24,3),(31,3),(32,3),(15,3),(22,3),(30,3);

INSERT INTO categoryproduct (fkProductIdProduct, fkCategoryIdCategory)
VALUES (40,3);

-- TYPES OF COINS

INSERT INTO currency (currencyType, currencyName)
VALUES
('Internal', 'Bzzcoin'), ('External', 'Real');

-- INSERTING WALLETS FOR USERS
-- REAL WALLETS
INSERT INTO wallet (currentBalance, fkCurrencyIdCurrency, fkUserIdUser)
VALUES
(150, 2, 1), (200, 2, 2), (250, 2, 3), (300, 2, 4);

-- BZZCOIN WALLETS
INSERT INTO wallet (currentBalance, fkCurrencyIdCurrency, fkUserIdUser)
VALUES
(100, 1, 1), (100, 1, 2), (100, 1, 3), (100, 1, 4);

INSERT INTO transactionTable (transactionValue, transactionType, fkReceivingWalletIdWallet)
VALUES
(100, 'Income', 5), (100, 'Income', 6), (100, 'Income', 7), (100, 'Income', 8);

-- TEST BIDS

-- AUCTION 1
-- LOT 1
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(220.00, 2, 1), (250.00, 3, 1), (280.00, 4, 1);

-- LOT 2
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(520.00, 3, 2), (620.00, 4, 2), (720.00, 2, 2);

-- AUCTION 2
-- LOT 6
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(150.00, 1, 6), (170.00, 4, 6), (190.00, 3, 6);

-- LOT 8
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(1200.00, 1, 8), (1300.00, 3, 8), (1500.00, 4, 8);

-- AUCTION 3
-- LOT 11
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(1050.00, 2, 11), (1150.00, 4, 11);

-- LOT 12
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(400.00, 1, 12), (450.00, 2, 12), (500.00, 4, 12);

-- AUCTION 4
-- LOT 16
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(350.00, 3, 16), (370.00, 2, 16);

-- LOT 18
INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES
(800.00, 2, 18), (900.00, 1, 18);