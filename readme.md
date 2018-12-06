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

- support for **url-encoded** data
- support for **raw data** type with $body


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

> ### _static_ **getInstance** ( port, host, prefix ) : ModuleManager

Used to create new app instance.
Call this method by **require('hyron')**

### **params :**

-   **port** ( number ) : port number this for instance. default is **3000**
-   **host** ( string ) : host name for this instance. default is **localhost**
-   **prefix** ( string ) : name of app instance. It used when you have multi app instance, make listener hold on : http://host:port/prefix

---

> ### **setting** ( config ) : void

Used to config app and installed plugins

### **params :**

-   **config** ( object ) : config of app or it plugins

---

> ### _static_ **getConfig** ( name ) : string | object<?>

Used to get config of app or installed plugins by name

**params :**
- **name** (string) : config item name or plugin name

---


> ### _static_ **getInstanceManager** () : Object<baseURI, ModuleManager>

Used to get all app instance created

---

> ### **enableMiddlewareByConfigFile** () : void

This function will automatic call when first time require('hyron')
This function used to load config from appcfg.ini file from root and their plugins
**appcfg.ini** have characteristics inheritance. It mean you can overload plugins setting from your project if that plugins props declare < parent > in it appcfg.ini

---

> ### **enableFontWare** ( fontware ) : void

This method used to register plugins will be executed before handler (declare in enableModule()) to handle client request for input

Any predefined plugin will be run first

### **params :**

-   **fontware** (object {**name** : **handle**} ): contain list of plugin and it config
    -   **name** ( string ) : name of plugins
    -   **handle** ( function | object )
        -   **function** : this function will be execute before main handle declare in enableModule()
        -   **object** { **global** , **handle** } : meta data for handle
            -   **global** ( boolean ) : true if you want auto execute this plugins before every main handle
            -   **handle** ( function(req, res, prev) ) : like below handle
                -   **req** (IncomingMessage) : client request
                -   **res** (ServerResponse) : server response
                -   **prev** : preview data return by abort fontware


---

> ### **enableBackware** ( backware ) : void

This method used to register plugins will be executed after handler (declare in enableModule()) to handle server response for output

Any predefined plugin will be run last

### **params :**

-   **fontware** (object {**name** : **handle**} ): contain list of plugin and it config
    -   **name** ( string ) : name of plugins
    -   **handle** ( function | object )
        -   **function** : this function will be execute after main handle declare in enableModule()
        -   **object** { **global** , **handle** } : meta data for handle
            -   **global** ( boolean ) : true if you want auto execute this plugins after every main handle
            -   **handle** ( function(req, res, prev) ) : like below handle
                -   **req** (IncomingMessage) : client request
                -   **res** (ServerResponse) : server response
                -   **prev** : preview data return by below backware



---

> ### enableService ( module ) : void

Register main handle (logic of routers)

### **params :**

-   **module** ( object {**name** : **module**} ) : The set of functions is encapsulated to handle specific functions. Which will become the router
    -   name ( **string** ) : name o module
    -   module ( **HyronClass** ) : a packet of functions and it config

---

> ### startServer ( callback ) : void

Start this instance for listen client request

### **params :**

-   **callback** ( function ) : event when server started

---

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

> ### args-loader

This plugin will load request info into "**this**" of router function in hyron class if necessary

**Supported request params**

-   $headers: eval "req.headers
-   $method: eval "req.method"
-   $httpVersion: eval "req.httpVersion"
-   $connection: eval "req.connection"
-   $socket: eval "req.socket"
-   $write: eval "req.write"
-   $close: eval "req.close"
-   $statusCode: eval "req.status"
-   $setTimeout: eval "req.setTimeout"
-   $statusMessage: eval "req.statusMessage"

```js
showHeader(){
return this.$requestHeaders;
}
```

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
