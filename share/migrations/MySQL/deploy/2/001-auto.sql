-- 
-- Created by SQL::Translator::Producer::MySQL
-- Created on Wed Nov 18 10:26:49 2015
-- 
;
SET foreign_key_checks=0;
--
-- Table: `columns`
--
CREATE TABLE `columns` (
  `column_id` integer NOT NULL auto_increment,
  `view_id` integer NOT NULL,
  `type` enum('rt', 'custom') NULL,
  `rt_query` text NULL,
  INDEX `columns_idx_view_id` (`view_id`),
  PRIMARY KEY (`column_id`),
  CONSTRAINT `columns_fk_view_id` FOREIGN KEY (`view_id`) REFERENCES `views` (`view_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
--
-- Table: `user_roles`
--
CREATE TABLE `user_roles` (
  `role_id` integer NOT NULL auto_increment,
  `user_id` integer NOT NULL,
  `role` enum('employee', 'lead') NULL,
  INDEX `user_roles_idx_user_id` (`user_id`),
  PRIMARY KEY (`role_id`),
  UNIQUE `user_id` (`user_id`, `role`),
  CONSTRAINT `user_roles_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
--
-- Table: `users`
--
CREATE TABLE `users` (
  `user_id` integer NOT NULL auto_increment,
  `rt_username` varchar(255) NOT NULL,
  `first_name` text NULL,
  `last_name` text NULL,
  `avatar_url` text NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE `rt_username` (`rt_username`)
) ENGINE=InnoDB;
--
-- Table: `views`
--
CREATE TABLE `views` (
  `view_id` integer NOT NULL auto_increment,
  `role_id` integer NULL,
  `name` text NULL,
  INDEX `views_idx_role_id` (`role_id`),
  PRIMARY KEY (`view_id`),
  CONSTRAINT `views_fk_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
SET foreign_key_checks=1;
