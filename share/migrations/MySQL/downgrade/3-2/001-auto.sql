-- Convert schema '/home/feoh3/p/supportal/share/migrations/_source/deploy/3/001-auto.yml' to '/home/feoh3/p/supportal/share/migrations/_source/deploy/2/001-auto.yml':;

;
BEGIN;

;
SET foreign_key_checks=0;

;
DROP TABLE IF EXISTS `user_roles`;

;
CREATE TABLE `user_roles` (
  `role_id` integer NOT NULL auto_increment,
  `user_id` integer NOT NULL,
  `role` enum('employee', 'lead') NULL,
  INDEX `user_roles_idx_user_id` (`user_id`),
  PRIMARY KEY (`role_id`),
  UNIQUE `user_id` (`user_id`, `role`),
  CONSTRAINT `user_roles_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

;
SET foreign_key_checks=1;

;
ALTER TABLE users DROP COLUMN role;

;
ALTER TABLE views DROP FOREIGN KEY views_fk_user_id,
                  DROP INDEX views_idx_user_id,
                  DROP COLUMN user_id,
                  DROP COLUMN extra,
                  ADD COLUMN role_id integer NULL,
                  ADD INDEX views_idx_role_id (role_id),
                  ADD CONSTRAINT views_fk_role_id FOREIGN KEY (role_id) REFERENCES user_roles (role_id) ON DELETE CASCADE ON UPDATE CASCADE;

;

COMMIT;

