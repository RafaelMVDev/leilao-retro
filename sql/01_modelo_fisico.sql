/* ============================================================
   File: 01_modelo_fisico.sql
   Author(s): Calixto, Júlia; Henrique, Luis; Morales, Rafael; Moreira, Rafael
   Project: Marauction
   Class: 213
   DBMS: MySQL 8.0.41
   OBJECTIVE: Physical model creation (tables, constraints, relationships)
   EXPECTED PERFORMANCE:
		- Create all database tables
        - Define primary keys, foreign keys, and constraints
        - Ensure referential integrity across the model
========================================================== */

CREATE DATABASE IF NOT EXISTS Marauction
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;
	USE Marauction;
    
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
	district VARCHAR(50),
	street VARCHAR(60),
	numberAddress INT,
	complement VARCHAR(50)
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

CREATE TABLE Bid (
	idBid INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	bidValue DECIMAL(10, 2) NOT NULL,
	bidDateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	fkUserIdUser INT NOT NULL,
	fkLotIdLot INT NOT NULL
);

CREATE TABLE Category (
	idCategory INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	categoryName ENUM('Games', 'Consoles', 'Customized'),
	descriptionCategory VARCHAR(1000)
);

CREATE TABLE CategoryProduct (
	fkProductIdProduct INT NOT NULL,
	fkCategoryIdCategory INT NOT NULL,
	PRIMARY KEY (fkProductIdProduct, fkCategoryIdCategory)
);

CREATE TABLE City (
	idCity INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nameCity VARCHAR(50)
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

CREATE TABLE Country (
	idCountry INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    nameCountry VARCHAR(30)
);

CREATE TABLE Currency (
	idCurrency INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	currencyType ENUM('Internal', 'External'),
	currencyName VARCHAR(15)
);

CREATE TABLE Image (
	idImage INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	fileName VARCHAR(100)
);

CREATE TABLE Lot (
	idLot INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	minimumIncrement DECIMAL(10, 2),
	registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	minimumBid DECIMAL(10, 2),
	lotNumber INT,
	fkAuctionIdAuction INT NOT NULL
);

CREATE TABLE Product (
	idProduct INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	descriptionProduct VARCHAR(500),
	activationKey VARCHAR(1000),
	downloadValidity DATETIME,
	weight DECIMAL(7,2),
	height DECIMAL(7,2),
	depth DECIMAL(7,2),
	downloadUrl VARCHAR(1000),
	productType ENUM('Physical', 'Digital'),
	manufacturer VARCHAR(50),
	width DECIMAL(7,2),
	productName VARCHAR(150),
	fkLotIdLot INT NOT NULL
);

CREATE TABLE ProductImage (
	fkProductIdProduct INT NOT NULL,
    fkImageIdImage INT NOT NULL,
    displayOrder INT
);

CREATE TABLE State (
	idState INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    stateName VARCHAR(50)
);

CREATE TABLE TransactionTable (
	idTransaction INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	transactionValue DECIMAL(10, 2),
	transactionType ENUM('Income', 'Expense'),
	transactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	fkLotIdLot INT,
	fkReceivingWalletIdWallet INT,
	fkPayingWalletIdWallet INT
);

CREATE TABLE User (
	idUser INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	nickname VARCHAR(50) NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(100),
	email VARCHAR(150) NOT NULL UNIQUE,
	userPassword VARCHAR(255) NOT NULL,
	profilePhoto VARCHAR(100),
	phone VARCHAR(20),
	birthDate DATETIME,
	registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserAddress (
	fkUserIdUser INT NOT NULL,
	fkAddressIdAddress INT NOT NULL,
	PRIMARY KEY (fkUserIdUser, fkAddressIdAddress)
);

CREATE TABLE Wallet (
	idWallet INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	lastUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE
	CURRENT_TIMESTAMP,
	currentBalance DECIMAL(10, 2) DEFAULT 0,
	creationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	fkCurrencyIdCurrency INT NOT NULL,
	fkUserIdUser INT NOT NULL,
	UNIQUE (fkUserIdUser, fkCurrencyIdCurrency)
);

ALTER TABLE Wallet ADD CONSTRAINT fkWalletCurrency
	FOREIGN KEY (fkCurrencyIdCurrency)
	REFERENCES Currency (idCurrency)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Wallet ADD CONSTRAINT fkWalletUser
	FOREIGN KEY (fkUserIdUser)
	REFERENCES User (idUser)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE CategoryProduct ADD CONSTRAINT fkProductCategory1
	FOREIGN KEY (fkProductIdProduct)
	REFERENCES Product (idProduct)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE CategoryProduct ADD CONSTRAINT fkProductCategory2
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

ALTER TABLE TransactionTable ADD CONSTRAINT fkTransactionPayingWallet
	FOREIGN KEY (fkPayingWalletIdWallet)
	REFERENCES Wallet (idWallet)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE TransactionTable ADD CONSTRAINT fkTransactionReceivingWallet
	FOREIGN KEY (fkReceivingWalletIdWallet)
	REFERENCES Wallet (idWallet)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE TransactionTable ADD CONSTRAINT fkTransactionLot
	FOREIGN KEY (fkLotIdLot)
	REFERENCES Lot (idLot)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE UserAddress ADD CONSTRAINT fkUserAddress1
	FOREIGN KEY (fkAddressIdAddress)
	REFERENCES Address (idAddress)
	ON DELETE RESTRICT ON UPDATE CASCADE;
    
ALTER TABLE UserAddress ADD CONSTRAINT fkUserAddress2
	FOREIGN KEY (fkUserIdUser)
	REFERENCES user (idUser)
	ON DELETE RESTRICT ON UPDATE CASCADE;
    
ALTER TABLE State
	ADD COLUMN fkCountryIdCountry INT;
    
ALTER TABLE State ADD CONSTRAINT fkStateCountry
	FOREIGN KEY (fkCountryIdCountry)
	REFERENCES Country (idCountry)
	ON DELETE CASCADE ON UPDATE CASCADE;
    
ALTER TABLE City
	ADD COLUMN fkStateIdState INT;
    
ALTER TABLE City ADD CONSTRAINT fkCityState
	FOREIGN KEY (fkStateIdState)
	REFERENCES State (idState)
	ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE Address
	ADD COLUMN fkCityIdCity INT;
    
ALTER TABLE Address ADD CONSTRAINT fkAddressCity
	FOREIGN KEY (fkCityIdCity)
	REFERENCES City (idCity)
	ON DELETE CASCADE ON UPDATE CASCADE;
    
ALTER TABLE lot
ADD COLUMN currentWinnerId INT NULL,
ADD CONSTRAINT fk_currentWinner_user
  FOREIGN KEY (currentWinnerId) REFERENCES user(idUser);
  
ALTER TABLE lot
ADD COLUMN currentBidValue DECIMAL(10,2) DEFAULT 0;

ALTER TABLE user
ADD COLUMN admin BOOLEAN;

ALTER TABLE user
ADD COLUMN isAuthenticated BOOLEAN;

ALTER TABLE user
ADD COLUMN cpf char(11);