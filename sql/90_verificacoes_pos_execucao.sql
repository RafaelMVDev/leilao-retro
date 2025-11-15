/* ============================================================
   POST-EXECUTION VALIDATION SCRIPT
   PURPOSE: Perform quick integrity and sanity checks after running the full database creation script.
   NOTE: No changes are made — all commands are SELECT-only.
==============================================================*/

---------------------------------------------------------------
-- 1. COUNT RECORDS IN ALL MAIN TABLES
---------------------------------------------------------------

-- What it proves: whether the tables exist and whether the initial inserts ran.
SELECT 'user' AS tableName, COUNT(*) AS total FROM user;
SELECT 'wallet' AS tableName, COUNT(*) AS total FROM wallet;
SELECT 'currency' AS tableName, COUNT(*) AS total FROM currency;
SELECT 'auction' AS tableName, COUNT(*) AS total FROM auction;
SELECT 'lot' AS tableName, COUNT(*) AS total FROM lot;
SELECT 'bid' AS tableName, COUNT(*) AS total FROM bid;

---------------------------------------------------------------
-- 2. CHECK MIN/MAX VALUES FOR CRITICAL NUMERIC COLUMNS
---------------------------------------------------------------

-- What it proves: whether there are no negative or absurd values.
SELECT MIN(currentBalance) AS minBalance, MAX(currentBalance) AS maxBalance
FROM wallet;

-- What it proves: if there is any bid <= 0 (which would violate triggers).
SELECT MIN(bidValue) AS minBid, MAX(bidValue) AS maxBid
FROM bid;

---------------------------------------------------------------
-- 3. CHECK CPF UNICITY AND FORMATTING
---------------------------------------------------------------

-- What it proves: identifies duplicate CPFs (error).
SELECT cpf, COUNT(*) AS qty
FROM user
GROUP BY cpf
HAVING qty > 1;

---------------------------------------------------------------
-- 4. CHECK EMAIL FORMAT AND UNICITY
---------------------------------------------------------------

-- What it proves: ensures that email triggers worked.
SELECT email, COUNT(*) AS qty
FROM user
GROUP BY email
HAVING qty > 1;

-- What it proves: searches for emails without @ or minimum pattern.
SELECT *
FROM user
WHERE email NOT LIKE '%@%';

---------------------------------------------------------------
-- 5. CHECK WALLET RELATIONS (FK CONSISTENCY)
---------------------------------------------------------------

-- What it proves: it guarantees that every wallet belongs to a real user.
SELECT w.idWallet
FROM wallet w
LEFT JOIN user u ON u.idUser = w.fkUserIdUser
WHERE u.idUser IS NULL;

-- What it proves: guarantees that the wallet has valid currency.
SELECT w.idWallet
FROM wallet w
LEFT JOIN currency c ON c.idCurrency = w.fkCurrencyIdCurrency
WHERE c.idCurrency IS NULL;

---------------------------------------------------------------
-- 6. CHECK LOTS AND AUCTIONS RELATIONSHIP
---------------------------------------------------------------

-- What it proves: identifies lots without auction (invalid).
SELECT l.idLot
FROM lot l
LEFT JOIN auction a ON a.idAuction = l.fkAuctionIdAuction
WHERE a.idAuction IS NULL;

---------------------------------------------------------------
-- 7. CHECK BIDS RELATIONSHIPS (FK CONSISTENCY)
---------------------------------------------------------------

-- What it proves: bids referencing non-existent users.
SELECT b.idBid
FROM bid b
LEFT JOIN user u ON u.idUser = b.fkUserIdUser
WHERE u.idUser IS NULL;

-- What it proves: bids referencing non-existent lots.
SELECT b.idBid
FROM bid b
LEFT JOIN lot l ON l.idLot = b.fkLotIdLot
WHERE l.idLot IS NULL;

---------------------------------------------------------------
-- 8. CHECK CURRENT WINNER CONSISTENCY
---------------------------------------------------------------

-- What it proves: whether the winnerId in batch is an existing user.
SELECT l.idLot
FROM lot l
LEFT JOIN user u ON u.idUser = l.currentWinnerId
WHERE l.currentWinnerId IS NOT NULL
  AND u.idUser IS NULL;

-- What it proves: winner with a value different from the highest bid.
SELECT l.idLot, l.currentWinnerId, l.currentBidValue,
       (SELECT MAX(bidValue) FROM bid b WHERE b.fkLotIdLot = l.idLot) AS expectedMax
FROM lot l;

---------------------------------------------------------------
-- 9. CHECK IF AUCTIONS HAVE VALID DATES
---------------------------------------------------------------

-- What it proves: endDate must be > startDate
SELECT *
FROM auction
WHERE endDate <= startDate;

---------------------------------------------------------------
-- 10. CHECK STATUS VALUES
---------------------------------------------------------------

-- What it proves: status outside of those allowed (Scheduled/Open/Finished/Canceled)
SELECT *
FROM auction
WHERE statusAuction NOT IN ('Scheduled','Open','Finished','Canceled');

---------------------------------------------------------------
-- 11. CHECK LOTS WITHOUT ANY BIDS
---------------------------------------------------------------

-- What it proves: identifies auctions without movement (useful for debugging)
SELECT l.idLot, l.lotTitle
FROM lot l
LEFT JOIN bid b ON b.fkLotIdLot = l.idLot
WHERE b.idBid IS NULL;

---------------------------------------------------------------
-- 12. CHECK USERS WITHOUT WALLETS
---------------------------------------------------------------

-- What it proves: users created without their two basic wallets.
SELECT u.idUser, u.userName
FROM user u
LEFT JOIN wallet w ON w.fkUserIdUser = u.idUser
GROUP BY u.idUser
HAVING COUNT(w.idWallet) = 0;

---------------------------------------------------------------
-- 13. CHECK NEGATIVE BALANCES (NEVER ALLOWED)
---------------------------------------------------------------

-- What it proves: triggers and procedures avoided negative balances.
SELECT *
FROM wallet
WHERE currentBalance < 0;