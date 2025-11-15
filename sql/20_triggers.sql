/* ============================================================
   TRIGGER 1
   trg_user_email_unique
   OBJECTIVE: Ensure that no user is created with an already registered email
   PROBLEM THAT SOLVES: Prevents duplicate accounts, identity conflicts, and issues in the authentication flow
   JUSTIFICATIVE: Email is a unique and essential field for login and password recovery; duplicates break system integrity
   WHEN IT FIRES: This trigger is executed every time an INSERT statement attempts to add a new row into the `user` table. It fires *before* the insertion happens, to validate that the email provided in NEW.email does not already exist in the table.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_user_email_unique
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM user WHERE email = NEW.email) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'this email is already been used';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 2
   trg_user_password_required
   OBJECTIVE: Ensure that all users are created with a valid password
   PROBLEM THAT SOLVES: Prevents accounts from being created without login credentials, which breaks authentication and compromises security
   JUSTIFICATIVE: A password is mandatory; accounts without passwords generate serious security risks and access issues
   WHEN IT FIRES: Fires BEFORE every INSERT into the `user` table. It runs whenever a new user is about to be created, validating that NEW.userPassword contains a non-empty value.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_user_password_required
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF NEW.userPassword IS NULL OR NEW.userPassword = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'you must insert a password';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 3
   trg_user_email_format
   OBJECTIVE: Validate the basic email format before inserting a user
   PROBLEM THAT SOLVES: Prevents malformed email registrations that could break communication and recovery processes
   JUSTIFICATIVE: Invalid emails cause login issues, notification failures, and inconsistent data
   WHEN IT FIRES: Fires BEFORE a row is inserted into the `user` table. It checks the format of NEW.email during an INSERT operation.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_user_email_format
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF NEW.email NOT LIKE '%_@_%._%' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'invalid email format';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 4
   trg_auction_date_check
   OBJECTIVE: Ensure that the auction end date is after the start date
   PROBLEM THAT SOLVES: Prevents invalid or logically impossible auctions
   JUSTIFICATIVE: Temporal consistency is essential for the correct functioning of the auction lifecycle
   WHEN IT FIRES: Fires BEFORE inserting a new auction into the `auction` table. Runs on INSERT to verify date ordering (start before end).
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_auction_date_check
BEFORE INSERT ON auction
FOR EACH ROW
BEGIN
    IF NEW.endDate <= NEW.startDate THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'invalid end date';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 5
   trg_auction_status_valid
   OBJECTIVE: Prevent the creation of auctions with invalid or unsupported statuses
   PROBLEM THAT SOLVES: Avoids unexpected states that could break auction processes
   JUSTIFICATIVE: The auction flow depends on predefined, valid states to function properly
   WHEN IT FIRES: Fires BEFORE every INSERT into the `auction` table. Activated when an auction is created, validating NEW.statusAuction.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_auction_status_valid
BEFORE INSERT ON auction
FOR EACH ROW
BEGIN
    IF NEW.statusAuction NOT IN ('Scheduled','Open','Finished','Canceled') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'invalid status for auction';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 6
   trg_bid_value_positive
   OBJECTIVE: Prevent insertion of bids with zero or negative value
   PROBLEM THAT SOLVES: Avoids invalid and meaningless bids that break auction logic
   JUSTIFICATIVE: A bid must represent real financial intent, therefore the value must always be positive
   WHEN IT FIRES: Fires BEFORE each INSERT on the `bid` table. Triggered whenever a new bid is placed and checks NEW.bidValue.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_bid_value_positive
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    IF NEW.bidValue <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'invalid bid, your bid must be bigger than zero';
    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 7
   trg_bid_sufficient_balance
   OBJECTIVE: Ensure the user has enough coins to place the bid.
   PROBLEM THAT SOLVES: Prevents users from placing bids they cannot afford, maintaining financial integrity
   JUSTIFICATIVE: The internal coin system requires strict balance control to avoid fraud and inconsistencies
   WHEN IT FIRES: Fires BEFORE inserting a new row into `bid`. Runs every time a user attempts to place a bid, checking all wallets linked to NEW.fkUserIdUser.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_bid_sufficient_balance
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE totalBalance DECIMAL(10,2);

    SELECT SUM(currentBalance)
    INTO totalBalance
    FROM wallet
    WHERE fkUserIdUser = NEW.fkUserIdUser;

    IF totalBalance IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User has no wallets.';
    END IF;

    IF NEW.bidValue > totalBalance THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient balance for this bid.';
    END IF;

END$$

DELIMITER ;

/* ============================================================
   TRIGGER 8
   trg_bid_auction_active
   OBJECTIVE: Block bids placed on auctions that are not currently active
   PROBLEM THAT SOLVES: Prevents invalid bid submissions and user frustration caused by interacting with inactive or scheduled auctions
   JUSTIFICATIVE: Bids are only allowed while the auction is active, following the defined lifecycle
   WHEN IT FIRES: Fires BEFORE each INSERT into the `bid` table. Triggered when a new bid is created, validating that:
		- The lot belongs to an auction
		- The auction is “Open”
		- The current datetime is within start/end intervals
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_bid_auction_active
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE auction_status VARCHAR(20);
    DECLARE auction_end DATETIME;
    DECLARE auction_start DATETIME;

    SELECT a.statusAuction, a.startDate, a.endDate
    INTO auction_status, auction_start, auction_end
    FROM lot l
    JOIN auction a ON a.idAuction = l.fkAuctionIdAuction
    WHERE l.idLot = NEW.fkLotIdLot
    LIMIT 1;

    IF auction_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid bid: this lot is not part of any auction.';
    END IF;

    IF auction_status <> 'Open'
       OR NOW() < auction_start
       OR NOW() > auction_end THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Auction not open — bids are not allowed.';
    END IF;

END$$

DELIMITER ;

DROP TRIGGER trg_bid_auction_active;
/* ============================================================
   TRIGGER 9 
   trg_bid_must_be_higher
   OBJECTIVE: Ensure that the new bid exceeds the current highest bid
   PROBLEM THAT SOLVES: Prevents equal or lower bids that break the competitive logic of the auction
   JUSTIFICATIVE: Auctions are built on incremental bidding; equal or lower bids are inherently invalid
   WHEN IT FIRES: Fires BEFORE inserting a new bid into the `bid` table. Runs whenever an INSERT occurs, comparing NEW.bidValue with all existing bids for the same lot.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_bid_must_be_higher
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE highest DECIMAL(10,2);

    SELECT MAX(bidValue)
    INTO highest
    FROM bid
    WHERE fkLotIdLot = NEW.fkLotIdLot;

    IF highest IS NOT NULL AND NEW.bidValue <= highest THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid bid: value must be higher than current highest bid.';
    END IF;

    IF NEW.bidValue <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid bid: bid value must be greater than zero.';
    END IF;

END$$

DELIMITER ;

/* ============================================================
   TRIGGER 10
   trg_update_winner
   OBJECTIVE: Automatically update the lot winner after each new valid bid
   PROBLEM THAT SOLVES: Keeps the winner information always up-to-date without needing external processing
   JUSTIFICATIVE: Ensures data consistency and reduces the need for manual or application-level updates
   WHEN IT FIRES: Fires AFTER a new bid is successfully inserted in `bid`. Only executes if the INSERT completes without being blocked. Updates the corresponding lot’s currentWinnerId and currentBidValue.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_update_current_winner
AFTER INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE highest DECIMAL(10,2);

    SELECT MAX(bidValue)
    INTO highest
    FROM bid
    WHERE fkLotIdLot = NEW.fkLotIdLot
      AND idBid <> NEW.idBid;

    IF highest IS NULL OR NEW.bidValue > highest THEN

        UPDATE lot
        SET currentWinnerId = NEW.fkUserIdUser,
            currentBidValue = NEW.bidValue
        WHERE idLot = NEW.fkLotIdLot;

    END IF;
END$$

DELIMITER ;

/* ============================================================
   TRIGGER 11
   trg_bid_after_end
   OBJECTIVE: Block bids submitted after the official auction end date
   PROBLEM THAT SOLVES: Prevents manipulation, late entries, and inconsistent bid records
   JUSTIFICATIVE: A closed auction cannot accept new bids; enforcing this maintains temporal and transactional integrity
   WHEN IT FIRES: Fires BEFORE inserting a new bid into `bid`. Runs whenever a bid is attempted, comparing NOW() with the lot’s auction endDate.
============================================================= */

DELIMITER $$

CREATE TRIGGER trg_bid_after_end
BEFORE INSERT ON bid
FOR EACH ROW
BEGIN
    DECLARE fim DATETIME;

    SELECT a.endDate INTO fim
    FROM lot l
    JOIN auction a ON a.idAuction = l.fkAuctionIdAuction
    WHERE l.idLot = NEW.fkLotIdLot;

    IF NOW() > fim THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'auction already ended';
    END IF;
END$$

DELIMITER ;