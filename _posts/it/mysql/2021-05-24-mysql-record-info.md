---
title: "mysql record info"
layout: post
-- author: "wdg"
header-style: text
tags:
  - mysql
  - innodb
---

# 记录头信息

compact记录头
<img src="/img/post/compact_record_head.png"/>

redundant记录头（兼容旧版本  如 FIXED）
<img src="/img/post/redundant_record_head.png"/>


# 记录格式

普通compact记录记录格式
<img src="/img/post/compact.png"/>

普通redundant记录记录格式
<img src="/img/post/redundant.png"/>

dynamic以及compressed记录记录格式  
can store long variable-length column values (for VARCHAR, VARBINARY, and BLOB and TEXT types) fully off-page，数据页中只存放20个字节的指针，实际的数据存放在Off Page中
<img src="/img/post/dynamic_compressed.png"/>

compact以及redundant记录格式  
Fixed-length columns greater than or equal to 768 bytes are encoded as variable-length columns, which can be stored off-page
<img src="/img/post/compact_redundant.png"/>


# 格式类型
```
COMPACT    默认，性能瓶颈不在CPU时性能可以提高  
REDUNDANT  兼容旧版本  如 FIXED  
DYNAMIC    COMPACT的衍生，变长存储  
COMPRESSED COMPACT的衍生，压缩存储   
``` 