This is simple hello-world app that help you have overview about hyron framework

```js
const hyron = require('hyron');

// init instance that listen on localhost, port 3000 by default
var instance = hyron.getInstance();

class DemoRouter {
    // return a object that description about routers
    static requestConfig(){
        return {
            // register event get on method sayHi
            sayHi: "get"
        }
    }

    // main handler that handle business logic
    sayHi(){
        return "hello world";
    }
}

instance.enableService({
    "":DemoRouter
})

instance.startServer();

```

## Result

A router registered on :
> ## GET : http://localhost:3000/sayHi

So, that really easy, right. You can do more with hyron framework :D
check it out in next step

---

Next step : [getting started](./geting-started.md)

See more :

- [Develop Plugins](./plugins-developent/overview.md)
- [Develop Service](./service-developent/overview.md)
- [Develop Addons](./addons-development/overview.md)