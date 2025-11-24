/* ============================================================
   File: 03_insercoes_casos_teste.sql
   Author(s): Calixto, Júlia; Henrique, Luis; Morales, Rafael; Moreira, Rafael
   Project: Marauction
   Class: 213
   DBMS: MySQL 8.0.41
   OBJECTIVE: Insert test-case data for validation and debugging
   EXPECTED PERFORMANCE:
        - Create valid and invalid test scenarios
        - Populate tables in a way that allows business-rule validation
        - Support debugging and manual testing
========================================================== */

-- CORRECT CASES

-- SCENARY A: valid bid 
-- user has enough coins and the auction is active
-- expected result: bid is accepted and registered

INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES (300.00, 2, 1);

-- SCENARY B: valid user
-- user is registered with his unique email
-- expected result: user is registered normally

INSERT INTO user (nickname, firstName, lastName, email, userPassword, phone, birthdate)
VALUES ('novo_user', 'Leo', 'Motta', 'leo.motta@marauction.com.br', SHA2('senhaLeo', 256), '11999999999', '2000-09-09');

-- SCENARY C: bid is bigger than the previous one
-- new bid value is bigger than the previous one
-- expected result: bid is accepted and winner bid is updated

INSERT INTO bid (bidValue, fkUserIdUser, fkAuctionIdAuction)
VALUES (120.00, 3, 1);

-- SCENARY D: valid auction creation
-- auction has correct date order (end date after start date)
-- expected result: auction is created normally

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Leilão de HQs Raras', 'Lote contendo HQs clássicas em perfeito estado', '2025-12-12', '2026-06-05', 'Scheduled', 1);

-- SCENARY E: valid product creation
-- user creates a product with all the required information
-- expected result: product is created normally

INSERT INTO product (productName, descriptionProduct, productType, manufacturer, weight, height, depth, width, fkLotIdLot)
VALUES ('HQ Batman rara', 'É uma HQ do Batman rara', 'Physical', 'Panini', 10, 20, 1, 10, 21);

-- ERROR CASES

-- SCENARY A: invalid bid
-- user doesn't have enough coins to do the bid
-- expected result: trigger block it and shows "insufficient balance"

INSERT INTO bid (bidValue, fkUserIdUser, fkALotIdLot)
VALUES (9999.00, 4, 1);

-- SCENARY B: invalid user
-- user try to register with an already used email
-- expected result: trigger block it and shows "this email is already been used"

INSERT INTO user (nickname, firstName, lastName, email, userPassword, phone, birthdate)
VALUES ('julia_clone', 'Julia', 'Calixto', 'juliacalixto@marauction.com.br', SHA2('duplicado', 256), '11988888888', '2000-09-09');

-- SCENARY C: bid with value zero
-- user try to do a bid with the value zero
-- expected result: trigger block it and shows "invalid bid, your bid must be bigger than zero"

INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
VALUES (0.00, 2, 1);

-- SCENARY D: user without password
-- user try to register without a password
-- expected result: trigger block it and shows "you must insert a password"

INSERT INTO user (nickname, firstName, lastName, email, phone, birthdate)
VALUES ('usuario_sem_senha', 'Claudete', 'Alves', 'claudete.alves@teste.com', '11900000000', '2000-09-09');

-- SCENARY E: invalid auction
-- user try to create an auction with the end date being before the start date
-- expected result: trigger block it and shows "invalid end date"

INSERT INTO auction (title, descriptionAuction, startDate, endDate, statusAuction, fkUserIdUser)
VALUES ('Leilão teste', 'Essa é a descrição do leilão teste', '2025-12-12', '2024-12,12', 'Scheduled', 1)