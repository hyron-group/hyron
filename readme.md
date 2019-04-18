> Use hyron-cli in place of this package to make working easier and more convenient


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
[![license](https://img.shields.io/npm/l/hyron.svg?style=flat)](https://opensource.org/licenses/MIT)
[![](http://img.shields.io/liberapay/patrons/thangdjw.svg?logo=liberapay)](https://liberapay.com/thangdjw/donate)


# Features

1. High reusability
2. Easy to use
3. Easy to upgrade and maintain
4. High plug-in capability
5. Save working time

# Benefit

1. Save time, development costs
2. Easy to scale, maintain, debug
3. Easy and convenient to work

# Hello world

```js
const hyron = require("hyron");

class demo {
    static requestConfig() {
        return {
            sayHello: "get"
        };
    }

    sayHello(yourName = "you") {
        return "Hello " + yourName;
    }
};

var instance = hyron.getInstance(3000);

instance.enableServices({
    "api": demo
})

instance.startServer();
```

**Result** :
A router register on

```http
GET http://localhost:3000/api/say-hello?yourName=[your_name]
```
# Reference Document

For more detail, please read at : https://docs.hyron.org/api-reference
# Contributing to Hyron

Check out [contributing guide](https://docs.hyron.org/contribute) to get an overview of how to contribute to Hyron.
