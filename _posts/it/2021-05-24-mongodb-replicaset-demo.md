---
title: "mongodb replicaset deploy demo"
layout: post
-- author: "wdg"
header-style: text
tags:
  - mongodb
  - mongoshake
---

# mongodb 副本集安装样例


## 节点信息
10.10.167.188  
10.10.167.190  
10.10.167.191  


## 安装文件
```shell
# 在三个节点运行以安装文件
wget "http://url_to_get_software/mongodb-linux-x86_64-rhel70-4.4.4.tgz" 

tar -zxvf mongodb-linux-x86_64-rhel70-4.4.4.tgz

mkdir /data/mongodata

mv mongodb-linux-x86_64-rhel70-4.4.4 /usr/local/
```


## 配置文件
根据实际情况修改三个节点的配置文件 /etc/mongod.conf
```yaml
processManagement:                                        #
   fork: true                                             #
net:                                                      #
   bindIp: {{IP}}                                         # 必须修改  127+内网 “,”分隔
   port: 27017                                            # 根据实际情况改
   maxIncomingConnections: 65536                          #
storage:                                                  #
   dbPath: /data/mongodata                                #  
   engine: wiredTiger                                     #
   wiredTiger:                                            #
      engineConfig:                                       #
         cacheSizeGB: 2                                   # 根据实际情况改 #默认1/2物理内存
systemLog:                                                #
   destination: file                                      #
   path: "/data/mongodata/mongodb.log"                    # 
   logAppend: true                                        #
storage:                                                  #
   journal:                                               #
      enabled: true                                       #
replication:                                              #
   replSetName: 7road_mongodb_replset                     # 根据实际情况改
   oplogSizeMB: 51200                                     # 根据实际情况改 #默认5%磁盘
security:                                                 #
   authorization: disabled                                #  只用于第一次启动，创建账号后注释
#   authorization: enabled                                 # 第一次启动不使用
#   clusterAuthMode: keyFile                               # 第一次启动不使用
#   keyFile: /data/mongodata/mongodb.key                   # 第一次启动不使用
```


## 启动三个节点
```shell
cd /usr/local/mongodb-linux-x86_64-rhel70-4.4.4
bin/mongod -f /etc/mongod.conf
```


## 设置副本集
```shell
# 进入主节点交互模式
bin/mongo 10.10.167.188:27017/admin
```
```js
// 在主节点的交互命令行设置副本集
rs.initiate()
rs.add("10.10.167.190:27017")  	
rs.add("10.10.167.191:27017")  
```


## 创建管理员账号
```js
// 在主节点的交互命令行创建管理员账号以便之后用认证模式
use admin;   
db.createUser(
 {
	user: "dba",
	pwd: "my_mongodb_passwd",
	roles: [ { role: "root", db: "admin" } ]
 }
)
```
## 重启集群
关闭集群
```shell
# 先关闭副本，再关闭主，防止架构发生变化
bin/mongod  --shutdown -f /etc/mongod.conf
```

修改配置文件
```shell
# 创建key文件
openssl rand -base64 756 > /data/mongodata/mongodb.key

# 复制key文件到每一个节点，启用认证时副本集必须

chmod 400  /data/mongodata/mongodb.key      # 必须更改文件权限，否则文件权限过高启动会报错

vim /etc/mongod.conf                        # 修改配置文件以启用认证模式
```

重新启动
```shell
# 先启动主，再启动副本
cd /usr/local/mongodb-linux-x86_64-rhel70-4.4.4
bin/mongod -f /etc/mongod.conf
```


## 其他操作
```js
// 在哪个库下创建账号，则必须在那个库下认证
use admin;
db.auth('dba','my_mongodb_passwd')

// 创建业务账号 基本只给指定库的读写权限即可
use my_db;   
db.createUser(
 {
	user: "my_account",
	pwd: "my_account_passwd",
	roles: [ { role: "readWrite", db: "my_db" } ]
 }
)

// 在SECONDARY节点时必须先运行以下才能进行其他操作，每次连接都需要操作。只能在PRIMARY节点进行更改操作。
rs.secondaryOk()  

// 查看集群的节点信息
rs.isMaster()
```

