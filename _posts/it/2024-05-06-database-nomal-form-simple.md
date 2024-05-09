---
title: "浅谈数据库的范式"
-- subtitle: ""
layout: post
author: "wdg"
header-style: text
tags:
  - database
  - nf
---

* 1NF  无重复的域，即数据库表的每一列都是不可分割的原子数据项，而不能是集合，数组，记录等非原子数据项 。即为二维表。  
* 2NF  消除非主属性对码的部分函数依赖  
* 3NF  消除非主属性对码的传递函数依赖   
* BCNF 消除主属性对码的部分和传递函数依赖  
* 4NF  消除非平凡且非函数依赖的多值依赖  

### 名词解释
* 候选码 Candidate Key  
  能唯一确定这一条记录的属性集合，一个关系可能存在多个候选码  

* 码 key  
  候选码中选择，一个关系中只有一个码  

* 主属性、非主属性  Primary Attribute  
  包含在任一个候选码中的属性为主属性，其余为非主属性，又称关键字  

* 部分函数依赖 Partial Functional Dependency   
  存在`(A,B)->C`，`B->C`， 则`C`对`(A,B`)部分函数依赖  
  例1： `销售表(产品id,地区id,价格,产品名)`， 码为 `(产品id,地区id)`，而`(产品id)→(产品名)`，因此存在非主属性部分依赖于码  

  例2：`选课关系表(学号, 姓名, 年龄, 课程名称, 成绩, 学分)`，关键字为组合关键字`(学号, 课程名称)`，存在决定关系：  
`(学号, 课程名称) → (姓名, 年龄, 成绩, 学分)`  
存在部分函数依赖：  
`(课程名称) → (学分)`，`(学号) → (姓名, 年龄)`  

* 传递函数 Transitive Functional Dependency  
  `(病历号)→(姓名)`，` (姓名)→(性别)`  

* 多值依赖  Multivalued Dependency  
  `(StudentID, CourseID) →→ RoomNumber` 同一个学生可能会在不同的时间、不同的教室上同一门课程的不同部分，即一门课程可能在多个教室进行

### 样例
* 关系  
  `R (U, F)`  
  `U={ Sno, Sna, Cno, G }`, 其中 Sno:学号, Sna:姓名, Cno:课号, G:成绩  
  `F={ (Sno,Cno)→ G, Sno → Sna }`   
* BCNF  
  `仓库管理关系表(仓库ID,存储物品ID,管理员ID,数量)`，且有一个管理员只在一个仓库工作；一个仓库可以存储多种物品。这个数据库表中存在如下决定关系：  
  `(仓库ID,存储物品ID)→(管理员ID,数量)`，` (管理员ID,存储物品ID)→(仓库ID,数量)`  
  所以，`(仓库ID,存储物品ID)`和`(管理员ID,存储物品ID)`都是候选码，表中的非主属性为数量，符合3NF。但是，由于存在如下决定关系：  
  `(仓库ID)→(管理员ID)`，` (管理员ID)→(仓库ID)`  
  即存在主属性对码的部分函数依赖，因此不符合BCNF

### 规范化
规范化过程，是通过投影分解运算，把低一级范式的关系模式“分离”为若干个高一级范式的关系模式。但这种投影分解不是唯一的，要求分解“**既保持函数依赖**”，又具有“**无损连接性**”。