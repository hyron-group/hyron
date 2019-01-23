<img src='https://i.imgur.com/mAjPWAu.png' width='240px'/>

# Introduction (beta)

hyron is an extremely powerful framework that helps you develop an extremely fast and easy server app.

# Features

1.  **Create router from function** : You can convert a normal function into a router. Hyron helps you avoid too much dependency on the platform. So you can easily switch from another framework
2.  **Easily to manager source code** : The hyron is designed to minimize dependencies between components, and helps the architecture stay clear and clean. So you can easily pack, edit and manage content, even on a large scale
3.  **High-Performance** : Hyron is 40% more efficient than ExpressJS (by rps with simple request)
4.  **Easy to reuse** : With Hyron, you can help encapsulate your source very closely and flexibly, can be easily plugged, shared, and reused.
5.  **Easy to learn** : With Hyron, you do not need to know how Node Server work. Just write normal Javascript function.
6.  **Separate setting** : With Hyron, you can separate all setting into file, called appcfg.yaml allow you easy to management configs
7.  **Expanded config file** : Hyron allows you to do more with 'appcfg' files, such as inheriting from parent, internal references and external references, freezing fields, etc
8.  **Build app from json file** : In addition to building with the traditional way, now you can easy to create and build a server with json file
9.  **Dynamic data type** : Hyron supports default to allow load content from the request automatically whenever a new request is made. including uploading files and many other data types
10. **Plugins-able** : Hyron is plugins system. So, you can install a plugins from another 3rth, management and reuse very easy, like addons, plugins, services

# Release

-   restructure + refactor
-   more power for appcfg.yaml
-   more power for addons
-   build app from json
-   supported for rest api
-   supported for https and http2
-   fix bug

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

> GET http://localhost:3000/demo/sayHello?yourName=[your_name]

## Reference Document

See more at : https://hyron.gitbook.io/reference

## Contributing to Hyron

Donate : https://paypal.me/thangdjw

<b style="color : red"> Bug report</b> : https://goo.gl/forms/zhANKd3xLO0bD9Dy2

Check out [contributing guide](https://github.com/hyron-group/hyron/blob/master/CONTRIBUTING.md) to get an overview of how to contribute to Hyron.
