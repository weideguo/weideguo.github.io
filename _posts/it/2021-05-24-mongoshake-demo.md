---
title: "mongoshake deploy demo"
layout: post
-- author: "wdg"
header-style: text
tags:
  - mongodb
  - mongoshake
---

# mongoshake安装样例
将mongodb副本集群的数据同步到另外一个mongodb集群（其他的架构模式也支持）


## 预先条件
分别部署两mongodb副本集集群，并确保网络互通
```
# replset1 源端
10.10.100.16:37017
10.10.100.5:37017
10.10.100.6:37017

# replset2 目的端
172.16.0.6:37017
172.16.0.9:37017
172.16.0.7:37017
```


## 安装文件
```shell
# 在目的端任意一个节点运行
wget "http://url_to_get_software/mongo-shake-v2.4.22.tar.gz" 
tar -zxvf mongo-shake-v2.4.22.tar.gz
mv mongo-shake-v2.4.22 /usr/local/
```


## 账号设置
```js
// 依据最小授权创建账号
// 创建复制账号 源端
use mongoshake;   
db.createUser(
 {
	user: "repl_user",
	pwd: "repl_user_passwd",
	roles: [ { role: "readWrite", db: "mongoshake" },
    { role: "backup", db: "admin"}
    ]
 }
)


// 创建复制账号 目的端
use admin;   
db.createUser(
 {
	user: "repl_user",
	pwd: "repl_user_passwd",
	roles: [ { role: "readWriteAnyDatabase", db: "admin" } ]
 }
)
```


## 配置信息
修改配置文件collector.conf
```ini
# 源端连接uri
mongo_urls = mongodb://repl_user:repl_user_passwd@10.10.100.16:37017,10.10.100.5:37017,10.10.100.6:37017/mongoshake

# 目的端连接uri
tunnel.address = mongodb://repl_user:repl_user_passwd@172.16.0.6:37017,172.16.0.9:37017,172.16.0.7:37017/admin

# 先全量同步，然后增量同步
sync_mode = all

# 同步DDL
filter.ddl_enable = true

# 全量同步后创建索引
full_sync.create_index = background

# v2.4.22默认没有设置 其他版本可能不需要设置
incr_sync.tunnel.write_thread = 16
```


## 启动服务
```shell
cd /usr/local/mongo-shake-v2.4.22
./collector.linux -conf=collector.conf &
```


## 其他信息
mongoshake在源端通过mongoshake库下的表ckpt_default记录同步信息，可以控制ckpt_default的记录实现控制同步信息，需要重启mongoshake。
* 重新全量同步
删掉目的端的库的数据，删除源端的 mongoshake ckpt_default

* 跳过某个时间段的事件
进入增量同步时，修改源端的 mongoshake ckpt_default 的 ckpt 


## 注意事项
mongodb版本为4.4.4，mongoshake版本为2.4.22时，在增量同步时新创建索引会导致同步失败。（可考虑升级mongoshake）    
可以通过查看源端local库下oplog.rs的记录，确定创建索引操作的结束点，修改mongoshake库下ckpt_default的记录跳过创建索引的同步操作，在目的端手动创建索引。

