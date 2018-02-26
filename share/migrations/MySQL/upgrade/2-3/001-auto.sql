-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/2/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/3/001-auto.yml':;

;
BEGIN;

;
ALTER TABLE users ADD COLUMN role text NOT NULL;

;
ALTER TABLE views DROP FOREIGN KEY views_fk_role_id,
                  DROP INDEX views_idx_role_id,
                  DROP COLUMN role_id,
                  ADD COLUMN user_id integer NOT NULL,
                  ADD COLUMN extra text NULL,
                  ADD INDEX views_idx_user_id (user_id),
                  ADD CONSTRAINT views_fk_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE;

;
ALTER TABLE user_roles DROP FOREIGN KEY user_roles_fk_user_id;

;
DROP TABLE user_roles;

;

COMMIT;

