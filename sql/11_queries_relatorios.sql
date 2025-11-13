/* ============================================================
   REPORT 1
   PRODUCTS IN AUCTION
   OBJECTIVE: Show how many product are there in each auction
   PROBLEM THAT SOLVES: Allows to view which auctions have the biggest amount of registered products
   JUSTIFICATIVE: We used JOIN between auction, lot and product, because the relationship is chained, and COUNT aggregation to total by auction
============================================================= */

SELECT 
    a.idAuction,
    a.title,
    COUNT(p.idProduct) AS totalProducts
FROM auction a
LEFT JOIN lot l ON l.fkAuctionIdAuction = a.idAuction
LEFT JOIN product p ON p.fkLotIdLot = l.idLot
GROUP BY a.idAuction, a.title
ORDER BY totalProducts DESC;

/* ============================================================
   REPORT 2
   USERS WHO GAVE THE MOST BIDS
   OBJECTIVE: Rank users by the number of bids
   PROBLEM THAT SOLVES: Identifies most active users in auctions and helps in analysing engagement
   JUSTIFICATIVE: COUNT(bid) with GROUP BY is good to measure activity by user
============================================================= */

SELECT 
    u.nickname,
    COUNT(b.idBid) AS totalBids
FROM user u
LEFT JOIN bid b ON b.fkUserIdUser = u.idUser
GROUP BY u.idUser, u.nickname
ORDER BY totalBids DESC;

/* ============================================================
   REPORT 3
   HIGHEST BID IN ACTIVE AUCTION
   OBJECTIVE: Show the highest bid in each active auction 
   PROBLEM THAT SOLVES: Allows you see quickly the competitive status of ongoing auctions
   JUSTIFICATIVE: Uses MAX(bidValue) matching with WHERE status = 'Open' to filter only valid auctions and exhibits the highest bid
============================================================= */

SELECT 
    a.idAuction,
    a.title,
    MAX(b.bidValue) AS highestBid
FROM auction a
LEFT JOIN lot l 
       ON l.fkAuctionIdAuction = a.idAuction
LEFT JOIN bid b 
       ON b.fkLotIdLot = l.idLot
WHERE a.statusAuction = 'Open'
GROUP BY a.idAuction, a.title
ORDER BY highestBid DESC;

/* ============================================================
   REPORT 4
   AUCTIONS PROGRAMMED FOR THE NEXT THIRTY DAYS
   OBJECTIVE: List auctions that will occur soon
   PROBLEM THAT SOLVES: Helps in planning, divulgation and operational management of the auctions
   JUSTIFICATIVE: We filter startDate using a comparation with temporal interval
============================================================= */

SELECT
    a.idAuction,
    a.title,
    a.startDate
FROM auction a
WHERE a.startDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY a.startDate;

/* ============================================================
   REPORT 5
   BIDS MADE IN LOTS
   OBJECTIVE: Show all bids made in each lot, including the auction, which lot does it belong nd which user did the bid
   PROBLEM THAT SOLVES: Allows to follow the bids evolution in each lot, important information for analysis of user interests
   JUSTIFICATIVE: The bid belongs to the lot and the lot belongs to the auction. So, we follow this relationship chain.
============================================================= */

SELECT
    l.idLot,
    a.title AS auctionTitle,
    u.nickname AS bidder,
    b.bidValue,
    b.bidDateTime
FROM lot l
JOIN auction a 
       ON l.fkAuctionIdAuction = a.idAuction
JOIN bid b 
       ON b.fkLotIdLot = l.idLot
JOIN user u 
       ON u.idUser = b.fkUserIdUser
ORDER BY l.idLot, b.bidValue DESC;