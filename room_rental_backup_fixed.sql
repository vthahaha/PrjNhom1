-- MySQL dump 10.13  Distrib 8.4.9, for Linux (x86_64)
--
-- Host: localhost    Database: room_rental
-- ------------------------------------------------------
-- Server version	8.4.9

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
-- Table structure for table `contract`
--

DROP TABLE IF EXISTS `contract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `gia_thue` decimal(12,0) NOT NULL,
  `ly_do_cham_dut` text,
  `ngay_bat_dau` date NOT NULL,
  `ngay_ket_thuc` date NOT NULL,
  `ngay_tra_phong` date DEFAULT NULL,
  `tien_coc` decimal(12,0) NOT NULL,
  `trang_thai` enum('CHAM_DUT','HET_HAN','HIEU_LUC') NOT NULL,
  `khach_thue_id` bigint NOT NULL,
  `phong_id` bigint NOT NULL,
  `so_nguoi_o` int NOT NULL,
  `file_hop_dong_url` varchar(255) DEFAULT NULL,
  `ky_dong_tien` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKh9c0nct33tfjgvhtro1jykpdh` (`khach_thue_id`),
  KEY `FKk1dmvw6g3itwbbxp4pcjm3ms9` (`phong_id`),
  CONSTRAINT `FKh9c0nct33tfjgvhtro1jykpdh` FOREIGN KEY (`khach_thue_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKk1dmvw6g3itwbbxp4pcjm3ms9` FOREIGN KEY (`phong_id`) REFERENCES `room` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract`
--

LOCK TABLES `contract` WRITE;
/*!40000 ALTER TABLE `contract` DISABLE KEYS */;
INSERT INTO `contract` VALUES (1,'2026-06-04 18:55:25.989011',3000000,'Admin kﬂ¶+t th+¶c','2026-03-04','2026-07-25','2026-06-04',1000000,'CHAM_DUT',2,1,0,NULL,0),(2,'2026-06-04 19:25:42.350312',2500000,'Admin kﬂ¶+t th+¶c','2026-06-02','2026-10-29','2026-06-07',1000000,'CHAM_DUT',3,3,0,NULL,0),(3,'2026-06-06 17:44:46.410865',2000000,'Admin kﬂ¶+t th+¶c','2026-06-06','2026-10-30','2026-06-07',1000000,'CHAM_DUT',7,2,1,NULL,0),(4,'2026-06-07 17:56:39.553179',2200000,NULL,'2026-02-12','2026-06-30',NULL,1000000,'HIEU_LUC',7,4,3,NULL,0),(5,'2026-06-11 17:02:21.232316',2000000,NULL,'2026-06-11','2027-02-25',NULL,0,'HIEU_LUC',8,2,1,NULL,0),(6,'2026-06-12 16:21:25.396030',4000000,'Admin kﬂ¶+t th+¶c','2026-06-12','2026-12-31','2026-06-12',0,'CHAM_DUT',3,8,1,NULL,0),(7,'2026-06-12 16:43:27.533572',2000000,NULL,'2026-06-12','2027-02-25',NULL,0,'HIEU_LUC',5,9,2,NULL,0);
/*!40000 ALTER TABLE `contract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contract_extension_request`
--

DROP TABLE IF EXISTS `contract_extension_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_extension_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `ghi_chu` text,
  `so_thang_gia_han` int NOT NULL,
  `trang_thai` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `contract_id` bigint NOT NULL,
  `tenant_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr9fkxaol3kivj8yl7ignhjgyf` (`contract_id`),
  KEY `FKllj2bk3do77vudxeh1iidxrsu` (`tenant_id`),
  CONSTRAINT `FKllj2bk3do77vudxeh1iidxrsu` FOREIGN KEY (`tenant_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKr9fkxaol3kivj8yl7ignhjgyf` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_extension_request`
--

LOCK TABLES `contract_extension_request` WRITE;
/*!40000 ALTER TABLE `contract_extension_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_extension_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contract_service`
--

DROP TABLE IF EXISTS `contract_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contract_service` (
  `hop_dong_id` bigint NOT NULL,
  `dich_vu_id` bigint NOT NULL,
  KEY `FKj721ik8in42tu291txwd44too` (`dich_vu_id`),
  KEY `FK2nlovpp2c9wwgkvdy72hqorya` (`hop_dong_id`),
  CONSTRAINT `FK2nlovpp2c9wwgkvdy72hqorya` FOREIGN KEY (`hop_dong_id`) REFERENCES `contract` (`id`),
  CONSTRAINT `FKj721ik8in42tu291txwd44too` FOREIGN KEY (`dich_vu_id`) REFERENCES `service` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contract_service`
--

LOCK TABLES `contract_service` WRITE;
/*!40000 ALTER TABLE `contract_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `contract_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chi_so_dien_cuoi` decimal(10,2) DEFAULT NULL,
  `chi_so_dien_dau` decimal(10,2) DEFAULT NULL,
  `chi_so_nuoc_cuoi` decimal(10,2) DEFAULT NULL,
  `chi_so_nuoc_dau` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `ghi_chu_phi_khac` text,
  `nam` int NOT NULL,
  `ngay_thanh_toan` datetime(6) DEFAULT NULL,
  `phi_khac` decimal(12,0) DEFAULT NULL,
  `thang` int NOT NULL,
  `tong_tien` decimal(12,0) NOT NULL,
  `trang_thai` enum('CHUA_TT','DA_TT') NOT NULL,
  `hop_dong_id` bigint NOT NULL,
  `utility_price_id` bigint DEFAULT NULL,
  `da_gui` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKs2ep5pp6927u2qercpeme5ewl` (`hop_dong_id`,`thang`,`nam`),
  KEY `FKkjy63n5r8072x5gst4xur3oes` (`utility_price_id`),
  CONSTRAINT `FKevku82m6w6xbfggkfkbndo0je` FOREIGN KEY (`hop_dong_id`) REFERENCES `contract` (`id`),
  CONSTRAINT `FKkjy63n5r8072x5gst4xur3oes` FOREIGN KEY (`utility_price_id`) REFERENCES `utility_price` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,100.00,0.00,10.00,0.00,'2026-06-06 11:12:55.000000',NULL,2026,'2026-01-15 10:00:00.000000',NULL,1,4500000,'DA_TT',1,NULL,_binary '\0'),(2,220.00,100.00,25.00,10.00,'2026-06-06 11:12:55.000000',NULL,2026,'2026-02-15 10:00:00.000000',NULL,2,4800000,'DA_TT',1,NULL,_binary '\0'),(3,310.00,220.00,38.00,25.00,'2026-06-06 11:12:55.000000',NULL,2026,'2026-03-15 10:00:00.000000',NULL,3,4200000,'DA_TT',1,NULL,_binary '\0'),(4,450.00,310.00,50.00,38.00,'2026-06-06 11:12:55.000000',NULL,2026,'2026-04-15 10:00:00.000000',NULL,4,5100000,'DA_TT',1,NULL,_binary '\0'),(5,600.00,450.00,70.00,50.00,'2026-06-06 11:12:55.000000',NULL,2026,'2026-05-15 10:00:00.000000',NULL,5,5500000,'DA_TT',1,NULL,_binary '\0'),(6,290.00,100.00,350.00,100.00,'2026-06-07 18:09:10.924375',NULL,2026,'2026-06-07 18:21:26.586545',0,6,2200000,'DA_TT',4,NULL,_binary ''),(7,290.00,100.00,390.00,100.00,'2026-06-07 18:22:07.355137','Ph+° wifi',2026,'2026-06-07 18:46:24.260181',200000,7,4325000,'DA_TT',4,1,_binary '\0'),(8,0.00,0.00,0.00,0.00,'2026-06-11 17:09:08.605684',NULL,2026,'2026-06-12 16:57:06.647239',0,6,2330000,'DA_TT',5,1,_binary ''),(12,200.00,0.00,200.00,0.00,'2026-06-12 16:44:51.746854',NULL,2026,NULL,200000,6,3700000,'CHUA_TT',7,1,_binary ''),(18,230.00,150.00,26.00,20.00,'2026-06-14 17:29:05.049455',NULL,2026,'2026-03-01 03:00:00.000000',0,2,2430000,'DA_TT',4,1,_binary ''),(19,320.00,230.00,33.00,26.00,'2026-06-14 17:29:05.075081',NULL,2026,'2026-03-29 03:00:00.000000',0,3,2460000,'DA_TT',4,1,_binary ''),(20,430.00,320.00,39.00,33.00,'2026-06-14 17:29:05.085057',NULL,2026,'2026-04-29 03:00:00.000000',0,4,2505000,'DA_TT',4,1,_binary ''),(21,550.00,430.00,47.00,39.00,'2026-06-14 17:29:05.091981',NULL,2026,'2026-05-29 03:00:00.000000',0,5,2540000,'DA_TT',4,1,_binary '');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `da_doc` bit(1) NOT NULL,
  `for_admin` bit(1) NOT NULL,
  `noi_dung` text NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnk4ftb5am9ubmkv1661h15ds9` (`user_id`),
  CONSTRAINT `FKnk4ftb5am9ubmkv1661h15ds9` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repair_request`
--

DROP TABLE IF EXISTS `repair_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repair_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anh_url` text,
  `mo_ta` text NOT NULL,
  `ngay_cap_nhat` datetime(6) DEFAULT NULL,
  `ngay_gui` datetime(6) NOT NULL,
  `trang_thai` enum('CHO_XU_LY','DANG_XU_LY','HOAN_THANH') NOT NULL,
  `hop_dong_id` bigint NOT NULL,
  `chi_phi` decimal(12,0) DEFAULT NULL,
  `csvc_hieu_hong` text,
  PRIMARY KEY (`id`),
  KEY `FKin41jn1p035rvstnnqthqdtk` (`hop_dong_id`),
  CONSTRAINT `FKin41jn1p035rvstnnqthqdtk` FOREIGN KEY (`hop_dong_id`) REFERENCES `contract` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repair_request`
--

LOCK TABLES `repair_request` WRITE;
/*!40000 ALTER TABLE `repair_request` DISABLE KEYS */;
INSERT INTO `repair_request` VALUES (1,NULL,'Tﬂ+∫ lﬂ¶Ình hﬂ+≈ng','2026-06-06 18:07:13.033273','2026-06-06 17:45:07.983700','HOAN_THANH',3,450000,NULL),(2,NULL,'M+Ìy giﬂ¶+t hﬂ+≈ng','2026-06-12 23:18:19.675189','2026-06-06 21:00:12.547079','HOAN_THANH',3,0,NULL),(3,NULL,'','2026-06-07 18:03:07.711753','2026-06-07 18:02:12.293121','HOAN_THANH',4,600000,'Tﬂ+∫ quﬂ¶∫n +Ìo'),(4,NULL,'Tﬂ+∫ quﬂ¶∫n +Ìo lﬂ+≈ng v+°t','2026-06-08 17:27:44.256375','2026-06-07 20:41:16.711175','HOAN_THANH',4,200000,'Tﬂ+∫ quﬂ¶∫n +Ìo');
/*!40000 ALTER TABLE `repair_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `dien_tich` decimal(6,2) DEFAULT NULL,
  `gia_thue` decimal(12,0) NOT NULL,
  `so_nguoi_toi_da` int DEFAULT NULL,
  `ten_phong` varchar(50) NOT NULL,
  `tien_nghi` text,
  `trang_thai` enum('DANG_SUA','DA_THUE','TRONG') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKaskwrvddttl0w3dqfju7qyok9` (`ten_phong`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,'2026-06-04 18:48:29.205640',25.00,3000000,2,'Phong 101','M+Ìy giﬂ¶+t, Bﬂ¶+p','TRONG'),(2,'2026-06-04 18:48:44.896762',55.00,2000000,2,'Ph+¶ng 663201','-…iﬂ+¸u h+¶a, tivi, tﬂ+∫ lﬂ¶Ình','DA_THUE'),(3,'2026-06-04 19:20:34.450204',40.00,2500000,5,'Ph+¶ng 102','-…iﬂ+¸u h+¶a, tﬂ+∫ lﬂ¶Ình','TRONG'),(4,'2026-06-07 17:55:32.075800',50.00,2200000,5,'Ph+¶ng 663202','Gi¶¶ﬂ+•ng, Tﬂ+∫ quﬂ¶∫n +Ìo, Internet, Tﬂ+∫ lﬂ¶Ình','DA_THUE'),(5,'2026-06-07 20:01:31.313914',60.00,3000000,5,'Ph+¶ng 5','Tﬂ+∫ lﬂ¶Ình, Gi¶¶ﬂ+•ng, Bﬂ¶+p','TRONG'),(8,'2026-06-12 16:19:37.222097',47.00,4000000,5,'Phong 103','Tﬂ+∫ lﬂ¶Ình, M+Ìy giﬂ¶+t, Gi¶¶ﬂ+•ng, Internet','TRONG'),(9,'2026-06-12 16:41:37.242409',30.00,2000000,2,'Ph+¶ng 105','Tﬂ+∫ quﬂ¶∫n +Ìo, N+¶ng lﬂ¶Ình, Tﬂ+∫ lﬂ¶Ình, M+Ìy giﬂ¶+t','DA_THUE');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_service`
--

DROP TABLE IF EXISTS `room_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `don_gia_override` decimal(12,0) DEFAULT NULL,
  `phong_id` bigint NOT NULL,
  `dich_vu_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjp1uv1qo9f6adeoe5f5u2k2tv` (`phong_id`,`dich_vu_id`),
  KEY `FK5xvexm9vh1h8qjlwh4ae5vrh0` (`dich_vu_id`),
  CONSTRAINT `FK5xvexm9vh1h8qjlwh4ae5vrh0` FOREIGN KEY (`dich_vu_id`) REFERENCES `service` (`id`),
  CONSTRAINT `FKqjyl4cfm9fk32mpbss5a1rvke` FOREIGN KEY (`phong_id`) REFERENCES `room` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_service`
--

LOCK TABLES `room_service` WRITE;
/*!40000 ALTER TABLE `room_service` DISABLE KEYS */;
INSERT INTO `room_service` VALUES (6,NULL,2,2),(7,NULL,2,3),(8,NULL,2,4),(9,NULL,2,5),(10,NULL,2,6),(11,NULL,3,2),(12,NULL,3,3),(13,NULL,3,4),(14,NULL,3,5),(15,NULL,3,6),(16,NULL,4,2),(17,NULL,4,3),(18,NULL,4,4),(19,NULL,4,5),(20,NULL,4,6),(21,NULL,5,2),(22,NULL,5,3),(23,NULL,5,4),(24,NULL,5,5),(25,NULL,5,6),(27,35000,1,4),(28,NULL,1,5),(29,NULL,1,6),(30,NULL,1,2),(31,NULL,1,3),(32,NULL,8,2),(33,NULL,8,3),(34,NULL,8,4),(35,NULL,8,5),(36,NULL,8,6),(45,NULL,9,2),(46,NULL,9,3),(47,NULL,9,4),(48,NULL,9,5),(49,NULL,9,6),(50,NULL,1,7),(51,NULL,2,7),(52,NULL,3,7),(53,NULL,4,7),(54,NULL,5,7),(55,NULL,8,7),(56,NULL,9,7);
/*!40000 ALTER TABLE `room_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `don_gia_mac_dinh` decimal(12,0) NOT NULL,
  `don_vi` varchar(50) DEFAULT NULL,
  `ten_dich_vu` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm8p771wu5spo9iw6escfsp519` (`ten_dich_vu`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (2,'2026-06-11 16:20:51.218859',100000,'-Ê/ph+¶ng','Internet'),(3,'2026-06-11 16:20:51.263531',100000,'-Ê/xe','Gﬂ+°i xe m+Ìy'),(4,'2026-06-11 16:20:51.270833',30000,'-Ê/xe','Gﬂ+°i xe -Êﬂ¶Ìp'),(5,'2026-06-11 16:20:51.274540',50000,'-Ê/ph+¶ng','Dﬂ+Ôch vﬂ+— vﬂ+Á sinh'),(6,'2026-06-11 16:20:51.278124',50000,'-Ê/ng¶¶ﬂ+•i','Thang m+Ìy'),(7,'2026-06-12 23:15:45.561079',20000,'-Ê/th+Ìng','a');
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `doi_mk_lan_dau` bit(1) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `ho_ten` varchar(100) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `so_dien_thoai` varchar(15) NOT NULL,
  `vai_tro` enum('ADMIN','TENANT') NOT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `que_quan` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKc0kcog1b0ufqw54cilw8d9w69` (`so_dien_thoai`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-06-04 11:21:01.000000',_binary '\0','admin@roomrental.com','Admin','$2a$10$bcvos1tilkF8hS2oQeNrd.QhTVC62kuHW.IvgO.wmRwGw.ZHz3BXC','0900000000','ADMIN',NULL,NULL,NULL),(2,'2026-06-04 18:49:21.738251',_binary '','tgl@gmail.com','Trﬂ¶∫n Gia Lﬂ+÷c','$2a$10$3YKlXIOTDoD7QOB3l9TEHuGn.siLZmyRGYxPdKnFvD3TI18/IsZ62','0987654322','TENANT','001204026594',NULL,NULL),(3,'2026-06-04 18:54:40.065034',_binary '\0','test@example.com','Test User','$2a$10$S/i.spUblj0h.BsZ9i.VoOnSyi44oYAFlbWEpVX1S57EOwBvgwSUW','0912345678','TENANT',NULL,NULL,NULL),(4,'2026-06-04 19:05:11.372205',_binary '\0','vtuanhai5@gmail.com','Nguyﬂ+‡n Nguy+¨n -…ﬂ+¨c','$2a$10$Oe/BcW3zANsRqCfrKXyNK.Olg0v7joLGURwhwWUs2UW85ZlY5Yalm','0344421488','TENANT',NULL,NULL,NULL),(5,'2026-06-04 19:07:35.579799',_binary '\0','test2@example.com','Test 2','$2a$10$/FzX/mLQmC8ctbVaJoY8OO4zhZue/8HJTkwsWsaywIz/l4QU2Brd.','0922222222','TENANT',NULL,NULL,NULL),(6,'2026-06-06 17:22:20.930534',_binary '\0','lda@gmail.com','V+¨ Tuﬂ¶—n Hﬂ¶˙i','$2a$10$F/GFUG0orhSl9mHIsbbuvOxoZ1bZ8830RRQzxuHe79/j618KQwRJ6','0923162312','TENANT',NULL,NULL,NULL),(7,'2026-06-06 17:35:18.723309',_binary '\0','vth@gmail.com','L+¨ -…ﬂ+¨c','$2a$10$wcO7Jer3WwXt45QU74UqkuAOzsOsrEorHSucNZYUgBmOACvSJZz5O','0902345678','TENANT','001204026593','-…+· Nﬂ¶¶ng',NULL),(8,'2026-06-11 16:50:09.385634',_binary '\0','','L+¨ Anh','$2a$10$xnFNfZK.j/0eb.vAPeUw1ejnKs.i6ZhcwDVSkn5TFJBMkYetbUTy2','0924121267','TENANT','001204026577','Nam -…ﬂ+Ônh',NULL),(9,'2026-06-14 17:13:14.801607',_binary '\0','haivt@myroom.com','V+¨ Tuﬂ¶—n Hﬂ¶˙i','$2a$10$EFi1dVGa26EjY9QxC25FU.qGTPh0urwyJUAKcY7Zc45aZz3mTiD1u','0123456789','ADMIN',NULL,NULL,NULL),(10,'2026-06-14 17:13:14.899415',_binary '\0','tenant.a@gmail.com','Nguyﬂ+‡n V-‚n A','$2a$10$5X1iENvR8j3zZbdhR4cjpeo7Xw5aVQG29dEy4wuWKVabzNE/I2oUC','0987654321','TENANT','123456789123','H+· Nﬂ+÷i',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utility_price`
--

DROP TABLE IF EXISTS `utility_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utility_price` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ap_dung_tu` date NOT NULL,
  `don_gia_dien` decimal(10,0) NOT NULL,
  `don_gia_nuoc` decimal(10,0) NOT NULL,
  `ghi_chu` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utility_price`
--

LOCK TABLES `utility_price` WRITE;
/*!40000 ALTER TABLE `utility_price` DISABLE KEYS */;
INSERT INTO `utility_price` VALUES (1,'2026-06-07',2500,5000,NULL);
/*!40000 ALTER TABLE `utility_price` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-18  6:10:44
