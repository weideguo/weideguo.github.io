---
title: "数据库关系代数符号描述"
-- subtitle: ""
layout: post
author: "wdg"
header-style: text
tags:
  - database
  - relation algebra
---



| 符号 | 含义 | 说明 |
| ---- | ---- | ---- |
| - | 差   | difference                                                                    |
| ∩ | 交   | intersection                                                                  |
| ∪ | 并   | union                                                                         |
| σ | 选择 | selection，即 where之后的条件                                                 |
| π | 投影 | projection，即获取的字段 ，默认去重                                           |
| θ | 连接 | join，包括自然连接，外连接，半连接，笛卡尔积中选取属性间满足一定条件的元组    |
|   |  ⋈   | 自然连接，相同的属性等值比较，去掉重复的属性（等值连接不去掉重复的属性）      |
|   |  ×   | 笛卡尔积，没有相同的属性等值比较                                              |
| ÷ | 除   | division，R÷S，R匹配于S的记录，减去包含于S的字段，结果集distinct              |

