-- DB schema --
CREATE SCHEMA utulek AUTHORIZATION "utulekAdmin";

-- Create tables --

CREATE TABLE utulek.Users (
  "Id"          BIGSERIAL       NOT NULL,
  "Username"    VARCHAR(30)     NOT NULL,
  "Hashed_pass" VARCHAR(200)    NOT NULL,
  "FirstName"   VARCHAR(30)     NOT NULL,
  "LastName"    VARCHAR(30)     NOT NULL,
  "Email"       VARCHAR(50)     NOT NULL,
  "role"        SMALLINT        NOT NULL,
  PRIMARY KEY ("Id")
);

CREATE TABLE utulek.Volunteers (
  "UserId"      BIGINT      NOT NULL,
  "verified"    BOOLEAN     NOT NULL,
  PRIMARY KEY ("UserId")
);

CREATE TABLE utulek.Vets (
  "UserId"          BIGINT      NOT NULL,
  "Specialization"  VARCHAR(30) NOT NULL,
  "Telephone"       VARCHAR(20) NOT NULL,
  PRIMARY KEY ("UserId")
);

CREATE TABLE utulek.Cats (
    "Id"          BIGSERIAL       NOT NULL,
    "Name"        VARCHAR(30)     NOT NULL,
    "SpeciesId"   BIGINT          NOT NULL,
    "Age"         SMALLINT        NOT NULL,
    "Description" VARCHAR(100)    NOT NULL,
    "Found"       DATE            NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.Species (
    "Id"          BIGSERIAL       NOT NULL,
    "Name"        VARCHAR(30)     NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.CatPhotos ( 
    "Id"          BIGSERIAL       NOT NULL,
    "CatId"       BIGINT          NOT NULL,
    "PhotoUrl"    VARCHAR(100)    NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.HealthRecords ( 
    "Id"          BIGSERIAL       NOT NULL,
    "CatId"       BIGINT          NOT NULL,
    "Date"        DATE            NOT NULL,
    "Description" VARCHAR(200)    NOT NULL,
    "UserId"       BIGINT          NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.ExaminationRequests ( 
    "Id"                BIGSERIAL       NOT NULL,
    "CatId"             BIGINT          NOT NULL,
    "CaregiverId"       BIGINT          NOT NULL,
    "RequestDate"       DATE            NOT NULL,
    "Description"       VARCHAR(200)    NOT NULL,
    "Status"            SMALLINT        NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.AvailableSlots ( 
    "Id"                BIGSERIAL           NOT NULL,
    "CatId"             BIGINT              NOT NULL,
    "StartTime"         TIMESTAMP           NOT NULL,
    "EndTime"           TIMESTAMP           NOT NULL,
    "Status"            SMALLINT            NOT NULL,
    PRIMARY KEY ("Id")
);

CREATE TABLE utulek.ReservationRequests ( 
    "Id"                BIGSERIAL           NOT NULL,
    "SlotId"            BIGINT              NOT NULL,
    "VolunteerId"       BIGINT              NOT NULL,
    "RequestDate"       DATE                NOT NULL,
    "Status"            SMALLINT            NOT NULL,
    PRIMARY KEY ("Id")
);

-- Constraints -- 
ALTER TABLE utulek.Volunteers    
    ADD CONSTRAINT FK_VolunteersUsers FOREIGN KEY ("UserId") REFERENCES utulek.Users("Id");

ALTER TABLE utulek.Vets          
    ADD CONSTRAINT FK_VetsUsers FOREIGN KEY ("UserId") REFERENCES utulek.Users("Id");

ALTER TABLE utulek.Cats
    ADD CONSTRAINT FK_CatsSpecies FOREIGN KEY ("SpeciesId") REFERENCES utulek.Species("Id");

ALTER TABLE utulek.CatPhotos
    ADD CONSTRAINT FK_CatPhotosCats FOREIGN KEY ("CatId") REFERENCES utulek.Cats("Id");

ALTER TABLE utulek.HealthRecords
    ADD CONSTRAINT FK_HealthRecordsCats FOREIGN KEY ("CatId") REFERENCES utulek.Cats("Id");

ALTER TABLE utulek.HealthRecords
    ADD CONSTRAINT FK_HealthRecordsVets FOREIGN KEY ("UserId") REFERENCES utulek.Users("Id");

ALTER TABLE utulek.ExaminationRequests
    ADD CONSTRAINT FK_ExaminationRequestsCats FOREIGN KEY ("CatId") REFERENCES utulek.Cats("Id");

ALTER TABLE utulek.ExaminationRequests
    ADD CONSTRAINT FK_ExaminationRequestsCaregivers FOREIGN KEY ("CaregiverId") REFERENCES utulek.Users("Id");

ALTER TABLE utulek.AvailableSlots
    ADD CONSTRAINT FK_AvailableSlotsCats FOREIGN KEY ("CatId") REFERENCES utulek.Cats("Id");

ALTER TABLE utulek.ReservationRequests
    ADD CONSTRAINT FK_ReservationRequestsSlots FOREIGN KEY ("SlotId") REFERENCES utulek.AvailableSlots("Id");

ALTER TABLE utulek.ReservationRequests
    ADD CONSTRAINT FK_ReservationRequestsVolunteers FOREIGN KEY ("VolunteerId") REFERENCES utulek.Volunteers("UserId");
