---
title: "mysql线上实例数据库删除流程"
-- subtitle: ""
layout: post
author: "wdg"
header-style: text
tags:
  - database
  - mysql
---

线上实例可能存在实例迁移、应用下线等出现库不再需要的情况。   
为减少操作的影响、减少回滚时间，按照以下步骤操作。  

### 1、使用备份还原成可导入的表空间文件   
``` shell
# 还原成可按照表空间导入的文件
innobackupex --apply-log --export  /path2backup

# 备份元数据
mysqldump --no-data=TRUE db_name > db_name_backup.sql 

# 将表空间文件传输到待删除实例上，以便出问题时快速恢复
```


### 2、创建硬连接   
``` shell
# 将所有表空间文件.bd创建硬连接
# 因为硬连接的存在，执行drop database时不会实际删除文件，避免大磁盘io的影响
ln xxx.ibd /data/bak/opt_20241212
```


### 3、逐个实例删除表  
``` sql
-- 先删从、再删主，以便在删除从时检验操作是否正确
-- 因为可以使用表空间文件快速恢复，因此如果删除主出现问题时可直接用表空间恢复，而不必再考虑切换到从实例

-- 务必关闭binlog记录
set sql_log_bin=off;
show variables like '%sql_log_bin%';

-- 先逐个表删除，以便观察影响，出现问题及时中止
drop table xxx;

-- 最后删除空库
drop database xxx;
```


### 4、逐步清理磁盘     
``` shell
# 比较大的文件必须运行truncate逐步缩减，较小的文件可以直接rm
truncate xxx.ibd -s 500G
```