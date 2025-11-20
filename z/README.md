---
layout: page
title: "Others"
header-img: "img/others-bg.jpg"
---
# others
[网址导航](/z/navigation/index.html)

不是jekyll的目录，用于存放一些可以直接访问的html


```shell
#生成以下目录信息
tree -f -P "*.html|*.svg" z | grep -vE "(z/navigation/assets|z/yi/icons)"
```

```
z
├── z/2048.html
├── z/alliance.html
├── z/blockoverit.html
├── z/chart_show.html
├── z/matrix.html
├── z/minesweeper.html
├── z/mycounter.html
├── z/navigation
│   └── z/navigation/index.html
├── z/random_string.html
├── z/snake.html
├── z/tetris.html
├── z/tetris.svg
└── z/yi
    └── z/yi/yi.html

```

