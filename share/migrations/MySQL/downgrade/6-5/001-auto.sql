-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/6/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/5/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE users DROP COLUMN real_name,
                  ADD COLUMN first_name text NULL,
                  ADD COLUMN last_name text NULL;

;

COMMIT;

