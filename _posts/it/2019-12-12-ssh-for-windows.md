---
title: "ssh for windows"
subtitle: "windows使用ssh"
layout: post
author: "wdg"
header-style: text
tags:
  - windows
  - ssh
---

> 在window上安装ssh服务，以实现通过ssh连接，且可以分发shell命令

### freeSSHd 安装 ###
> 支持ssh/sftp，可以指定连接后使用的命令环境。（如window自带的cmd，或者额外安装的linux的bash）
>
> 极容易存在漏洞，不要对所有外网开放SSH端口。

<img src="/img/post/freeSSHd.png"/>


### cygwin 安装 ###
> 用于支持linux的shell环境

