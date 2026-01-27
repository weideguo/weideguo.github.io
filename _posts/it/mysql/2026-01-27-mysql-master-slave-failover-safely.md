---
title: "不停应用下MySQL主从安全地切换"
layout: post
-- author: "wdg"
header-style: text
tags:
  - mysql
  - failover
---


# 操作概述

先设置旧的主为`read_only`，再进行后续切换操作（mysql主从切换，VIP更改指向），由此可以避免双写问题。

但在切换过程所有写操作会失败；切换后因为旧的数据库连接保持，因此也会写失败，需要手动kill旧的连接，应用创建新的连接后才能写成功，或者在切换完成重启应用以创建新连接。

> orchestrator 也是如此操作，但VIP的切换需要依赖`PostFailoverProcesses`配置项设置的回调脚本实现。



# 切换过程

**当前状态**

应用使用VIP连接到主。

![](/img/post/it/mysql-failover-diagram.png)

**设置旧主只读**

设置`read_only`后所有连接都不能写，运行到一半的事务提交失败因而回滚。

![](/img/post/it/mysql-failover-diagram-1.png)

**设置VIP指向，新主可写**

此时如果应用发起新的连接，则连接到新的主，因此可以写。

如果应用使用旧的连接，则还连接到原来的主，写操作出现只读报错。

![](/img/post/it/mysql-failover-diagram-2.png)
