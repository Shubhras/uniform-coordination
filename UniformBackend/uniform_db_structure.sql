-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: uniform_db
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contracts_docusignenvelope`
--

DROP TABLE IF EXISTS `contracts_docusignenvelope`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts_docusignenvelope` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `envelope_id` varchar(100) NOT NULL,
  `status` varchar(20) NOT NULL,
  `signed_pdf` varchar(100) DEFAULT NULL,
  `audit_log` json DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `quotation_request_id` char(32) DEFAULT NULL,
  `admin_approved_at` datetime(6) DEFAULT NULL,
  `agreement_status` varchar(30) NOT NULL,
  `client_signed_at` datetime(6) DEFAULT NULL,
  `final_sent_at` datetime(6) DEFAULT NULL,
  `order_id` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `envelope_id` (`envelope_id`),
  KEY `contracts_docusignenvelope_quotation_request_id_ab7704b7` (`quotation_request_id`),
  CONSTRAINT `contracts_docusignen_quotation_request_id_ab7704b7_fk_userhub_q` FOREIGN KEY (`quotation_request_id`) REFERENCES `userhub_quotationrequest` (`uuids`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rental_rentalproduct`
--

DROP TABLE IF EXISTS `rental_rentalproduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rental_rentalproduct` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quantity` int NOT NULL,
  `is_returned` tinyint(1) NOT NULL,
  `returned_at` datetime(6) DEFAULT NULL,
  `before_image` varchar(100) DEFAULT NULL,
  `after_image` varchar(100) DEFAULT NULL,
  `is_damaged` tinyint(1) NOT NULL,
  `extra_charges` double NOT NULL,
  `lost_charges` double NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `order_id` char(32) NOT NULL,
  `order_item_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rental_rentalproduct_order_id_9f0bef56_fk_userhub_order_order_id` (`order_id`),
  KEY `rental_rentalproduct_product_id_4c63d480_fk_uniformAd` (`product_id`),
  KEY `rental_rentalproduct_order_item_id_e354f19a_fk_userhub_o` (`order_item_id`),
  CONSTRAINT `rental_rentalproduct_order_id_9f0bef56_fk_userhub_order_order_id` FOREIGN KEY (`order_id`) REFERENCES `userhub_order` (`order_id`),
  CONSTRAINT `rental_rentalproduct_order_item_id_e354f19a_fk_userhub_o` FOREIGN KEY (`order_item_id`) REFERENCES `userhub_orderitem` (`id`),
  CONSTRAINT `rental_rentalproduct_product_id_4c63d480_fk_uniformAd` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `token_blacklist_blacklistedtoken`
--

DROP TABLE IF EXISTS `token_blacklist_blacklistedtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_id` (`token_id`),
  CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `token_blacklist_outstandingtoken`
--

DROP TABLE IF EXISTS `token_blacklist_outstandingtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` int DEFAULT NULL,
  `jti` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  KEY `token_blacklist_outs_user_id_83bc629a_fk_auth_user` (`user_id`),
  CONSTRAINT `token_blacklist_outs_user_id_83bc629a_fk_auth_user` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_adminnotification`
--

DROP TABLE IF EXISTS `uniformAdmin_adminnotification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_adminnotification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `object_id` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `priority` varchar(10) NOT NULL,
  `is_seen` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `content_type_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_adminno_content_type_id_d8d0b9c7_fk_django_co` (`content_type_id`),
  CONSTRAINT `uniformAdmin_adminno_content_type_id_d8d0b9c7_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_adminuser`
--

DROP TABLE IF EXISTS `uniformAdmin_adminuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_adminuser` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `language` varchar(10) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `role_id` bigint DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `tier` varchar(60) DEFAULT NULL,
  `is_currently_login` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `mobile` (`mobile`),
  KEY `uniformAdmin_adminuser_role_id_bab73c92_fk_uniformAdmin_role_id` (`role_id`),
  CONSTRAINT `uniformAdmin_adminuser_role_id_bab73c92_fk_uniformAdmin_role_id` FOREIGN KEY (`role_id`) REFERENCES `uniformAdmin_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_adminuser_groups`
--

DROP TABLE IF EXISTS `uniformAdmin_adminuser_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_adminuser_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adminuser_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniformAdmin_adminuser_g_adminuser_id_group_id_e0a13481_uniq` (`adminuser_id`,`group_id`),
  KEY `uniformAdmin_adminuser_groups_group_id_c4fc6539_fk_auth_group_id` (`group_id`),
  CONSTRAINT `uniformAdmin_adminus_adminuser_id_23ab450f_fk_uniformAd` FOREIGN KEY (`adminuser_id`) REFERENCES `uniformAdmin_adminuser` (`id`),
  CONSTRAINT `uniformAdmin_adminuser_groups_group_id_c4fc6539_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_adminuser_user_permissions`
--

DROP TABLE IF EXISTS `uniformAdmin_adminuser_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_adminuser_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `adminuser_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniformAdmin_adminuser_u_adminuser_id_permission__1a3fa0c7_uniq` (`adminuser_id`,`permission_id`),
  KEY `uniformAdmin_adminus_permission_id_d314770a_fk_auth_perm` (`permission_id`),
  CONSTRAINT `uniformAdmin_adminus_adminuser_id_5fd885eb_fk_uniformAd` FOREIGN KEY (`adminuser_id`) REFERENCES `uniformAdmin_adminuser` (`id`),
  CONSTRAINT `uniformAdmin_adminus_permission_id_d314770a_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_blog`
--

DROP TABLE IF EXISTS `uniformAdmin_blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_blog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(250) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `image` varchar(100) DEFAULT NULL,
  `description` longtext NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint NOT NULL,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_blog_category_id_13632582_fk_uniformAd` (`category_id`),
  CONSTRAINT `uniformAdmin_blog_category_id_13632582_fk_uniformAd` FOREIGN KEY (`category_id`) REFERENCES `uniformAdmin_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_catalogimage`
--

DROP TABLE IF EXISTS `uniformAdmin_catalogimage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_catalogimage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `category_id` bigint NOT NULL,
  `description` varchar(250) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_category` (`category_id`),
  KEY `uniformAdmin_catalogimage_slug_a805e150` (`slug`),
  CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `uniformAdmin_category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_category`
--

DROP TABLE IF EXISTS `uniformAdmin_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(250) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `order` int unsigned NOT NULL,
  `categoryImage` varchar(100) DEFAULT NULL,
  `description` varchar(250) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_category_order_b5c3e7e9` (`order`),
  CONSTRAINT `uniformAdmin_category_chk_1` CHECK ((`order` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_colors`
--

DROP TABLE IF EXISTS `uniformAdmin_colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_colors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `colorName` varchar(250) NOT NULL,
  `colorCode` longtext,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `compatibleFabric` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_colors_compatibleFabric`
--

DROP TABLE IF EXISTS `uniformAdmin_colors_compatibleFabric`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_colors_compatibleFabric` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `colors_id` bigint NOT NULL,
  `fabric_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniformAdmin_colors_comp_colors_id_fabric_id_6f0349c6_uniq` (`colors_id`,`fabric_id`),
  KEY `uniformAdmin_colors__fabric_id_33bb27c1_fk_uniformAd` (`fabric_id`),
  CONSTRAINT `uniformAdmin_colors__colors_id_c7b50a24_fk_uniformAd` FOREIGN KEY (`colors_id`) REFERENCES `uniformAdmin_colors` (`id`),
  CONSTRAINT `uniformAdmin_colors__fabric_id_33bb27c1_fk_uniformAd` FOREIGN KEY (`fabric_id`) REFERENCES `uniformAdmin_fabric` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_fabric`
--

DROP TABLE IF EXISTS `uniformAdmin_fabric`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_fabric` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `fabricName` varchar(150) NOT NULL,
  `color` varchar(100) NOT NULL,
  `materialType` varchar(60) NOT NULL,
  `pricePerUnit` decimal(10,2) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `fabricType` varchar(20) NOT NULL,
  `theme_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fabricName` (`fabricName`),
  KEY `uniformAdmin_fabric_theme_id_d7984d56_fk_uniformAd` (`theme_id`),
  CONSTRAINT `uniformAdmin_fabric_theme_id_d7984d56_fk_uniformAd` FOREIGN KEY (`theme_id`) REFERENCES `uniformAdmin_tabletheme` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_faq`
--

DROP TABLE IF EXISTS `uniformAdmin_faq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_faq` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_faqdescription`
--

DROP TABLE IF EXISTS `uniformAdmin_faqdescription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_faqdescription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` longtext NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `faq_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_faqdesc_faq_id_f1132392_fk_uniformAd` (`faq_id`),
  CONSTRAINT `uniformAdmin_faqdesc_faq_id_f1132392_fk_uniformAd` FOREIGN KEY (`faq_id`) REFERENCES `uniformAdmin_faq` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_parts`
--

DROP TABLE IF EXISTS `uniformAdmin_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_parts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `partName` varchar(150) NOT NULL,
  `partImage` varchar(100) DEFAULT NULL,
  `category` varchar(60) NOT NULL,
  `usageTemmpCount` int NOT NULL,
  `zIndex` int NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `fabric_id` bigint NOT NULL,
  `partType` varchar(20) NOT NULL,
  `theme_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partName` (`partName`),
  KEY `uniformAdmin_parts_fabric_id_9137442d_fk_uniformAdmin_fabric_id` (`fabric_id`),
  KEY `uniformAdmin_parts_theme_id_433e1229_fk_uniformAd` (`theme_id`),
  CONSTRAINT `uniformAdmin_parts_fabric_id_9137442d_fk_uniformAdmin_fabric_id` FOREIGN KEY (`fabric_id`) REFERENCES `uniformAdmin_fabric` (`id`),
  CONSTRAINT `uniformAdmin_parts_theme_id_433e1229_fk_uniformAd` FOREIGN KEY (`theme_id`) REFERENCES `uniformAdmin_tabletheme` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_privacypolicy`
--

DROP TABLE IF EXISTS `uniformAdmin_privacypolicy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_privacypolicy` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `privacyPolicyType` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `content` longtext NOT NULL,
  `language` varchar(10) NOT NULL,
  `version` varchar(20) NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_product`
--

DROP TABLE IF EXISTS `uniformAdmin_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `productName` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` longtext,
  `productType` varchar(20) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `total_quantity` int unsigned NOT NULL,
  `available_quantity` int unsigned NOT NULL,
  `ProductImage` varchar(100) DEFAULT NULL,
  `discount` int unsigned DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isPopular` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `subcategory_id` bigint DEFAULT NULL,
  `theme_id` bigint DEFAULT NULL,
  `type` varchar(30) NOT NULL,
  `rental_price_per_day` decimal(10,2) NOT NULL,
  `security_deposit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_product_category_id_16f5e06b_fk_uniformAd` (`category_id`),
  KEY `uniformAdmin_product_subcategory_id_4868f98d_fk_uniformAd` (`subcategory_id`),
  KEY `uniformAdmin_product_theme_id_9aca1311_fk_uniformAd` (`theme_id`),
  CONSTRAINT `uniformAdmin_product_category_id_16f5e06b_fk_uniformAd` FOREIGN KEY (`category_id`) REFERENCES `uniformAdmin_category` (`id`),
  CONSTRAINT `uniformAdmin_product_subcategory_id_4868f98d_fk_uniformAd` FOREIGN KEY (`subcategory_id`) REFERENCES `uniformAdmin_subcategory` (`id`),
  CONSTRAINT `uniformAdmin_product_theme_id_9aca1311_fk_uniformAd` FOREIGN KEY (`theme_id`) REFERENCES `uniformAdmin_tabletheme` (`id`),
  CONSTRAINT `uniformAdmin_product_chk_1` CHECK ((`total_quantity` >= 0)),
  CONSTRAINT `uniformAdmin_product_chk_2` CHECK ((`available_quantity` >= 0)),
  CONSTRAINT `uniformAdmin_product_chk_3` CHECK ((`discount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_product_parts`
--

DROP TABLE IF EXISTS `uniformAdmin_product_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_product_parts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `parts_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniformAdmin_product_parts_product_id_parts_id_d43f2976_uniq` (`product_id`,`parts_id`),
  KEY `uniformAdmin_product_parts_id_fb988e29_fk_uniformAd` (`parts_id`),
  CONSTRAINT `uniformAdmin_product_parts_id_fb988e29_fk_uniformAd` FOREIGN KEY (`parts_id`) REFERENCES `uniformAdmin_parts` (`id`),
  CONSTRAINT `uniformAdmin_product_product_id_a2b88982_fk_uniformAd` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_promocode`
--

DROP TABLE IF EXISTS `uniformAdmin_promocode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_promocode` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `promocodeName` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `promocodeImage` varchar(100) DEFAULT NULL,
  `description` longtext NOT NULL,
  `promocodeType` varchar(20) NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `ended_at` datetime(6) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promocodeName` (`promocodeName`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_quotationtemplate`
--

DROP TABLE IF EXISTS `uniformAdmin_quotationtemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_quotationtemplate` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `content` longtext NOT NULL,
  `userType` varchar(50) NOT NULL,
  `language` varchar(10) NOT NULL,
  `version` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_role`
--

DROP TABLE IF EXISTS `uniformAdmin_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_name` varchar(60) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` longtext,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_specialcondition`
--

DROP TABLE IF EXISTS `uniformAdmin_specialcondition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_specialcondition` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `condition_type` varchar(20) NOT NULL,
  `description` longtext,
  `discount_percentage` decimal(5,2) NOT NULL,
  `priority_support` tinyint(1) NOT NULL,
  `net_30_terms` tinyint(1) NOT NULL,
  `free_samples` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `condition_type` (`condition_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_subcategory`
--

DROP TABLE IF EXISTS `uniformAdmin_subcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_subcategory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subcategoryImage` varchar(100) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` longtext,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `order` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_subcate_category_id_72d57177_fk_uniformAd` (`category_id`),
  KEY `uniformAdmin_subcategory_order_d842443f` (`order`),
  CONSTRAINT `uniformAdmin_subcate_category_id_72d57177_fk_uniformAd` FOREIGN KEY (`category_id`) REFERENCES `uniformAdmin_category` (`id`),
  CONSTRAINT `uniformAdmin_subcategory_chk_1` CHECK ((`order` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_tabletheme`
--

DROP TABLE IF EXISTS `uniformAdmin_tabletheme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_tabletheme` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `image` varchar(100) NOT NULL,
  `order` int unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_tabletheme_order_e44e7633` (`order`),
  CONSTRAINT `uniformAdmin_tabletheme_chk_1` CHECK ((`order` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `uniformAdmin_template`
--

DROP TABLE IF EXISTS `uniformAdmin_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uniformAdmin_template` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `templateName` varchar(250) NOT NULL,
  `templateImage` varchar(100) DEFAULT NULL,
  `partUsageCount` int NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `part_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uniformAdmin_template_part_id_053c09fa_fk_uniformAdmin_parts_id` (`part_id`),
  CONSTRAINT `uniformAdmin_template_part_id_053c09fa_fk_uniformAdmin_parts_id` FOREIGN KEY (`part_id`) REFERENCES `uniformAdmin_parts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_cart`
--

DROP TABLE IF EXISTS `userhub_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_cart` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_active` tinyint(1) NOT NULL,
  `is_delete` datetime(6) NOT NULL,
  `is_update` date NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_cart_user_id_7b4dfe1a_fk_userhub_users_id` (`user_id`),
  CONSTRAINT `userhub_cart_user_id_7b4dfe1a_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_cartitem`
--

DROP TABLE IF EXISTS `userhub_cartitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_cartitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int unsigned NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount` decimal(5,2) NOT NULL,
  `final_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `cart_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_cartitem_cart_id_1e916727_fk_userhub_cart_id` (`cart_id`),
  KEY `userhub_cartitem_product_id_6ccfea68_fk_uniformAdmin_product_id` (`product_id`),
  CONSTRAINT `userhub_cartitem_cart_id_1e916727_fk_userhub_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `userhub_cart` (`id`),
  CONSTRAINT `userhub_cartitem_product_id_6ccfea68_fk_uniformAdmin_product_id` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`),
  CONSTRAINT `userhub_cartitem_chk_1` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_customerdetails`
--

DROP TABLE IF EXISTS `userhub_customerdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_customerdetails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `country` varchar(100) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `userhub_customerdetails_user_id_dd061a0b_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_customupdatemodels`
--

DROP TABLE IF EXISTS `userhub_customupdatemodels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_customupdatemodels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `config_json` json DEFAULT NULL,
  `design_specifications` json DEFAULT NULL,
  `json_file_path` varchar(500) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `model_info_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userhub_customupdatemodels_user_id_model_info_id_e007acd7_uniq` (`user_id`,`model_info_id`),
  KEY `userhub_customupdate_model_info_id_8db433c8_fk_userhub_m` (`model_info_id`),
  CONSTRAINT `userhub_customupdate_model_info_id_8db433c8_fk_userhub_m` FOREIGN KEY (`model_info_id`) REFERENCES `userhub_modelinfo` (`id`),
  CONSTRAINT `userhub_customupdatemodels_user_id_406a7e2e_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_favourite`
--

DROP TABLE IF EXISTS `userhub_favourite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_favourite` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `is_like` tinyint(1) NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userhub_favourite_product_id_user_id_ca3ed602_uniq` (`product_id`,`user_id`),
  KEY `userhub_favourite_user_id_24df80ee_fk_userhub_users_id` (`user_id`),
  CONSTRAINT `userhub_favourite_product_id_ff794a38_fk_uniformAdmin_product_id` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`),
  CONSTRAINT `userhub_favourite_user_id_24df80ee_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_modelinfo`
--

DROP TABLE IF EXISTS `userhub_modelinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_modelinfo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `model_file` varchar(100) DEFAULT NULL,
  `description` longtext,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `product_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  CONSTRAINT `userhub_modelinfo_product_id_797bfc1f_fk_uniformAdmin_product_id` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_order`
--

DROP TABLE IF EXISTS `userhub_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_order` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) DEFAULT NULL,
  `shipping_charge` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(500) DEFAULT NULL,
  `currency` varchar(10) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `order_type` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `rental_start_date` date DEFAULT NULL,
  `rental_end_date` date DEFAULT NULL,
  `rental_days` int unsigned DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `cancel_reason` varchar(50) DEFAULT NULL,
  `admin_cancel_reason` varchar(255) DEFAULT NULL,
  `cancelled_by` varchar(20) DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT NULL,
  `is_returned` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `is_update` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `cart_id` bigint DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `promocode_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `userhub_order_user_id_87f4b66f_fk_userhub_users_id` (`user_id`),
  KEY `userhub_order_cart_id_cbc7aa3b_fk_userhub_cart_id` (`cart_id`),
  KEY `userhub_order_customer_id_559b89a1_fk_userhub_customerdetails_id` (`customer_id`),
  KEY `userhub_order_promocode_id_8a1bcd34_fk_uniformAdmin_promocode_id` (`promocode_id`),
  CONSTRAINT `userhub_order_cart_id_cbc7aa3b_fk_userhub_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `userhub_cart` (`id`),
  CONSTRAINT `userhub_order_customer_id_559b89a1_fk_userhub_customerdetails_id` FOREIGN KEY (`customer_id`) REFERENCES `userhub_customerdetails` (`id`),
  CONSTRAINT `userhub_order_promocode_id_8a1bcd34_fk_uniformAdmin_promocode_id` FOREIGN KEY (`promocode_id`) REFERENCES `uniformAdmin_promocode` (`id`),
  CONSTRAINT `userhub_order_user_id_87f4b66f_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`),
  CONSTRAINT `userhub_order_chk_1` CHECK ((`rental_days` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_orderitem`
--

DROP TABLE IF EXISTS `userhub_orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_orderitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int unsigned NOT NULL,
  `rental_days` int unsigned NOT NULL,
  `price_per_day` decimal(10,2) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_orderitem_order_id_46eea4b9_fk_userhub_order_id` (`order_id`),
  KEY `userhub_orderitem_product_id_47c44e46_fk_uniformAdmin_product_id` (`product_id`),
  CONSTRAINT `userhub_orderitem_order_id_46eea4b9_fk_userhub_order_id` FOREIGN KEY (`order_id`) REFERENCES `userhub_order` (`id`),
  CONSTRAINT `userhub_orderitem_product_id_47c44e46_fk_uniformAdmin_product_id` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`),
  CONSTRAINT `userhub_orderitem_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `userhub_orderitem_chk_2` CHECK ((`rental_days` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_payment`
--

DROP TABLE IF EXISTS `userhub_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payment_id` varchar(255) NOT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `payment_method_id` varchar(100) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `client_secret` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `is_delete` datetime(6) DEFAULT NULL,
  `is_update` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_id` (`payment_id`),
  KEY `userhub_payment_order_id_f4336956_fk_userhub_order_id` (`order_id`),
  CONSTRAINT `userhub_payment_order_id_f4336956_fk_userhub_order_id` FOREIGN KEY (`order_id`) REFERENCES `userhub_order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_quotationrequest`
--

DROP TABLE IF EXISTS `userhub_quotationrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_quotationrequest` (
  `uuids` char(32) NOT NULL,
  `quotation_id` varchar(20) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `item_type` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `size_quantity` longtext,
  `delivery_date` date NOT NULL,
  `additional_note` longtext,
  `agreed_to_terms` tinyint(1) NOT NULL,
  `agreed_terms_version` varchar(20) DEFAULT NULL,
  `agreed_at` datetime(6) DEFAULT NULL,
  `agreed_ip` char(39) DEFAULT NULL,
  `agreed_user_agent` longtext,
  `workflow_status` varchar(20) NOT NULL,
  `quotation_status` varchar(20) NOT NULL,
  `external_document_id` varchar(255) DEFAULT NULL,
  `signed_pdf` varchar(100) DEFAULT NULL,
  `signed_at` datetime(6) DEFAULT NULL,
  `is_signed` tinyint(1) NOT NULL,
  `cancelled_by` varchar(10) DEFAULT NULL,
  `cancel_reason` longtext,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `customupdatemodel_id` bigint DEFAULT NULL,
  PRIMARY KEY (`uuids`),
  UNIQUE KEY `quotation_id` (`quotation_id`),
  KEY `userhub_quotationreq_customupdatemodel_id_3703ba7f_fk_userhub_c` (`customupdatemodel_id`),
  CONSTRAINT `userhub_quotationreq_customupdatemodel_id_3703ba7f_fk_userhub_c` FOREIGN KEY (`customupdatemodel_id`) REFERENCES `userhub_customupdatemodels` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_refund`
--

DROP TABLE IF EXISTS `userhub_refund`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_refund` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `refund_amount` decimal(10,2) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `admin_note` longtext,
  `payment_gateway_id` varchar(100) DEFAULT NULL,
  `refund_method` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `currency` varchar(10) NOT NULL,
  `order_id` bigint NOT NULL,
  `payment_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_refund_order_id_4c38f5ab_fk_userhub_order_id` (`order_id`),
  KEY `userhub_refund_payment_id_ea5d5311_fk_userhub_payment_id` (`payment_id`),
  KEY `userhub_refund_user_id_c4fcaae8_fk_userhub_users_id` (`user_id`),
  CONSTRAINT `userhub_refund_order_id_4c38f5ab_fk_userhub_order_id` FOREIGN KEY (`order_id`) REFERENCES `userhub_order` (`id`),
  CONSTRAINT `userhub_refund_payment_id_ea5d5311_fk_userhub_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `userhub_payment` (`id`),
  CONSTRAINT `userhub_refund_user_id_c4fcaae8_fk_userhub_users_id` FOREIGN KEY (`user_id`) REFERENCES `userhub_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_rental`
--

DROP TABLE IF EXISTS `userhub_rental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_rental` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rental_id` varchar(50) DEFAULT NULL,
  `rental_date` date NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `actual_return_date` date DEFAULT NULL,
  `shipping_address` longtext NOT NULL,
  `delivery_time` time(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `shipping_fee` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `discount_amount` decimal(12,2) NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `late_fee` decimal(12,2) NOT NULL,
  `damage_fee` decimal(12,2) NOT NULL,
  `lost_fee` decimal(12,2) NOT NULL,
  `grace_period_days` int NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `customer_id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rental_id` (`rental_id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `userhub_rental_customer_id_1e78c11e_fk_userhub_c` (`customer_id`),
  CONSTRAINT `userhub_rental_customer_id_1e78c11e_fk_userhub_c` FOREIGN KEY (`customer_id`) REFERENCES `userhub_customerdetails` (`id`),
  CONSTRAINT `userhub_rental_order_id_40ab84b1_fk_userhub_order_id` FOREIGN KEY (`order_id`) REFERENCES `userhub_order` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_rentalitem`
--

DROP TABLE IF EXISTS `userhub_rentalitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_rentalitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` int unsigned NOT NULL,
  `price_per_day` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `returned_quantity` int unsigned NOT NULL,
  `lost_quantity` int unsigned NOT NULL,
  `is_returned` tinyint(1) NOT NULL,
  `is_damaged` tinyint(1) NOT NULL,
  `is_lost` tinyint(1) NOT NULL,
  `rfid_tag` varchar(100) DEFAULT NULL,
  `notes` longtext,
  `isActive` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `product_id` bigint NOT NULL,
  `rental_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_rentalitem_product_id_dcf0f7fa_fk_uniformAd` (`product_id`),
  KEY `userhub_rentalitem_rental_id_59bb0dee_fk_userhub_rental_id` (`rental_id`),
  CONSTRAINT `userhub_rentalitem_product_id_dcf0f7fa_fk_uniformAd` FOREIGN KEY (`product_id`) REFERENCES `uniformAdmin_product` (`id`),
  CONSTRAINT `userhub_rentalitem_rental_id_59bb0dee_fk_userhub_rental_id` FOREIGN KEY (`rental_id`) REFERENCES `userhub_rental` (`id`),
  CONSTRAINT `userhub_rentalitem_chk_1` CHECK ((`quantity` >= 0)),
  CONSTRAINT `userhub_rentalitem_chk_2` CHECK ((`returned_quantity` >= 0)),
  CONSTRAINT `userhub_rentalitem_chk_3` CHECK ((`lost_quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userhub_users`
--

DROP TABLE IF EXISTS `userhub_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userhub_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(254) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `userType` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `language` varchar(10) NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `profileImage` varchar(100) DEFAULT NULL,
  `lastLogin` datetime(6) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL,
  `appleID` varchar(255) DEFAULT NULL,
  `stripeOrderCustomerId` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL,
  `loginType` varchar(20) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT NULL,
  `push_notifications` tinyint(1) DEFAULT NULL,
  `is_verify` tinyint(1) NOT NULL,
  `is_currently_login` tinyint(1) NOT NULL,
  `createdAt` datetime(6) NOT NULL,
  `updatedAt` datetime(6) NOT NULL,
  `role_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userhub_users_role_id_25b2dacd_fk_uniformAdmin_role_id` (`role_id`),
  CONSTRAINT `userhub_users_role_id_25b2dacd_fk_uniformAdmin_role_id` FOREIGN KEY (`role_id`) REFERENCES `uniformAdmin_role` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-07 21:22:41
