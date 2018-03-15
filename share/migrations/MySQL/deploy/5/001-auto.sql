-- 
-- Created by SQL::Translator::Producer::MySQL
-- Created on Wed Mar 14 17:54:06 2018
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
  `name` text NULL,
  `drop_action` text NULL,
  `column_sort` enum('ticket_id_asc', 'ticket_id_desc') NULL DEFAULT 'ticket_id_asc',
  `column_order` integer NOT NULL DEFAULT 0,
  INDEX `columns_idx_view_id` (`view_id`),
  PRIMARY KEY (`column_id`),
  CONSTRAINT `columns_fk_view_id` FOREIGN KEY (`view_id`) REFERENCES `views` (`view_id`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `role` text NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE `rt_username` (`rt_username`)
) ENGINE=InnoDB;
--
-- Table: `views`
--
CREATE TABLE `views` (
  `view_id` integer NOT NULL auto_increment,
  `user_id` integer NOT NULL,
  `name` text NOT NULL,
  `extra` text NULL,
  INDEX `views_idx_user_id` (`user_id`),
  PRIMARY KEY (`view_id`),
  CONSTRAINT `views_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
SET foreign_key_checks=1;
