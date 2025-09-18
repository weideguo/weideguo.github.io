---
title: "mysql使用ghost执行ddl过程分析"
-- subtitle: ""
layout: post
author: "wdg"
header-style: text
tags:
  - mysql
  - database
  - sql
  - ddl
  - ghost
---


### operation
``` shell
# version 1.1.7
gh-ost                                   \
-execute                                 \
-allow-on-master                         \
-assume-rbr                              \
-ok-to-drop-table                        \
-default-retries 120                     \
-cut-over-lock-timeout-seconds 10        \
-host 10.1.1.100                         \
-port 11000                              \
-user weideguo                           \
-password my_password                    \
-database my_db                          \
-table a                                 \
-alter "engine=innodb"                   \
--chunk-size=10
```

### info
``` sql
CREATE TABLE `a` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `success_time` timestamp NULL DEFAULT NULL,
  `x` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
```

### log
``` sql
Version: 5.7.44-log (MySQL Community Server (GPL)).
Id  Command  Argument
663 Connect  weideguo@10.1.1.100 on my_db using TCP/IP
663 Query    set names utf8mb4
663 Query    SET NAMES utf8mb4
663 Query    SET autocommit = true, transaction_isolation = "REPEATABLE-READ"
663 Query    select @@global.version
663 Query    select @@global.port
663 Query    select @@global.hostname, @@global.port
663 Query    show /* gh-ost */ grants for current_user()
663 Query    select /* gh-ost */ @@global.log_bin, @@global.binlog_format
663 Query    select /* gh-ost */ @@global.binlog_row_image
663 Query    show /* gh-ost */ table status from `my_db` like 'a'
663 Query    SELECT /* gh-ost */ ... FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ...               -- 确认外键的情况，依赖外表的字段、被依赖的字段
663 Query    SELECT /* gh-ost */ COUNT(*) AS num_triggers FROM INFORMATION_SCHEMA.TRIGGERS ...  -- 确认触发器的情况
663 Query    explain select /* gh-ost */ * from `my_db`.`a` where 1=1
663 Query    SELECT /* gh-ost */ ... FROM INFORMATION_SCHEMA.COLUMNS ...          

663 Query    show columns from `my_db`.`a`
663 Query    SELECT /* gh-ost */ AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES ...              -- 获取表的AUTO_INCREMENT值
    
663 Query    select /* gh-ost */ @@global.log_slave_updates
663 Query    select @@global.version
663 Query    select @@global.port
663 Query    show /* gh-ost readCurrentBinlogCoordinates */ master status
666 Connect    weideguo@10.1.1.100 on  using TCP/IP
666 Query    set names utf8mb4
666 Query    SHOW GLOBAL VARIABLES LIKE 'BINLOG_CHECKSUM'                                                                            
666 Query    SET @master_binlog_checksum='NONE'                                                                                      
666 Query    SET @slave_uuid = 'f074c201-9444-11f0-95ac-4cd98f4be3d9', @replica_uuid = 'f074c201-9444-11f0-95ac-4cd98f4be3d9'       -- 
666 Binlog Dump    Log: 'binlog.000082'  Pos: 17177306                                                                              -- 复制binlog
667 Connect    weideguo@10.1.1.100 on my_db using TCP/IP
667 Query    set names utf8mb4
667 Query    SET NAMES utf8mb4
667 Query    SET autocommit = true, transaction_isolation = "REPEATABLE-READ"
667 Query    select @@global.version
667 Query    select @@global.port
668 Connect    weideguo@10.1.1.100 on my_db using TCP/IP
668 Query    set names utf8mb4
668 Query    SET NAMES utf8mb4
668 Query    SET transaction_isolation = "REPEATABLE-READ", autocommit = true
668 Query    select @@global.version
668 Query    select @@global.port
667 Query    select /* gh-ost */ @@global.time_zone, @@global.wait_timeout
667 Query    select @@global.hostname, @@global.port
667 Query    show columns from `my_db`.`a`
667 Query    show /* gh-ost */ table status from `my_db` like '_a_gho'
667 Query    show /* gh-ost */ table status from `my_db` like '_a_del'
667 Query    drop /* gh-ost */ table if exists `my_db`.`_a_ghc`
667 Query    create /* gh-ost */ table `my_db`.`_a_ghc` (                         -- 这个表记录执行的进度
            id bigint unsigned auto_increment,
            last_update timestamp not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            hint varchar(64) charset ascii not null,
            value varchar(4096) charset ascii not null,
            primary key(id),
            unique key hint_uidx(hint)
        ) auto_increment=256 comment='gh-ost changelog'
667 Query    START TRANSACTION
667 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
667 Query    create /* gh-ost */ table `my_db`.`_a_gho` like `my_db`.`a`
667 Query    COMMIT
667 Query    START TRANSACTION
667 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
667 Query    alter /* gh-ost */ table `my_db`.`_a_gho` engine=innodb
667 Query    COMMIT
667 Query    alter /* gh-ost */ table `my_db`.`_a_gho` AUTO_INCREMENT=236

667 Query    insert /* gh-ost */ into `my_db`.`_a_ghc` ...                        -- 将ghost执行进度写入表中

663 Query    SELECT /* gh-ost */ ... FROM INFORMATION_SCHEMA.COLUMNS ...             -- 查询mysql系统表获取表的主键信息
            
663 Query    show columns from `my_db`.`_a_gho`
663 Query    select /* gh-ost */ *
        from
            information_schema.columns
        where
            table_schema='my_db'
            and table_name='a'
663 Query    select /* gh-ost */ *
        from
            information_schema.columns
        where
            table_schema='my_db'
            and table_name='a'
663 Query    select /* gh-ost */ *
        from
            information_schema.columns
        where
            table_schema='my_db'
            and table_name='_a_gho'

667 Query    START TRANSACTION                                -- 确认要复制的主键范围
667 Query    select /* gh-ost `my_db`.`a` */ `id`
        from
            `my_db`.`a`
        force index (PRIMARY)
        order by
            `id` asc
        limit 1
667 Query    select /* gh-ost `my_db`.`a` */ `id`
        from
            `my_db`.`a`
        force index (PRIMARY)
        order by
            `id` desc
        limit 1
667 Query    COMMIT

679 Query    SET autocommit = true, transaction_isolation = "REPEATABLE-READ"
680 Query    SET transaction_isolation = "REPEATABLE-READ", autocommit = true

680 Query    SET /* gh-ost */ SESSION time_zone = '+00:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    START TRANSACTION                                  -- 通过binlog补操作时的事务，一条update转换成一条delete一条replace
680 Query    delete /* gh-ost `my_db`.`_a_gho` */               -- 
        from                                                    -- 主键130至138被改成+1000 
            `my_db`.`_a_gho`                                    -- 并不是优先执行这个语句，通用日志记录问题而已
        where                                                   -- 实际应该是ghost判断主键是否已经复制到影子表，再执行
            ((`id` = 130));                                     -- 数据量大时多个事务执行，并不必等待全表所有记录都复制到到影子表
680 Query    replace /* gh-ost `my_db`.`_a_gho` */              -- 
        into                                                    
            `my_db`.`_a_gho`                                    
            (`id`, `success_time`, `x`)                         
        values                                                  
            (1130, '2025-09-18 03:14:52', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 131));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1131, '2025-09-18 03:15:37', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 132));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1132, '2025-09-18 03:17:08', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 133));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1133, '2025-09-18 03:18:31', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 134));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1134, '2025-09-18 03:19:51', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 135));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1135, '2025-09-18 03:19:52', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 136));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1136, '2025-09-18 03:20:04', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 137));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1137, '2025-09-18 03:20:05', 12);
680 Query    delete /* gh-ost `my_db`.`_a_gho` */
        from
            `my_db`.`_a_gho`
        where
            ((`id` = 138));
680 Query    replace /* gh-ost `my_db`.`_a_gho` */
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        values
            (1138, '2025-09-18 03:23:44', 12)
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:0 */                    -- 确认该批次复制的主键的上限
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 130) or ((`id` = 130))) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore                           -- 根据主键迭代复制数据到影子表
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 130) or ((`id` = 130))) and ((`id` < 148) or ((`id` = 148))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:1 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 148)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 148)) and ((`id` < 158) or ((`id` = 158))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:2 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 158)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 158)) and ((`id` < 168) or ((`id` = 168))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:3 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 168)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 168)) and ((`id` < 178) or ((`id` = 178))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:4 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 178)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 178)) and ((`id` < 188) or ((`id` = 188))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:5 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 188)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 188)) and ((`id` < 198) or ((`id` = 198))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:6 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 198)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 198)) and ((`id` < 208) or ((`id` = 208))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:7 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 208)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 208)) and ((`id` < 218) or ((`id` = 218))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:8 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 218)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 218)) and ((`id` < 228) or ((`id` = 228))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:9 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 228)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 228)) and ((`id` < 1099) or ((`id` = 1099))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:10 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 1099)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 1099)) and ((`id` < 1113) or ((`id` = 1113))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:11 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 1113)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 1113)) and ((`id` < 1123) or ((`id` = 1123))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:12 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 1123)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    select /* gh-ost `my_db`.`a` iteration:12 */ `id`
        from (
            select
                `id`
            from
                `my_db`.`a`
            where
                ((`id` > 1123)) and ((`id` < 1129) or ((`id` = 1129)))
            order by
                `id` asc
            limit 10) select_osc_chunk
        order by
            `id` desc
        limit 1
680 Query    START TRANSACTION
680 Query    SET SESSION time_zone = '+08:00', sql_mode = CONCAT(@@session.sql_mode, ',NO_AUTO_VALUE_ON_ZERO,STRICT_ALL_TABLES')
680 Query    insert /* gh-ost `my_db`.`a` */ ignore
        into
            `my_db`.`_a_gho`
            (`id`, `success_time`, `x`)
        (
            select `id`, `success_time`, `x`
            from
                `my_db`.`a`
            force index (`PRIMARY`)
            where
                (((`id` > 1123)) and ((`id` < 1129) or ((`id` = 1129))))
                lock in share mode
        )
680 Query    COMMIT
680 Query    select /* gh-ost `my_db`.`a` iteration:13 */
            `id`
        from
            `my_db`.`a`
        where
            ((`id` > 1129)) and ((`id` < 1129) or ((`id` = 1129)))
        order by
            `id` asc
        limit 1
        offset 9
680 Query    select /* gh-ost `my_db`.`a` iteration:13 */ `id`
        from (
            select
                `id`
            from
                `my_db`.`a`
            where
                ((`id` > 1129)) and ((`id` < 1129) or ((`id` = 1129)))
            order by
                `id` asc
            limit 10) select_osc_chunk
        order by
            `id` desc
        limit 1

680 Query    START TRANSACTION
680 Query    select /* gh-ost */ connection_id()
680 Query    select /* gh-ost */ get_lock('gh-ost.680.lock', 0)
680 Query    set /* gh-ost */ session lock_wait_timeout:=20                               -- 为gh-ost参数cut-over-lock-timeout-seconds 超时时间*2；确保先获取锁
679 Query    show /* gh-ost */ table status from `my_db` like '_a_del'
679 Query    create /* gh-ost */ table `my_db`.`_a_del` (
            id int auto_increment primary key
        ) engine=InnoDB comment='ghost-cut-over-sentry'
680 Query    set /* gh-ost */ session wait_timeout:=30
680 Query    lock /* gh-ost */ tables `my_db`.`a` write, `my_db`.`_a_del` write            -- 先锁表

...
663 Query    select /* gh-ost */ hint, value from `my_db`.`_a_ghc` ...
679 Query    insert /* gh-ost */ into `my_db`.`_a_ghc` ...
...

679 Query    START TRANSACTION
679 Query    select /* gh-ost */ connection_id()
679 Query    set /* gh-ost */ session lock_wait_timeout:=10                                                -- 为gh-ost参数cut-over-lock-timeout-seconds 超时时间，当这个失败则ghost退出
679 Query    rename /* gh-ost */ table `my_db`.`a` to `my_db`.`_a_del`, `my_db`.`_a_gho` to `my_db`.`a`    -- 等待锁释放才能执行
667 Query    select /* gh-ost */ id
        from
            information_schema.processlist
        where
            id != connection_id()
            and 679 in (0, id)
            and state like concat('%', 'metadata lock', '%')
            and info like concat('%', 'rename', '%')
667 Query    select /* gh-ost */ is_used_lock('gh-ost.680.lock')
680 Query    drop /* gh-ost */ table if exists `my_db`.`_a_del`
680 Query    unlock /* gh-ost */ tables                                                           -- 释放锁，rename操作得以执行
667 Query    set /* gh-ost */ session wait_timeout:=1800
680 Query    ROLLBACK
680 Query    show /* gh-ost */ table status from `my_db` like '_a_del'
679 Query    ROLLBACK

680 Query    insert /* gh-ost */ into `my_db`.`_a_ghc` ...

682 Connect  weideguo@10.1.1.100 on  using TCP/IP
682 Query    KILL 666                                                    -- 关闭复制binlog的连接
680 Query    drop /* gh-ost */ table if exists `my_db`.`_a_ghc`
680 Query    drop /* gh-ost */ table if exists `my_db`.`_a_del`
                                                                         -- ghost所有连接退出    
```