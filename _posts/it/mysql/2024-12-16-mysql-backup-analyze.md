---
title: "mysql备份过程分析"
-- subtitle: ""
layout: post
author: "wdg"
header-style: text
tags:
  - mysql
  - database
  - backup
---

对test_db库进行备份，存在a、b两张表。  
mysql 5.7.44  
xtrabackup 2.4.4  
mydumper 0.9.5  

### mysqldump  
``` shell
mysqldump                         \
--no-tablespaces                  \
--no-data=FALSE                   \
--default-character-set=utf8mb4   \
--set-gtid-purged=off             \
--single-transaction              \
--triggers=TRUE                   \
--events=TRUE                     \
--routines=TRUE                   \
--add-drop-table=FALSE            \
test_db
```

``` sql
          FLUSH TABLE
          FLUSH TABLES WITH READ LOCK                                 -- 开通用日志没有看到执行这两个，但实际执行时processlist中看到有执行这个？因为备份存储过程，而5.7中mysql.proc、mysql.event为非系统表？
Connect   root@127.0.0.1 on  using TCP/IP
Query     /*!40100 SET @@SQL_MODE='' */
Query     /*!40103 SET TIME_ZONE='+00:00' */
Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
Query     START TRANSACTION /*!40100 WITH CONSISTENT SNAPSHOT */
Query     UNLOCK TABLES
Query     SHOW VARIABLES LIKE 'ndbinfo\_version'
Init DB   test_db
Query     SAVEPOINT sp
Query     show tables
Query     show table status like 'a'
Query     SET SQL_QUOTE_SHOW_CREATE=1
Query     SET SESSION character_set_results = 'binary'
Query     show create table `a`
Query     SET SESSION character_set_results = 'utf8mb4'
Query     show fields from `a`
Query     show fields from `a`
Query     SELECT /*!40001 SQL_NO_CACHE */ * FROM `a`
Query     SET SESSION character_set_results = 'binary'
Query     use `test_db`
Query     select @@collation_database
Query     SHOW TRIGGERS LIKE 'a'
Query     SET SESSION character_set_results = 'utf8mb4'
Query     ROLLBACK TO SAVEPOINT sp
Query     show table status like 'b'
Query     SET SQL_QUOTE_SHOW_CREATE=1
Query     SET SESSION character_set_results = 'binary'
Query     show create table `b`
Query     SET SESSION character_set_results = 'utf8mb4'
Query     show fields from `b`
Query     show fields from `b`
Query     SELECT /*!40001 SQL_NO_CACHE */ * FROM `b`
Query     SET SESSION character_set_results = 'binary'
Query     use `test_db`
Query     select @@collation_database
Query     SHOW TRIGGERS LIKE 'b'
Query     SET SESSION character_set_results = 'utf8mb4'
Query     ROLLBACK TO SAVEPOINT sp
Query     RELEASE SAVEPOINT sp
Query     show events
Query     use `test_db`
Query     select @@collation_database
Query     SET SESSION character_set_results = 'binary'
Query     SHOW FUNCTION STATUS WHERE Db = 'test_db'
Query     SHOW PROCEDURE STATUS WHERE Db = 'test_db'
Query     SET SESSION character_set_results = 'utf8mb4'
```

> 不启用`single-transaction`时，在备份每个表时加锁（LOCK TABLES ... READ）。即`lock-tables`的动作。  
> `lock-all-tables`对所有表加全局读锁（FLUSH TABLES WITH READ LOCK）直至所有表备份结束。  
> `skip-lock-tables`只用于只读或可接受不一致的场景。即关闭`lock-tables`。  

### xtrabackup    
``` shell
innobackupex --databases="test_db" /data/bak/test_db
```

``` sql
Connect   root@localhost on  using Socket
Query     SET SESSION wait_timeout=2147483
Query     SHOW VARIABLES
Query     SHOW ENGINE INNODB STATUS
Query     SET SESSION lock_wait_timeout=31536000
Query     FLUSH NO_WRITE_TO_BINLOG TABLES                   -- 需在innodb备份完表之后执行这条以及之后的语句
Query     FLUSH TABLES WITH READ LOCK
Query     SHOW MASTER STATUS
Query     SHOW VARIABLES
Query     FLUSH NO_WRITE_TO_BINLOG ENGINE LOGS
Query     UNLOCK TABLES
Query     SELECT UUID()
Query     SELECT VERSION()
```

### mydumper   
``` shell
mydumper --threads=2  -B test_db --less-locking  -C -o test_db_20241213_18
```

``` sql
29 Connect   root@127.0.0.1 on test_db using SSL/TLS
29 Query     SET SESSION wait_timeout = 2147483
29 Query     SET SESSION net_write_timeout = 2147483
29 Query     SHOW PROCESSLIST
29 Query     FLUSH TABLES WITH READ LOCK
29 Query     START TRANSACTION /*!40108 WITH CONSISTENT SNAPSHOT */
29 Query     /*!40101 SET NAMES binary*/
29 Query     SHOW MASTER STATUS
29 Query     SHOW SLAVE STATUS
30 Connect   root@127.0.0.1 on  using SSL/TLS
30 Query     SET SESSION wait_timeout = 2147483
30 Query     /*!40103 SET TIME_ZONE='+00:00' */
30 Query     /*!40101 SET NAMES binary*/
31 Connect   root@127.0.0.1 on  using SSL/TLS
31 Query     SET SESSION wait_timeout = 2147483
31 Query     /*!40103 SET TIME_ZONE='+00:00' */
31 Query     /*!40101 SET NAMES binary*/
32 Connect   root@127.0.0.1 on  using SSL/TLS
32 Query     SET SESSION wait_timeout = 2147483
32 Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
32 Query     START TRANSACTION /*!40108 WITH CONSISTENT SNAPSHOT */
32 Query     /*!40103 SET TIME_ZONE='+00:00' */
32 Query     /*!40101 SET NAMES binary*/
33 Connect   root@127.0.0.1 on  using SSL/TLS
33 Query     SET SESSION wait_timeout = 2147483
33 Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
33 Query     START TRANSACTION /*!40108 WITH CONSISTENT SNAPSHOT */
33 Query     /*!40103 SET TIME_ZONE='+00:00' */
33 Query     /*!40101 SET NAMES binary*/
29 Init DB   test_db
29 Query     SHOW TABLE STATUS
29 Query     SHOW CREATE DATABASE `test_db`
29 Query     UNLOCK TABLES /* FTWRL */
31 Quit
30 Quit
29 Quit
33 Query     select COLUMN_NAME from information_schema.COLUMNS where TABLE_SCHEMA='test_db' and TABLE_NAME='a' and extra like '%GENERATED%'
32 Query     select COLUMN_NAME from information_schema.COLUMNS where TABLE_SCHEMA='test_db' and TABLE_NAME='b' and extra like '%GENERATED%'
33 Query     SELECT /*!40001 SQL_NO_CACHE */ * FROM `test_db`.`a`
32 Query     SELECT /*!40001 SQL_NO_CACHE */ * FROM `test_db`.`b`
33 Query     SHOW CREATE TABLE `test_db`.`a`
32 Query     SHOW CREATE TABLE `test_db`.`b`
33 Quit
32 Quit
```


### mysqlpump  
``` shell
mysqlpump                         \
-default-character-set=utf8mb4    \
--set-gtid-purged=off             \
--single-transaction              \
--triggers=TRUE                   \
--events=TRUE                     \
--routines=TRUE                   \
--add-drop-table=FALSE            \
test_db
# 默认并发为2
```
``` sql
36 Connect   root@127.0.0.1 on  using SSL/TLS
36 Query     FLUSH TABLES WITH READ LOCK
36 Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
36 Query     START TRANSACTION WITH CONSISTENT SNAPSHOT

37 Connect   root@127.0.0.1 on  using SSL/TLS
37 Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
37 Query     START TRANSACTION WITH CONSISTENT SNAPSHOT

38 Connect   root@127.0.0.1 on  using SSL/TLS
38 Query     SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ
38 Query     START TRANSACTION WITH CONSISTENT SNAPSHOT

36 Query     UNLOCK TABLES

38 Query     SET SQL_QUOTE_SHOW_CREATE= 1
38 Query     SET TIME_ZONE='+00:00'
38 Query     SELECT @@global.gtid_mode
38 Query     SELECT @@GLOBAL.GTID_EXECUTED
38 Query     SHOW DATABASES
38 Query     SHOW CREATE DATABASE IF NOT EXISTS `test_db_0`
38 Query     SHOW CREATE DATABASE IF NOT EXISTS `test_db_1`
38 Query     SHOW CREATE DATABASE IF NOT EXISTS `test_db`
38 Query     SHOW TABLE STATUS FROM `test_db`
38 Query     SHOW COLUMNS IN `a` FROM `test_db`
38 Query     SHOW CREATE TABLE `test_db`.`a`
38 Query     SHOW TRIGGERS FROM `test_db` LIKE 'a'
38 Query     SHOW COLUMNS IN `b` FROM `test_db`
38 Query     SHOW CREATE TABLE `test_db`.`b`
38 Query     SHOW TRIGGERS FROM `test_db` LIKE 'b'
38 Query     SHOW FUNCTION STATUS WHERE db = 'test_db'

36 Query     SET SQL_QUOTE_SHOW_CREATE= 1
36 Query     SET TIME_ZONE='+00:00'
36 Query     SELECT `COLUMN_NAME`, `EXTRA` FROM `INFORMATION_SCHEMA`.`COLUMNS`WHERE TABLE_SCHEMA ='test_db' AND TABLE_NAME ='a'
36 Query     SELECT `a`  FROM `test_db`.`a`

37 Query     SET SQL_QUOTE_SHOW_CREATE= 1
37 Query     SET TIME_ZONE='+00:00'
37 Query     SELECT `COLUMN_NAME`, `EXTRA` FROM `INFORMATION_SCHEMA`.`COLUMNS`WHERE TABLE_SCHEMA ='test_db' AND TABLE_NAME ='b'
37 Query     SELECT `a`  FROM `test_db`.`b`

38 Query     SHOW PROCEDURE STATUS WHERE db = 'test_db'
38 Query     SHOW EVENTS FROM `test_db`
38 Query     SHOW CREATE DATABASE IF NOT EXISTS `test_db_2`
38 Query     SHOW CREATE DATABASE IF NOT EXISTS `test_db_3`                        -- 为何要查询其他库?
38 Query     SELECT CONCAT(QUOTE(user),'@',QUOTE(host)) FROM mysql.user
38 Query     SHOW CREATE USER 'admin'@'10.%'
38 Query     SHOW GRANTS FOR 'admin'@'10.%'
38 Query     SHOW TABLES FROM `test_db`
38 Query     SELECT COUNT(*) FROM `INFORMATION_SCHEMA`.`VIEWS` WHERE TABLE_NAME= 'a' AND TABLE_SCHEMA= 'test_db'
38 Query     SELECT COUNT(*) FROM `INFORMATION_SCHEMA`.`VIEWS` WHERE TABLE_NAME= 'b' AND TABLE_SCHEMA= 'test_db'

38 Quit
37 Quit
36 Quit
```
