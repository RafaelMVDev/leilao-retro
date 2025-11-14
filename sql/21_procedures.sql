-- =============================================================
-- PROCEDURE 1
-- usp_place_bid
-- DESCRIPTION: Registers a bid using a combination of REAL and BZZCOIN. Validates balances, debits both wallets, inserts the bid, and updates the current winner for the lot.
--
-- PARAMETERS:
--      p_userId      INT            → ID of the user placing the bid
--      p_lotId       INT            → ID of the lot being bid on
--      p_bidValue    DECIMAL(10,2)  → Total bid amount
--      p_realUsed    DECIMAL(10,2)  → Amount of REAL to be deducted
--      p_bzzUsed     INT            → Amount of BZZCOIN to be deducted
--
-- PROBLEM IT SOLVES: Ensures bids are financially valid, debits mixed currencies correctly, maintains wallet consistency, and preserves accurate bidding behavior.
-- JUSTIFICATION: Users can bid with two currencies, requiring unified value conversion, validation, and atomic wallet deduction.
-- WHEN TO USE: Use whenever a user manually places a bid mixing REAL and BZZCOIN.
-- NOTES: Conversion rate used: 1 BZZCOIN = 0.10 REAL
-- =============================================================


DELIMITER $$

CREATE PROCEDURE usp_place_bid (
    IN p_userId INT,
    IN p_lotId INT,
    IN p_bidValue DECIMAL(10,2),
    IN p_realUsed DECIMAL(10,2),
    IN p_bzzUsed INT
)
BEGIN
    DECLARE v_realWalletId INT;
    DECLARE v_bzzWalletId INT;
    DECLARE v_realBalance DECIMAL(10,2);
    DECLARE v_bzzBalance INT;
    DECLARE v_equivalentReal DECIMAL(10,2);
    DECLARE v_totalCovered DECIMAL(10,2);
    DECLARE v_rate DECIMAL(10,2) DEFAULT 0.10;

    IF p_bidValue <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Bid value must be greater than zero.';
    END IF;

    IF p_realUsed < 0 OR p_bzzUsed < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Values for realUsed and bzzUsed must be non-negative.';
    END IF;

    SELECT idWallet, currentBalance
    INTO v_realWalletId, v_realBalance
    FROM wallet
    WHERE fkUserIdUser = p_userId
      AND fkCurrencyIdCurrency = (SELECT idCurrency FROM currency WHERE currencyName = 'real')
    LIMIT 1;

    IF v_realWalletId IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User has no REAL wallet.';
    END IF;

    SELECT idWallet, currentBalance
    INTO v_bzzWalletId, v_bzzBalance
    FROM wallet
    WHERE fkUserIdUser = p_userId
      AND fkCurrencyIdCurrency = (SELECT idCurrency FROM currency WHERE currencyName = 'bzzcoin')
    LIMIT 1;

    IF v_bzzWalletId IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User has no BZZCOIN wallet.';
    END IF;

    IF p_realUsed > v_realBalance THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient REAL balance.';
    END IF;

    IF p_bzzUsed > v_bzzBalance THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient BZZCOIN balance.';
    END IF;

    SET v_equivalentReal = p_bzzUsed * v_rate;
    SET v_totalCovered = p_realUsed + v_equivalentReal;

    IF v_totalCovered < p_bidValue THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'The total (real + bzz converted) does not cover the bid.';
    END IF;

    UPDATE wallet
    SET currentBalance = currentBalance - p_realUsed
    WHERE idWallet = v_realWalletId;

    UPDATE wallet
    SET currentBalance = currentBalance - p_bzzUsed
    WHERE idWallet = v_bzzWalletId;

    INSERT INTO bid (bidValue, fkUserIdUser, fkLotIdLot)
    VALUES (p_bidValue, p_userId, p_lotId);

    UPDATE lot
    SET currentWinnerId = p_userId,
        currentBidValue = p_bidValue
    WHERE idLot = p_lotId;

END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 2
-- usp_create_user
-- DESCRIPTION: Creates a new user account without creating wallets.
--
-- PARAMETERS:
--      p_name      VARCHAR(100) → User's display name
--      p_email     VARCHAR(150) → User's unique email
--      p_password  VARCHAR(200) → User's password
--      p_cpf       VARCHAR(20)  → User CPF identifier
--
-- PROBLEM IT SOLVES: Provides a clean, centralized entry point to create users.
-- JUSTIFICATION: Keeps user creation consistent and ensures triggers handle validation rules (email format, password required, etc.).
-- WHEN TO USE: Use when registering a user before wallet creation.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_create_user (
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_password VARCHAR(200),
    IN p_cpf VARCHAR(20)
)
BEGIN
    INSERT INTO user (userName, email, userPassword, cpf)
    VALUES (p_name, p_email, p_password, p_cpf);
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 3
-- usp_update_user
-- DESCRIPTION: Updates a user's basic profile information.
--
-- PARAMETERS:
--      p_userId    INT           → ID of the user to update
--      p_name      VARCHAR(100)  → Updated name
--      p_email     VARCHAR(150)  → Updated email
--      p_password  VARCHAR(200)  → Updated password
--      p_cpf       VARCHAR(20)   → Updated CPF

-- PROBLEM IT SOLVES: Centralizes user updates and ensures consistent structure.
-- JUSTIFICATION: Prevents repetitive UPDATE logic in the application layer.
-- WHEN TO USE: Use when editing user account info in the system.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_update_user (
    IN p_userId INT,
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_password VARCHAR(200),
    IN p_cpf VARCHAR(20)
)
BEGIN
    UPDATE user
    SET userName = p_name,
        email = p_email,
        userPassword = p_password,
        cpf = p_cpf
    WHERE idUser = p_userId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 4
-- usp_delete_user
-- DESCRIPTION: Removes a user. Cascading deletes remove wallets and bids automatically based on foreign key rules.
--
-- PARAMETERS:
--      p_userId  INT → ID of the user to delete
--
-- PROBLEM IT SOLVES: Safely removes a full user account and related data.
-- JUSTIFICATION: Ensures a single command controls full user deletion.
-- WHEN TO USE: Use when an account must be permanently removed.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_delete_user (
    IN p_userId INT
)
BEGIN
    DELETE FROM user WHERE idUser = p_userId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 5
-- usp_get_user
-- DESCRIPTION: Returns a single user record by its ID.
--
-- PARAMETERS:
--      p_userId INT → ID of the user to fetch
--
-- PROBLEM IT SOLVES: Provides a simple and clean method to retrieve user info.
-- JUSTIFICATION: Avoids redundant SELECT logic in application code.
-- WHEN TO USE: Use whenever user details must be displayed or verified.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_get_user (
    IN p_userId INT
)
BEGIN
    SELECT * FROM user WHERE idUser = p_userId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 6
-- usp_list_users
-- DESCRIPTION: Returns all users in the system.
--
-- PARAMETERS: None
--
-- PROBLEM IT SOLVES: Provides a reusable way to fetch the full user list.
-- JUSTIFICATION: Centralizes logic for listing users, useful for admin panels.
-- WHEN TO USE: Use when displaying all users or exporting user data.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_list_users ()
BEGIN
    SELECT * FROM user;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 7
-- usp_create_wallet
-- DESCRIPTION: Creates a wallet for a user for a specific currency.

-- PARAMETERS:
--      p_userId        INT           → Owner of the wallet
--      p_currencyId    INT           → Linked currency
--      p_initialBalance DECIMAL(10,2) → Starting balance
--
-- PROBLEM IT SOLVES: Standardizes wallet creation and encapsulates the INSERT.
-- JUSTIFICATION: Ensures new users receive the correct wallet types.
-- WHEN TO USE: Use after user registration or to manually add a wallet.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_create_wallet (
    IN p_userId INT,
    IN p_currencyId INT,
    IN p_initialBalance DECIMAL(10,2)
)
BEGIN
    INSERT INTO wallet (fkUserIdUser, fkCurrencyIdCurrency, currentBalance)
    VALUES (p_userId, p_currencyId, p_initialBalance);
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 8
-- usp_update_wallet_balance
-- DESCRIPTION: Adds or subtracts balance from a wallet.
--
-- PARAMETERS:
--      p_walletId  INT            → Wallet to update
--      p_amount    DECIMAL(10,2)  → Positive (credit) or negative (debit)
--
-- PROBLEM IT SOLVES: Ensures consistent wallet updates for deposits/withdrawals.
-- JUSTIFICATION: Centralizes wallet movement logic in one procedure.
-- WHEN TO USE: Use for transactions, rewards, refunds, or admin adjustments.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_update_wallet_balance (
    IN p_walletId INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN
    UPDATE wallet
    SET currentBalance = currentBalance + p_amount
    WHERE idWallet = p_walletId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 9
-- usp_list_wallets_by_user
-- DESCRIPTION: Returns every wallet a user owns, including currency info.
--
-- PARAMETERS:
--      p_userId INT → ID of the user
--
-- PROBLEM IT SOLVES: Provides unified financial view per user.
-- JUSTIFICATION: Wallet + currency JOIN is reusable and avoids duplication.
-- WHEN TO USE: Use in financial dashboards, profile screens, admin areas.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_list_wallets_by_user (
    IN p_userId INT
)
BEGIN
    SELECT *
    FROM wallet w
    JOIN currency c ON c.idCurrency = w.fkCurrencyIdCurrency
    WHERE w.fkUserIdUser = p_userId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 10
-- usp_create_auction
-- DESCRIPTION: Creates an auction with a title, date range, and status.
--
-- PARAMETERS:
--      p_title   VARCHAR(100) → Name of the auction
--      p_start   DATETIME     → Opening datetime
--      p_end     DATETIME     → Closing datetime
--      p_status  VARCHAR(20)  → Initial status
--
-- PROBLEM IT SOLVES: Standardizes auction creation under consistent structure.
-- JUSTIFICATION: Ensures triggers validate dates and statuses automatically.
-- WHEN TO USE: Use when creating a new auction entity.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_create_auction (
    IN p_title VARCHAR(100),
    IN p_start DATETIME,
    IN p_end DATETIME,
    IN p_status VARCHAR(20)
)
BEGIN
    INSERT INTO auction (auctionTitle, startDate, endDate, statusAuction)
    VALUES (p_title, p_start, p_end, p_status);
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 11
-- usp_update_auction_status
-- DESCRIPTION: Updates the status of an auction.
--
-- PARAMETERS:
--      p_auctionId INT         → Auction to update
--      p_status    VARCHAR(20) → New status ('Open', 'Finished', etc.)
--
-- PROBLEM IT SOLVES: Centralizes status transitions for the auction lifecycle.
-- JUSTIFICATION: Keeps consistent status naming and avoids manual SQL.
-- WHEN TO USE: Use when changing auction states (opening, canceling, etc.)
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_update_auction_status (
    IN p_auctionId INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE auction
    SET statusAuction = p_status
    WHERE idAuction = p_auctionId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 12
-- usp_open_auction
-- DESCRIPTION: Sets an auction’s status to 'open'.
--
-- PARAMETERS:
--      p_auctionId INT → ID of the auction
--
-- PROBLEM IT SOLVES: Provides a simplified method to activate auctions.
-- JUSTIFICATION: Avoids hardcoding status values across the system.
-- WHEN TO USE: Use when manually opening an auction.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_open_auction (
    IN p_auctionId INT
)
BEGIN
    UPDATE auction
    SET statusAuction = 'open'
    WHERE idAuction = p_auctionId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 13
-- usp_close_auction
-- DESCRIPTION: Closes an auction by setting status to 'closed'.
--
-- PARAMETERS:
--      p_auctionId INT → ID of the auction
--
-- PROBLEM IT SOLVES: Standardizes the closure step of an auction.
-- JUSTIFICATION: Ensures consistent termination of auction operations.
-- WHEN TO USE: Use when the auction period ends or admin forces closure.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_close_auction (
    IN p_auctionId INT
)
BEGIN
    UPDATE auction
    SET statusAuction = 'closed'
    WHERE idAuction = p_auctionId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 14
-- usp_create_lot
-- DESCRIPTION: Creates a new lot inside a specific auction.
--
-- PARAMETERS:
--      p_title       VARCHAR(100)  → Lot name/title
--      p_initialValue DECIMAL(10,2) → Starting bid value
--      p_auctionId   INT           → Auction to attach the lot to
--
-- PROBLEM IT SOLVES: Standardizes lot creation under a consistent rule-set.
-- JUSTIFICATION: Prevents manual SQL repetition throughout the system.
-- WHEN TO USE: Use when adding items to an auction.
-- =============================================================


DELIMITER $$

CREATE PROCEDURE usp_create_lot (
    IN p_title VARCHAR(100),
    IN p_initialValue DECIMAL(10,2),
    IN p_auctionId INT
)
BEGIN
    INSERT INTO lot (lotTitle, initialValue, fkAuctionIdAuction)
    VALUES (p_title, p_initialValue, p_auctionId);
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 15
-- usp_update_lot
-- DESCRIPTION: Updates the basic information of a lot.
--
-- PARAMETERS:
--      p_lotId  INT            → ID of the lot to update
--      p_title  VARCHAR(100)   → New title
--      p_value  DECIMAL(10,2)  → Updated initial value
--
-- PROBLEM IT SOLVES: Centralizes lot modification logic.
-- JUSTIFICATION: Ensures consistency in lot data updates.
-- WHEN TO USE: Use when editing lot information before auction start.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_update_lot (
    IN p_lotId INT,
    IN p_title VARCHAR(100),
    IN p_value DECIMAL(10,2)
)
BEGIN
    UPDATE lot
    SET lotTitle = p_title,
        initialValue = p_value
    WHERE idLot = p_lotId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 16
-- usp_list_lots_by_auction
-- DESCRIPTION: Lists all lots belonging to a specific auction.
--
-- PARAMETERS:
--      p_auctionId INT → Auction ID
--
-- PROBLEM IT SOLVES: Provides grouped visibility of items per auction.
-- JUSTIFICATION: Avoids repeated SELECT queries in application code.
-- WHEN TO USE: Use when displaying auction content or building pages.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_list_lots_by_auction (
    IN p_auctionId INT
)
BEGIN
    SELECT * FROM lot WHERE fkAuctionIdAuction = p_auctionId;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 17
-- usp_list_bids_by_lot
-- DESCRIPTION: Returns all bids placed for a lot, highest first.
--
-- PARAMETERS:
--      p_lotId INT → Lot to list bids from
--
-- PROBLEM IT SOLVES: Provides competitive bidding history in natural order.
-- JUSTIFICATION: Useful for user interfaces and evaluation logic.
-- WHEN TO USE: Use when displaying bidding history of a lot.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_list_bids_by_lot (
    IN p_lotId INT
)
BEGIN
    SELECT * FROM bid WHERE fkLotIdLot = p_lotId ORDER BY bidValue DESC;
END$$

DELIMITER ;

-- =============================================================
-- PROCEDURE 18
-- usp_list_bids_by_user
-- DESCRIPTION: Returns every bid made by a specific user.
--
-- PARAMETERS:
--      p_userId INT → User to filter bids by
--
-- PROBLEM IT SOLVES: Allows tracking of user financial activity and engagement.
-- JUSTIFICATION: Facilitates dashboards, history views, and audits.
-- WHEN TO USE: Use when showing a user’s bid history.
-- =============================================================

DELIMITER $$

CREATE PROCEDURE usp_list_bids_by_user (
    IN p_userId INT
)
BEGIN
    SELECT * FROM bid WHERE fkUserIdUser = p_userId ORDER BY bidDateTime DESC;
END$$

DELIMITER ;