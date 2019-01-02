<img src='https://i.imgur.com/mAjPWAu.png' width='240px'/>

# Introduction (beta)

hyron is an extremely powerful framework that helps you develop an extremely fast and easy server app.

# Feature

-   **Create router from function** : You can make a normal javascript function become a router, just with few of line
-   **Easy to development** : With Hyron, you can keep your code more cleaner. Easy to management. A beginner can easy to start with it
-   **Plugins-able** : Hyron is plugins system. So, you can install a plugins from another 3rth, management and reuse very easy
-   **Support for RESTFul** : You can create a RestAPI with few of word
-   **High-Performance** : Hyron is 40% more efficient than ExpressJS (by rps with simple request)
-   **Easy to learn** : With Hyron, you do not need to know how Node Server work. Just write normal Javascript function.
-   **Dynamic data type** : Hyron dynamic support for all data type from request

# Release

- fix bug


# Example

This is simple example project to help you have interview about Hyron Framework

**_index.js_**

```js
const hyron = require("hyron");

var myApp = hyron.getInstance(3000, "localhost");

myApp.enableServices({
    demo: require("./SimpleApp")
});

myApp.startServer();
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

<b style="color : red"> Bug report</b> : https://goo.gl/forms/zhANKd3xLO0bD9Dy2

Check out [contributing guide](https://github.com/hyron-group/hyron/blob/master/CONTRIBUTING.md) to get an overview of how to contribute to Hyron.
