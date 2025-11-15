-- BASIC QUERIES

/* ============================================================
   QUERY 1
   SIMPLE USER LISTING
   OBJECTIVE: Display all registered users in the platform.
   JUSTIFICATIVE: Basic visualization of the user table, useful for confirming correct insertions and verifying basic data.
============================================================= */

SELECT idUser, nickname, email
FROM user;

/* ============================================================
   QUERY 2
   AUCTIONS BY USER
   OBJECTIVE: Show each auction along with the user who created it.
   JUSTIFICATIVE: Auctions are owned by users via fkUserIdUser. This join allows verifying ownership and relational integrity.
============================================================= */

SELECT 
	a.idAuction,
    a.title,
    u.nickname AS owner
FROM auction a
JOIN user u ON a.fkUserIdUser = u.idUser;

/* ============================================================
   QUERY 3
   BIDS IN A SPECIFIC LOT
   OBJECTIVE: Retrieve all bids placed on a single lot.
   JUSTIFICATIVE: Since bids belong to lots, filtering by lot ID is the correct way to inspect bidding activity.
============================================================= */

SELECT
	b.idBid,
    b.bidValue,
    b.bidDateTime,
    b.fkUserIdUser
FROM bid b
WHERE b.fkLotIdLot = 1;

/* ============================================================
   QUERY 4
   TOTAL BIDS PER USER
   OBJECTIVE: Count how many bids each user has submitted.
   JUSTIFICATIVE: LEFT JOIN ensures users with zero bids still appear in the result, providing a full platform overview.
============================================================= */

SELECT
	u.nickname,
    COUNT(b.idBid) AS totalBids
FROM user u
LEFT JOIN bid b ON b.fkUserIdUser = u.idUser
GROUP BY u.idUser, u.nickname;

/* ============================================================
   QUERY 5
   AUCTIONS ORDERED BY DATE
   OBJECTIVE: List all auctions in chronological order.
   JUSTIFICATIVE: Ordering by startDate allows monitoring scheduled, ongoing, and upcoming auctions.
============================================================= */

SELECT
	idAuction,
    title,
    startDate,
    endDate
FROM auction
ORDER BY startDate ASC;

/* ============================================================
   QUERY 6
   PRODUCTS ASSIGNED TO LOTS
   OBJECTIVE: Display all products that are linked to a lot and the auction that owns each lot.
   JUSTIFICATIVE: Correct navigation follows producT, lot and auction. This query ensures products are correctly allocated in the system.
============================================================= */

SELECT
    p.idProduct,
    p.productName,
    l.idLot,
    a.idAuction,
    a.startDate,
    a.endDate
FROM product p
JOIN lot l ON p.fkLotIdLot = l.idLot
JOIN auction a ON l.fkAuctionIdAuction = a.idAuction;

/* ============================================================
   QUERY 7
   HIGHEST BID PER LOT
   OBJECTIVE: Retrieve the maximum bid value for each lot.
   JUSTIFICATIVE: Using MAX(bidValue) identifies the top offer in each lot, useful for monitoring auction progress.
============================================================= */

SELECT 
	fkLotIdLot AS lotId,
    MAX(bidValue) AS highestBid
FROM bid
GROUP BY fkLotIdLot;

/* ============================================================
   QUERY 8
   PRODUCTS PER USER
   OBJECTIVE: Count how many products are indirectly associated to each user through auctions and lots.
   JUSTIFICATIVE:  The correct relationship chain is user, auction, lot and product. LEFT JOIN ensures users without products also appear.
============================================================= */

SELECT 
    u.nickname,
    COUNT(p.idProduct) AS totalProducts
FROM user u
LEFT JOIN auction a ON a.fkUserIdUser = u.idUser
LEFT JOIN lot l ON l.fkAuctionIdAuction = a.idAuction
LEFT JOIN product p ON p.fkLotIdLot = l.idLot
GROUP BY u.idUser, u.nickname;

/* ============================================================
   QUERY 9
   USERS IN ALPHABETICAL ORDER
   OBJECTIVE: Display all users sorted by nickname.
   JUSTIFICATIVE: Simple ordered listing for readability and verification of correct user registration.
============================================================= */

SELECT 
    idUser,
    nickname,
    email
FROM user
ORDER BY nickname ASC;

/* ============================================================
   QUERY 10
   BIDS ABOVE A SPECIFIC VALUE
   OBJECTIVE: Retrieve all bids higher than a given threshold.
   JUSTIFICATIVE: Filtering by bidValue helps identify high-value bidding activity across lots.
============================================================= */

SELECT
    idBid,
    bidValue,
    fkLotIdLot,
    fkUserIdUser
FROM bid
WHERE bidValue > 500;