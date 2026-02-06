---
title: "使用xtrabackup备份新建mysql从实例"
layout: post
-- author: "wdg"
header-style: text
tags:
  - mysql
  - slave
  - xtrabackup
  - innobackupex
---



> mysql 5.7  
> xtrabackup 2.4  



## 0、备份

```shell
# 相对于 `--stream=tar  $target_dir | gzip ->  $filename ` 能更好利用并发
innobackupex --defaults-file=/data/mysql3306/conf/my.cnf           \
--user="backup_user" --password="backup_password"                  \
--host=127.0.0.1 --port=3306                                       \
--parallel=8                                                       \
--tmpdir=/tmp                                                      \
--stream=xbstream  --compress --compress-threads=8                 \
/data/mysql_data_backup > /data/mysql_data_backup/10.0.0.2_3306_20260205.xbstream
```



## 1、使用备份还原，启动实例

>可能需要先安装qpress  
>wget 'http://repo.percona.com/tools/yum/release/7/RPMS/x86_64/qpress-11-3.el7.x86_64.rpm' \  
>-O qpress-11-3.el7.x86_64.rpm  
>rpm -ivh qpress-11-3.el7.x86_64.rpm  



```shell
# 提取文件
mkdir ./10.0.0.2_3306
xbstream -x < ./10.0.0.2_3306_20260205.xbstream -C ./10.0.0.2_3306

# 解压
xtrabackup                             \
--decompress --compress-threads=8      \
--remove-original                      \
--datadir=10.0.0.2_3306 --target-dir=10.0.0.2_3306

# 应用日志
innobackupex --apply-log 10.0.0.2_3306

# 先按照mysql安装流程创建目录以及配置文件!!!
# 文件恢复
innobackupex --defaults-file=/data/mysql3306/conf/my.cnf --move-back 10.0.0.2_3306

# 启动mysql
mysqld_safe --defaults-file=/data/mysql3306/conf/my.cnf &
```



## 2、查看备份时的pos位点

```shell
cat /data/mysql3306/data/xtrabackup_info | grep -A 6 pos
```



## 3、设置 gtid\_purged

```sql
reset master;     -- 重置记录执行过的gtid的信息
-- 使用xtrabackup_info记录的pos位点重置 gtid_purged
set global gtid_purged='aaaaaaaa-bbbb-cccc-ddddddddddddddd:1-9123412345' 
```



## 4、启动主从

```sql
-- 重新设置主实例信息
change master to master_host='10.0.0.2'     -- 指向备份时的节点，即备份文件是由10.0.0.2这个实例获取的
,master_port=3306
,master_user='replicate_user'
,master_password='replicate_password'
,master_auto_position=1;    

-- 查看设置的主从信息
show slave status\G

-- 启动主从
start slave;
```
