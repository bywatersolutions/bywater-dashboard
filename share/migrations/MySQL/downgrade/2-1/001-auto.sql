-- Convert schema '/dashboard/share/migrations/_source/deploy/2/001-auto.yml' to '/dashboard/share/migrations/_source/deploy/1/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE columns DROP COLUMN name,
                    DROP COLUMN column_sort,
                    DROP COLUMN column_order;

;
ALTER TABLE users DROP INDEX rt_username;

;

COMMIT;

