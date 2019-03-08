<div style = "text-align:center">
    <img src="https://i.imgur.com/mAjPWAu.png" style="width:240px; margin:auto"/>
</div>

# Introduction (beta)

Hyron is an extremely powerful framework that helps you develop an extremely fast and easy server app.


```
npm install hyron
```

![CircleCI](https://img.shields.io/circleci/project/github/hyron-group/hyron/master.svg?style=flat)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/488552ae62744dd7bf6bb34028adcc36)](https://www.codacy.com/app/thangdjw/hyron?utm_source=github.com&utm_medium=referral&utm_content=hyron-group/hyron&utm_campaign=Badge_Grade)
![downloads](https://img.shields.io/npm/dm/hyron.svg?style=flat)
![version](https://img.shields.io/npm/v/hyron.svg?style=flat)
[![chat](https://img.shields.io/gitter/room/hyron-group/community.svg?style=flat)](https://gitter.im/Hyron-group/community)
[![license](https://img.shields.io/npm/l/hyron.svg?style=flat)](https://www.gnu.org/licenses/gpl-3.0.en.html)
[![](http://img.shields.io/liberapay/patrons/thangdjw.svg?logo=liberapay)](https://liberapay.com/thangdjw/donate)
[![Beerpay](https://beerpay.io/hyron-group/hyron/badge.svg?style=flat)](https://beerpay.io/hyron-group/hyron)



# Features

1. **Easy to manage source code**, even with large applications. Hyron helps modules to be rigorously structured. Suitable for microservice architecture application development
2. **High plug-in capability**, allowing you to develop individual modules and **reuse**
3. **High sharing capacity**. Modules are designed to minimize dependency and increase flexibility.
4. Get **help from the community**. Hyron allows you to **install** and **share**, **customize** modules easily
5. Help your source code **independent of the platform**. It makes it easy to switch between platforms, ensuring that the source code is always intuitive
6. **Easy to learn and use**. One of Hyron's top goals is to help the platform be accessible by a beginner
7. **High performance**. Hyron has 40% higher initial performance than Express
8. **Automation**, Hyron helps automate your application development process, and makes it easier for third party addons and plugins

    [See more build-in feature](https://hyron.gitbook.io/reference/buildin-features)

# Release

- fix bug typeFilter

# Example

This is simple example project to help you have interview about Hyron Framework

**_index.js_**

```js
const hyron = require("hyron");
hyron.build("./server.json");
```

**_server.json_**

```json
{
    "base_url": "http://localhost:3000",
    "services": {
        "demo": "./SimpleApp.js"
    }
}
```

**_SimpleApp.js_**

```js
module.exports = class {
    static requestConfig() {
        return {
            sayHello: "get"
        };
    }

    sayHello(yourName = "you") {
        return "Hello " + yourName;
    }
};
```

result :
A router register on :

```http
GET http://localhost:3000/demo/say-hello?yourName=[your_name]
```
# Reference Document

For more detail, please read at : https://docs.hyron.org

# Contributing to Hyron

Check out [contributing guide](https://hyron.gitbook.io/reference/contribution) to get an overview of how to contribute to Hyron.

We will be happy to receive your small investment to help your business and product development take place more quickly and smoothly.

[![](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/thangdjw/donate)
