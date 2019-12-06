---
title: "cas proxy demo"
subtitle: "cas proxy 使用样例"
layout: post
author: "wdg"
header-style: text
tags:
  - cas
  - cas proxy
  - web
  - python
---

> 在单点登陆基础上使用proxy功能
> 如应用app1要请求app2的接口，app2可以通过proxy功能验证app1的登陆状态

# CAS proxy 流程
<img src="/img/post/cas_proxy_flow_diagram.jpg"/>
from [apereo.github.io/cas](https://apereo.github.io/cas/5.2.x/protocol/CAS-Protocol.html)


# 流程简述
* app1登陆cas获取PGTID
* 当app1要访问app2时，app1使用PGTID从cas获取proxyTicket
* app1将proxyTicket传给app2
* app2使用proxyTicket访问cas验证app1的登陆状态
* app2使用自己的机制维持app1的登陆状态 (如 jwt)


# 使用测试

> 使用[django-mama-cas](https://github.com/jbittel/django-mama-cas)部署CAS服务


```python
# settings.py
# 模块格式
MAMA_CAS_SERVICES = [
    {
        'SERVICE': '^https://[^\.]+\.example\.com',
        'CALLBACKS': [
            'mama_cas.callbacks.user_name_attributes',
            #'mama_cas.callbacks.user_model_attributes'
        ],
        'LOGOUT_ALLOW': True,
        'LOGOUT_URL': 'https://www.example.com/logout',
        'PROXY_ALLOW': True,
        'PROXY_PATTERN': '^https://proxy\.example\.com',
    }
]
# 如
# 设置环境变量实现不验证https证书
# export REQUESTS_CA_BUNDLE='' 
MAMA_CAS_SERVICES = [
    {
        'SERVICE': 'http://192.168.59.132:8080',
        'CALLBACKS': [
            'mama_cas.callbacks.user_name_attributes',
        ],
        'PROXY_ALLOW': True,
        'PROXY_PATTERN': 'https://192.168.59.132:9000',   #必须使用https
    }
]
```
```python
#测试
#cas http://192.168.59.132:9095
#app1 前端 http://192.168.59.132:8080
#app1 后端 https://192.168.59.132:9000
#app2 后端 https://192.168.59.132:7000

#app1前段登陆cas获取ticket
#app1前端访问cas登陆页面且登陆后自动跳转至指定页面，由此获取ticket
http://192.168.59.132:9095/cas/login?service=http://192.168.59.132:8080/#/login


#app1
import requests
r=requests.get("http://192.168.59.132:9095/cas/serviceValidate?ticket=ST-1575547919-x9hmBavhQ4PBfGQ1C3skBqiGLNpkQ3BB&service=http://192.168.59.132:8080/&pgtUrl=https://192.168.59.132:9000/api/v1/test/")
r.text

u'<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas"><cas:authenticationSuccess><cas:user>admin</cas:user><cas:attributes><cas:full_name /><cas:short_name /><cas:username>admin</cas:username></cas:attributes><cas:proxyGrantingTicket>PGTIOU-1575547987-AdnJJ3fue762NWSgEOCHiZF6eLYKFIY7</cas:proxyGrantingTicket></cas:authenticationSuccess></cas:serviceResponse>'

#由请求的返回调用获取PGTID
#"GET /api/v1/test/?pgtIou=PGTIOU-1575547987-AdnJJ3fue762NWSgEOCHiZF6eLYKFIY7&pgtId=PGT-1575547987-aQwBzY7wYR1cbTmtS9OJmV9ePCzGOpaw HTTP/1.0"


########这个可以多次调用，即PGTID可以使用多次
#app1
import requests
r=requests.get("http://192.168.59.132:9095/cas/proxy?pgt=PGT-1575547987-aQwBzY7wYR1cbTmtS9OJmV9ePCzGOpaw&targetService=https://192.168.59.132:7000")
r.text

u'<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas"><cas:proxySuccess><cas:proxyTicket>PT-1575548031-xFfzgc4ucGy243Go5J7hF43jsSY3wrgP</cas:proxyTicket></cas:proxySuccess></cas:serviceResponse>'


#app2
import requests
r=requests.get("http://192.168.59.132:9095/cas/proxyValidate?service=https://192.168.59.132:7000&ticket=PT-1575548031-xFfzgc4ucGy243Go5J7hF43jsSY3wrgP")
r.text

u'<cas:serviceResponse xmlns:cas="http://www.yale.edu/tp/cas"><cas:authenticationSuccess><cas:user>admin</cas:user><cas:attributes><cas:full_name /><cas:short_name /><cas:username>admin</cas:username></cas:attributes><cas:proxies><cas:proxy>https://192.168.59.132:7000</cas:proxy></cas:proxies></cas:authenticationSuccess></cas:serviceResponse>'
```




