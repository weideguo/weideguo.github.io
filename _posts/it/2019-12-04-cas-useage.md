---
title: "cas use demo"
subtitle: "cas的简单使用样例"
layout: post
author: "wdg"
header-style: text
tags:
  - cas
  - web
  - python
---

> Central Authentication Service (CAS)  
> 用于实现单点登录

# CAS 流程
<img src="/img/post/it/cas_flow_diagram.png"/>
from [apereo.github.io/cas](https://apereo.github.io/cas/5.2.x/protocol/CAS-Protocol.html)



# 流程说明

* 前端跳转至cas，登陆cas获取ticket并重新跳转至前端页面，前端将ticket给后端。

* 后端访问cas验证ticket。

* 之后前后端使用自己的机制维持前后端的登陆状态。(如 cookie/session 或 jwt)


# 其他说明
* cas在登陆后使用cookie/session验证机制保持cas的登陆状态，在cas处于登陆状态时，前端可以免登陆获取ticket。

* ticket  只能验证一次，验证之后ticket即失效。

* service 必须跟从cas获取ticket时的域相同。  
相同： http://192.168.59.132:8080/    http://192.168.59.132:8080/#/login    http://192.168.59.132:8080/?a=aaa  
不相同： https://192.168.59.132:8080/   http://192.168.59.132:8080   http://192.168.59.132:8080/aaa  

* 后端获取xml格式或txt格式信息，由此判断通过与否

* 前后端分离不要使用cookie/session模式，使用jwt代替。  
理由：后端返回时不能设置自己的cookie（因为跟前端页面的域不一样）。而且JS由于W3C的标准不能在发起请求时设置cookie头部。这导致后端无法从cookie获取对应session。



# 使用测试

> 使用[django-mama-cas](https://github.com/jbittel/django-mama-cas)部署CAS服务


```shell
# 安装
pip install Django          
pip install django-mama-cas  
```

```python
#配置文件设置
#url.py
urlpatterns += [url(r'cas/', include('mama_cas.urls'))]

#setting.py
INSTALLED_APPS += ['mama_cas',]
```

```shell
# 使用
python manage.py makemigrations     
python manage.py migrate            
python manage.py createsuperuser    #创建超级账号，因为django-mama-cas使用auth模块，创建的账号可以用于直接登陆cas系统
python manage.py runserver 0.0.0.0:9095

#测试
#访问cas登陆页面且登陆后自动跳转至指定页面，由此获取ticket
http://192.168.59.132:9095/cas/login?service=http://192.168.59.132:8080/#/login

#在其他地方访问以验证ticket
http://192.168.59.132:9095/cas/serviceValidate?ticket=ST-1574942218-RnDXBbgVuB7NOUYkGnv4y4D38V9QCHsk&service=http://192.168.59.132:8080/#/login    #返回xml格式
http://192.168.59.132:9095/cas/validate?ticket=ST-1574942218-RnDXBbgVuB7NOUYkGnv4y4D38V9QCHsk&service=http://192.168.59.132:8080/#/about    #返回txt格式
```





