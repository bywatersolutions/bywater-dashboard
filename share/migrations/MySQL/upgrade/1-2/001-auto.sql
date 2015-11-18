-- Convert schema '/dashboard/share/migrations/_source/deploy/1/001-auto.yml' to '/dashboard/share/migrations/_source/deploy/2/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE columns ADD COLUMN name text NULL,
                    ADD COLUMN column_sort enum('ticket_id_asc', 'ticket_id_desc') NULL DEFAULT 'ticket_id_asc',
                    ADD COLUMN column_order integer NOT NULL DEFAULT 0;

;
ALTER TABLE users ADD UNIQUE rt_username (rt_username);

;

COMMIT;

