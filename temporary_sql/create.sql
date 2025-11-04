CREATE DATABASE IF NOT EXISTS Marauction
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE Marauction;
CREATE TABLE Wallet (
    idWallet INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    lastUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    currentBalance DECIMAL(10, 2) DEFAULT 0,
    creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fkCurrencyIdCurrency INT NOT NULL,
    fkUserIdUser INT NOT NULL,
    UNIQUE (fkUserIdUser, fkCurrencyIdCurrency)
);

CREATE TABLE Category (
    idCategory INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    categoryName ENUM('Games', 'Consoles', 'Customized'),
    description VARCHAR(1000)
);

CREATE TABLE ProductCategory (
    fkProductIdProduct INT NOT NULL,
    fkCategoryIdCategory INT NOT NULL,
    PRIMARY KEY (fkProductIdProduct, fkCategoryIdCategory)
);

CREATE TABLE ConditionTable (
    idCondition INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    description VARCHAR(250) NOT NULL
);

CREATE TABLE ConditionAchievement (
    fkAchievementIdAchievement INT NOT NULL,
    fkConditionIdCondition INT NOT NULL,
    PRIMARY KEY (fkAchievementIdAchievement, fkConditionIdCondition)
);

CREATE TABLE Achievement (
    idAchievement INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(100),
    description VARCHAR(255)
);

CREATE TABLE AchievementUser (
    fkAchievementIdAchievement INT NOT NULL,
    fkUserIdUser INT NOT NULL,
    PRIMARY KEY (fkAchievementIdAchievement, fkUserIdUser)
);

CREATE TABLE Address (
    idAddress INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    zipCode CHAR(8),
    country VARCHAR(30),
    state VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    street VARCHAR(60),
    number INT,
    complement VARCHAR(50)
);

CREATE TABLE Image (
    idImage INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    fileName VARCHAR(100)
);

CREATE TABLE ProductImage (
    fkProductIdProduct INT NOT NULL,
    fkImageIdImage INT NOT NULL,
    displayOrder INT DEFAULT 1,
    PRIMARY KEY (fkProductIdProduct, fkImageIdImage)
);

CREATE TABLE Bid (
    idBid INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    bidValue DECIMAL(10, 2) NOT NULL,
    bidDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fkUserIdUser INT NOT NULL,
    fkLotIdLot INT NOT NULL
);

CREATE TABLE Auction (
    idAuction INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(150),
    description VARCHAR(500),
    startDate DATETIME,
    endDate DATETIME,
    status ENUM('Scheduled', 'Open', 'Finished', 'Canceled'),
    fkUserIdUser INT NOT NULL
);

CREATE TABLE Lot (
    idLot INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    minimumIncrement DECIMAL(10, 2),
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    minimumBid DECIMAL(10, 2),
    lotNumber INT,
    fkAuctionIdAuction INT NOT NULL
);

CREATE TABLE Currency (
    idCurrency INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    currencyType ENUM('Internal', 'External'),
    currencyName VARCHAR(15),
    conversionToReal DECIMAL(7,2)
);

CREATE TABLE Product (
    idProduct INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    description VARCHAR(500),
    activationKey VARCHAR(1000),
    downloadValidity DATETIME,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    depth DECIMAL(5,2),
    downloadUrl VARCHAR(1000),
    productType ENUM('Physical', 'Digital'),
    manufacturer VARCHAR(50),
    width DECIMAL(5,2),
    productName VARCHAR(150),
    fkLotIdLot INT NOT NULL
);

CREATE TABLE Transactions (
    idTransaction INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    value DECIMAL(10, 2),
    transactionType ENUM('Income', 'Expense'),
    description VARCHAR(500),
    fkLotIdLot INT,
    fkReceivingWalletIdWallet INT,
    fkPayingWalletIdWallet INT
);

CREATE TABLE User (
    idUser INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(100),
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profilePhoto VARCHAR(100),
    phone VARCHAR(20),
    birthDate DATETIME,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fkAddressIdAddress INT NOT NULL
);

ALTER TABLE Wallet ADD CONSTRAINT fkWalletCurrency
    FOREIGN KEY (fkCurrencyIdCurrency)
    REFERENCES Currency (idCurrency)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Wallet ADD CONSTRAINT fkWalletUser
    FOREIGN KEY (fkUserIdUser)
    REFERENCES User (idUser)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ProductCategory ADD CONSTRAINT fkProductCategory1
    FOREIGN KEY (fkProductIdProduct)
    REFERENCES Product (idProduct)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ProductCategory ADD CONSTRAINT fkProductCategory2
    FOREIGN KEY (fkCategoryIdCategory)
    REFERENCES Category (idCategory)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ConditionAchievement ADD CONSTRAINT fkConditionAchievement1
    FOREIGN KEY (fkAchievementIdAchievement)
    REFERENCES Achievement (idAchievement)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ConditionAchievement ADD CONSTRAINT fkConditionAchievement2
    FOREIGN KEY (fkConditionIdCondition)
    REFERENCES ConditionTable (idCondition)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE AchievementUser ADD CONSTRAINT fkAchievementUser1
    FOREIGN KEY (fkAchievementIdAchievement)
    REFERENCES Achievement (idAchievement)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE AchievementUser ADD CONSTRAINT fkAchievementUser2
    FOREIGN KEY (fkUserIdUser)
    REFERENCES User (idUser)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ProductImage ADD CONSTRAINT fkProductImage1
    FOREIGN KEY (fkProductIdProduct)
    REFERENCES Product (idProduct)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE ProductImage ADD CONSTRAINT fkProductImage2
    FOREIGN KEY (fkImageIdImage)
    REFERENCES Image (idImage)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Bid ADD CONSTRAINT fkBidLot
    FOREIGN KEY (fkLotIdLot)
    REFERENCES Lot (idLot)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Bid ADD CONSTRAINT fkBidUser
    FOREIGN KEY (fkUserIdUser)
    REFERENCES User (idUser)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Auction ADD CONSTRAINT fkAuctionUser
    FOREIGN KEY (fkUserIdUser)
    REFERENCES User (idUser)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Lot ADD CONSTRAINT fkLotAuction
    FOREIGN KEY (fkAuctionIdAuction)
    REFERENCES Auction (idAuction)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE Product ADD CONSTRAINT fkProductLot
    FOREIGN KEY (fkLotIdLot)
    REFERENCES Lot (idLot)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE Transactions ADD CONSTRAINT fkTransactionPayingWallet
    FOREIGN KEY (fkPayingWalletIdWallet)
    REFERENCES Wallet (idWallet)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Transactions ADD CONSTRAINT fkTransactionReceivingWallet
    FOREIGN KEY (fkReceivingWalletIdWallet)
    REFERENCES Wallet (idWallet)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Transactions ADD CONSTRAINT fkTransactionLot
    FOREIGN KEY (fkLotIdLot)
    REFERENCES Lot (idLot)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE User ADD CONSTRAINT fkUserAddress
    FOREIGN KEY (fkAddressIdAddress)
    REFERENCES Address (idAddress)
    ON DELETE RESTRICT ON UPDATE CASCADE;

use marauction;
select * from user