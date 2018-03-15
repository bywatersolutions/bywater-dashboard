-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/5/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/4/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE columns DROP COLUMN drop_action;

;

COMMIT;

