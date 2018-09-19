![logo](https://i.imgur.com/mAjPWAu.png)

# Introduction

### **Hyron** is powerful framework can transform a function become a http router, easy to test, scale up, with many interesting features

(update 12/8/2018)

# Todo
- Auth plugins
- New Debug engine
- Micro-service support
- CLI tools for build & deploy app
- Optimize performance & fix bug
- APIDocs render for API viewer
- Document & Guide
- Hyron Plugin Hub
- Cache plugin for cache response

# Processing
- Security

# Done
- **Add view render module** : Support for Pug view engine
- **Support config-by-file** : config hyron app inside appcfg.ini declared in root. Support inheritance in their plugins
- **Plug-in mechanism** : make hyron become more flexible and convenient by install module with name @hyron/[plugin-name]
- **Boot performance** : faster than ExpressJS ~40% (in rps)
- **fontware** : run middleware before handle function to handle input data
- **backware** : run middleware after handle function to handle response data
- **param-parser** plugin : for prepare input data from request, and check data if match condition declare by comment in handle function 
- **args-loader** plugin : load needed param as 'this' inside handle function 
- **Support query-type** : includes GET, HEAD, DELETE
- **Register router** by function
- - **Support for body-type** : includes POST, PUT
- **Support for REST-API**