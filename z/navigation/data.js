/*
左边导航
通过名称跟左边关联
*/
left_info = [
["常用推荐" ,[] ],
["技术" ,["数据库","编程语言","安装包","前端","安全","技术杂项"] ],
]


/*
右边每一个框
四个字段：
url         必须
名称        必须
logo        可选，为空则显示default.png
详细说明    可选
*/

right_info = [
["常用推荐", [[
["http://www.sysu.edu.cn/","中山大学","./assets/images/logos/sysu.jpg", "为什么不去康乐园逛逛呢"],
["https://weideguo.github.io/","github page","", ""], 
],[],]],

["数据库", [[
["https://www.mysql.com/","mysql","./assets/images/logos/mysql.svg", ""],
["https://mariadb.org/","mariadb","./assets/images/logos/mariadb.png", ""],
["https://www.postgresql.org/","postgresql","./assets/images/logos/postgresql.png", ""], 
["https://www.mongodb.com/","mongodb","./assets/images/logos/mongodb.svg", ""], 
["https://www.redis.com/","redis","./assets/images/logos/redis.png", ""], 
],[],]],

["编程语言", [[
["https://www.golang.org/","golang","./assets/images/logos/Go.webp", ""],
["https://golang.google.cn/","golangcn","./assets/images/logos/Go.webp", ""],
["https://www.python.org/","python","./assets/images/logos/python.ico", ""],
],
[
["https://www.cppreference.com/","c++参考文档","./assets/images/logos/C__.webp",""],
["https://developer.mozilla.org/","mdn js","./assets/images/logos/JavaScript.webp","mozilla的js参考文档"],
["https://zh-google-styleguide.readthedocs.io/en/latest/contents/", "Google 开源项目风格指南", "./assets/images/logos/google.ico", ""],
],
]],

["安装包", [[
["https://pypi.org/","python pypi","./assets/images/logos/pypi.svg", "Python Package Index"],
["https://mvnrepository.com/","mvn仓库","./assets/images/logos/mvn.ico", "java jar包"],
["https://pkg.go.dev/","golang包","./assets/images/logos/go.svg", ""],
["https://pkgs.org/","linux包","./assets/images/logos/tux.png", ""],
],
[
["https://developer.aliyun.com/mirror/","阿里云国内镜像","", ""],
["https://mirrors.cloud.tencent.com/","腾讯云国内镜像","", ""],
],
]],

["前端", [[
["https://vuejs.org/","vue","./assets/images/logos/vue.svg", ""],
["https://cn.vuejs.org/","vuecn","./assets/images/logos/vue.svg", ""],
["https://www.iviewui.com/","iviewui","", ""],
["https://element.eleme.io/","element","", ""],
["https://js1024.fun/","js1024","", "一些有趣的js项目，非常小代码量"],

],[],]],

["安全", [[
["http://cve.mitre.org/","cve","", "Common Vulnerabilities & Exposures"],


],[],]],

["技术杂项", [[
["https://db-engines.com/","DB-Engines","", ""],
["https://www.tiobe.com/tiobe-index/","tiobe","", "编程语言排行榜"],

],[],]],

["前沿研究", [[
["https://arxiv.org","arxiv",  "", "论文预印本，pdf https://arxiv.org/pdf/2305.10403.pdf"],
["https://www.vldb.org/","vldb",  "", "Very Large Data Base"],
["https://sigmod.org/",  "sigmod","", "ACM Special Interest Group on Management of Data"],
["http://www.kdd.org/",  "sigkdd","", "ACM Special Interest Group on Knowledge Discovery and Data Mining"]
],[],]],

]

