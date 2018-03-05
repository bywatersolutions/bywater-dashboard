-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/4/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/3/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE views CHANGE COLUMN name name text NULL;

;

COMMIT;

