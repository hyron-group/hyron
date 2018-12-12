<img src='https://i.imgur.com/mAjPWAu.png' width='240px'/>

# Introduction (beta)

hyron is an extremely powerful framework that helps you develop an extremely fast and easy server app.

# Feature

-   **Create router from function** : You can make a normal javascript function become a router, just with few of line
-   **Easy to development** : With Hyron, you can keep your code more cleaner. Easy to management. A beginner can easy to start with it
-   **Plugins-able** : Hyron is plugins system. So, you can install a plugins from another 3rth, management and reuse very easy
-   **Support for RESTFul** : You can create a RestAPI with few of word
-   **High-Performance** : Hyron is 50% more efficient than ExpressJS (by rps with simple request)
-   **Easy to learn** : With Hyron, you do not need to know how Node Server work. Just write normal Javascript function.
-   **Dynamic data type** : Hyron dynamic support for all data type from request

# Release

- More powerful feature for plugins


# Example

This is simple example project to help you have interview about Hyron Framework

**_index.js_**

```js
const hyron = require("hyron");

var myApp = hyron.getInstance(3000, "localhost");

myApp.enableService({
    demo: require("./SimpleApp")
});

myApp.startServer();
```

**_SimpleApp.js_**

```js
module.export = class {
    static requestConfig() {
        return {
            sayHello: "get"
        };
    }

    sayHello(yourName = "you") {
        return "Hello " + yourName + ", Wellcome to HyronJS";
    }
};
```

result :
A router register on :

> GET http://localhost:3000/demo/sayHello?yourName=[your_name]

# API

## Class : ModuleManager (hyron)

## type/HTTPMessage

HTTP Message is extend of Error. Used to break a task and notify to client in hyron class. Make your code more clear

> ### constructor ( code, message ) : Error

### **params :**

- **code** (number) : status code
- **message** (string) : status message

---

## type/StatusCode

Is a list of common status code from 1XX to 5XX. This class used with type/HTTPMessage

---

## Hyron class (ES6)

> ### _static_ **requestConfig** () : HyronClass (object)

Description for Hyron framework to config router

### **result :**

-   **HyronClass** ( object { **func_name** : **meta** } ) : router meta
    -   **func_name** ( string ) : name of function to register listener. Or $all to apply for whole method
    -   **meta** ( string | object ) : router config
        -   **string** : method type. hyron support for 8 type : GET, POST, HEAD, DELETE, PUT, PATCH, PRIVATE and ALL
        -   **object** : router config
            -   **method** (string) : http protocol type like about
            -   **fontware** ( array< string | function > ) : on / off fontware declared in enableFontWare() by name. to off global plugin, delare '!' before it name
            -   **backware** ( array< string | function > ) : on / off fontware declared in enableBackWare() by name. to off global plugin, delare '!' before it name
            -   **enableREST** ( boolean ) : true if you want to make this function become REST. Then, first argument of it will be load as router last path.
            -   **path** ( string ) : custom uri path of this router
            -   handle ( function ) : handle function to register listener, if build-in method don't exist

---

## Default Plugins

> ### param-parser

This is a fontware plugin to parser client request data to function input as primitive type.
It supported for

-   GET, HEAD, DELETE : as query type.
-   POST, PUT, PATCH : as body type

It also include feature help you validate input easier with comment :

```js
// @param field {condition}
```

**Supported condition :**

-   type ( string ) : check if field match with type declared.
-   mime ( string ) : check if upload is type of mime, if type=ClientFile 
-   size ( number ) : check if field size small than or equal size
-   gt (number) : check if field greater than gt
-   gte (number) : check if field greater than or equal gte
-   lt (number) : check if field small than lt
-   lte (number) : check if field small than or equal lte
-   reg (number) : check if field match input with regex
-   in (array<?>) : check if field inside array of value
-   nin (array<?>) : check if field not inside array of value
-   nullable (boolean) : allow input data null or not

### **note :**

with query type. it also support for array or object type.

**Example** : ?key1=[val1,val2]&key2={skey1:val1,skey2:val2}

---

> ### custom-response

This plugin used to custom http response that is node http support, include

- $type : set data response type
- $data : set data for response
- $headers : set response header
- $status : set response status code
- $message : set response status message
- $redirect : redirect to new url

---


## Contributing to Hyron

Check out [contributing guide](https://github.com/hyron-group/hyron/blob/master/CONTRIBUTING.md) to get an overview of how to contribute to Hyron.
