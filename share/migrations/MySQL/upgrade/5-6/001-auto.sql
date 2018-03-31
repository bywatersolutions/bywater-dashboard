-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/5/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/6/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE users ADD COLUMN real_name varchar(255) NULL;

UPDATE users SET real_name = CONCAT(first_name, ' ', last_name);

ALTER TABLE users MODIFY COLUMN real_name varchar(255) NOT NULL,
                  DROP COLUMN first_name,
                  DROP COLUMN last_name;

;

COMMIT;

