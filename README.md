# 本地使用
```shell
###############环境搭建###############
#安装ruby
yum install ruby

##gem是ruby包的管理程序
##列出源
# gem sources -l
##添加源
# gem source -a https://gems.ruby-china.org
#安装jekyll
gem install jekyll
#安装jekyll-paginate
gem install jekyll-paginate
######################################

##创建新项目
# jekyll new zouzhicun.github.io   

##当前文件夹中的内容将会生成到 ./_site 文件夹中，即可当成静态文件使用
# jekyll build   

#运行
cd zouzhicun.github.io
jekyll serve
jekyll serve --host 0.0.0.0 --port 4000
```



# github pages
提交此代码到对应仓库    
url   https://zouzhicun.github.io



# 目录/文件说明
* _posts  
  提交markdown文件于此，可以任意组织目录，但文件名必须 YEAR-MONTH-DAY-title.md 或 YEAR-MONTH-DAY-title.markdown
* _layouts
  存放布局文件，提交的markdown文件在头部 layout 制定使用的布局
* _includes  
  子模块文件，可以提供其他文件引用。如： {% include nav.html %}
* _config.yml
  配置文件，其他文件通过 {{ site.XXX }} 引用在此设置的值
* 其他
  index.html 主页  
  404.html 404页面
  其他页面在运行时的路径位置与现在的一致



# md文件头
需要在markdown文件头部加入以下模块以控制布局
```shell
---                                              # 头部开头
title: "how to antigravity"                      # 文章标题   必须
subtitle: "how to antigravity"                   # 文章子标题 可选
layout: post                                     # 使用的布局，对应_layouts目录下的文件 必须
author: "wdg"                                    # 文章作者 可选
-- header-style: text                            # 文章不使用头部图片 可选 
header-img: "img/post/post-bg-2015.jpg"          # 文章使用头部图片 可选 默认使用空白文件
header-img-credit: "ABC"                         # 头部图片标注所有者  可选
header-img-credit-href: "http://xxx.abc.xx"      # 头部图片标注链接 可选
multilingual: false                              # 是否设置为多语言，参考about.html
tags:                                            # 文章标签，通过标签为文章归类 可选
  - python                                       # 标签名
  - joke                                         # 
---                                              # 头部结尾
```


