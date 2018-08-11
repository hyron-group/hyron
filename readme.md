![logo](https://i.imgur.com/mAjPWAu.png)

# Introduction

### **Hyron** is powerful framework help you write your app in OOP model, easy to test, scale up, with many interesting features

## Main feature

- Create router with normal javascript function
- Write JS code in OOP
- Easy to implement and used
- Easy to management code
- Easy to test and deploy
- Easy to scale up
- Auto export log file when has incident
- Support dynamic JWT token
- Easy to management fontware and backware
- Can support for Micro-service structure (future)

# Outline

1.  [Release note](#release-note-126-beta) : Release note of new version
2.  [Getting started](#getting-started) : Quick start with **Hyron** framework
3.  [Example](#example) : A simple sample about how to used in a project
4.  [Document](#documents) : Detail about each function
5.  [Information](#information) : Other info

# Release note 1.2.6 (Beta)

- Fix bug request param parser
- Fix bug fontware and backware

[[top](#outline)]

# Getting started

**hyron** can make a js **function become a http route**r like 

```js
const hyron = require("hyron");

class GettingStarted {
  static requestConfig() {
    return {
      demo: "get"
    };
  }

  demo(your_name) {
    return "hello " + your_name;
  }
}

var myApp = new hyron(3000);

myApp.enableModule({
  test : GettingStarted
})
```
### Result : a get router registered on http://localhost:3000/test/demo?your_name=[name]



## Why should we use Hyron ?

- Make your code more clear
- Packaged your code in module, increased reusability
- Don't require understanding of http handling
- Focus more to logic
- Have some interesting feature

## Usage
This is simple elements of a server app if you used hyron framework

### **Run script**
- Create server app by call hyon constructor for config server, like port or host, ...

- Registered modules contain routers by call enableModule

```js
const app = require("hyron");
var instance = new app();
instance.enableModule({
  // module_name : handle_class
});
```

### **Hyron class (ES6)**
- A hyron class like normal js class, but it contain requestConfig() method for setting router

```js
// it also support for ES5 function
class example {
  static requestConfig() {
    // turn on method as router in here
    return {
      foo: "get",
      bar: {
        method: "post",
        fontware: ["tracking", "!auth"]
      }
      /*
      param : {method_name : method_type}

      Supported method : 'get', 'post', 'put', 'head', 'delete', 'all' and Extended Object

      Extended object : {
        method : as Supported method abort,
        fontware : ['turn_on', '!turn_off']
      }

      Note
      - fontware is declared in run js file
      - If the method is not declared here, it will not be accessible by the client
      */
    };
  }

  foo(param) {
    // do something
    return bar;
  }

  bar(field_of_file) {
    /*
     Supported for buffer data, like image or file, ect

     Support 3 kind of return type :
      - primary type : boolean, number, array,object
      - Detail : {
          $type : http response type,
          $data : request body,
          $headers : object response headers
          ...
      }
      - Promise (or async)

    */
  }

  // other method
}
```

Good news ;) , You do not need to worry about **data types**, Hyron support to convert **any** kind of data type to js data type, and you can used this in your function

```js
// GET query from string to array
?userName=[phung,duc,thang]
=> ["phung", "duc", "thang"]

// GET query from string to object
?userInfo={fullName:Phung%Duc%Thang}
=> {fullName:"Phung Duc Thang"}
// it alse support nested like other js object

// Post body from file to Buffer
file1:demo_img.png

// GET query from string to boolean
?isMale=true
=> true

// GET query from string to number
?age=20
=> 20
```

### **Test case**

```js
new example().foo("hello world");
// you can easy write test case like this if used Hyron
```

### **Most used function**

- constructor : used to init app by use require('hyron')
- enableModule : used to enable routers
- enableFontWare : used to enable & control fontware

[[top](#outline)]

# Example

### index.js

```js
const myApp = require("hyron");

var instance = new myApp(3000, "localhost", { prefix: "firstApp" });

instance.enableFontWare({
  anti_ddos: {
    handle: require("./tracker/ddos.js"),
    global: true
  },
  auth: {
    handle: require("./account/auth.js"),
    global: true
  },
  notifyMe: require("./account/Notify.js").sendToMe
});

instance.enableModule({
  user: require("./src/users/UserManager.js")
});

enableBackWare.enableBackWare({
  zip: {
    handle: require("hyron/zip"),
    global: true
  }
});
```

### Notify.js

```js
// this is fontware function, it will be call before a router
module.export.sendToMe = (req, res) => {
  //do something
};
```

### UserManager.js

```js
const { UserInfo } = require("../database/mongo.js");

module.export = class {
  static requestConfig() {
    return {
      getUserInfo: "get",

      getProfile: {
        method: "get",
        fontware: [
          "!auth", // turn off a global fontware
          "notifyMe" // turn on fontware
        ],
        backware: [
          // declare like fontware
        ]
      }
    };
  }

  getUserInfo(uid) {
    return new Promise((resolve, reject) => {
      UserInfo.findById(uid)
        .then(data => {
          // do something
          resolve(data);
        })
        .catch(err => {
          reject({
            code: 404,
            message: "This user is not exist"
          });
        });
    });
  }
  getProfile() {
    //do something
  }
};
```

## Result

### API

```http
GET : http://localhost:3000/firstApp/account/getUserInfo?uid={value}
```

[[top](#outline)]

# Documents

## **hyron** : in require('hyron')

> ## **constructor** (port, host, config)

- **Description** : used to config app to run

- **Param**

  - **post** ( number ) : post of server to listen for this app. Default : _80_
  - **host** ( string ) : host name for this app. Default : _localhost_
  - **config** ( { _prefix_, _secret_ } )
    - **prefix** ( string ) : app router prefix for distinguish with other app if both of them used same port. Default : ""
    - **secret** ( string ) : secret key for encode jwt token. Default : random

- **Return** : ModuleManager (this)

> ## **enableModule** (moduleList)

- **Description** : add http listener for router described in _module_name_

- **Param**

- **moduleList** ({ module_name : module_handle }) : module enabled list

  - module_name ( string ) : name of module as parent router
  - module_handle ( function ) : handler class contain routers and their config

- **Return** : void

> ## **enableBackWare** (handleList)

- **Description** : add http listener for router described in _module_name_. **Backware will run after a router executed** to handle output

  To use backware in modules, please **declare** backware : [function_name] in **requestConfig** function, or turn on global mode in backware config

  **Note** : to disable a global backware function, **declare** with '!_global_function_name_'

- **Param**

  - **handleList** ({ name : option | handle }) : module enabled list
    - **name** ( string ) : name of module as parent router
    - **option** ( { _handle_, _global_ } )
      - **handle** ( function (result) ) : handler function to do something with router result
      - **global** (boolean) : true if this backware used for whole app

- **Return** : void

> ## **enableFontWare** (handleList)

- **Description** : used to set fontware for this app. **Fontware will run before router**

  To use fontware in modules, please **declare** fontware: [function_name] in **requestConfig** function or turn on global mode in fontware config

  **Note** : to disable a global fontware function, **declare** with '!_global_function_name_'

* **Param**
  - **handleList** ({ _name_ : option | handle }) :
    - **name** ( string ) : fontware name, this name will be used for config in other hyron class
    - **option** ( { _handle_, _global_ } )
      - **handle** ( function (...args) ) : handler function to handing argument input
      - **global** (boolean) : true if this fontware used for whole app
* **Return** : void

> ## **setting** ( config )

- **Description** : custom settings for run app

- **Param**
  - **config** ({ _name_ : option }) : supported properties below
    - **sensitive**: Enable case sensitivity. When enabled, "/Foo" and "/foo" are different routes. When disabled, "/Foo" and "/foo" are treated the same.
    - **env**: Environment mode. Be sure to set to "production" in a production environment, or "development" for developent by default
    - **etag**: Set the ETag response header, true if weak, or false if strong
    - **viewsDir**: home dir for view to render. default is root dir
    - **viewCache**: Enables view template compilation caching. Default is true
    - **viewEngine**: The default engine extension to use when omitted, like PUG or EJS
- **Return** : void

## **hyron class**

> ## **static requestConfig** ()

- **Description** : this is **IMPORTANT** method, to register http listener (Router) on function declared inside.

- **Return** : Object { _method_name_ : config }
  - **method_name** ( String ) : method name
  - **config** ( String | Object )
    - ( String ) : http method. Supported : [get, post, head, put, delete, all]
    - ( Object { method, fontware, backware } ) :
      - **method** ( String ) : http method, like abort
      - **fontware** ( Array ) : list of fontware name
      - **backware** ( Array ) : list of backware name

> ## **this.$token**

### **set** ( key, val )

- **Description** : used to update token data
- **Param**
  - **key** ( string ) : payload key
  - **val** ( string ) : payload value
- **Return** : void

### **get** ( key )

- **Description** : used to get decoded data by key
- **Param**
  - **key** ( string ) : payload key
- **Return** : string

### **getToken** ( config )

- **Description** : used to update token data
- **Param**
  - **config** ( object ) : [JWT sign(...) option](https://www.npmjs.com/package/jsonwebtoken#jwtsignpayload-secretorprivatekey-options-callback)
- **Return** : string

> ## **this.$cookies**

- **Description** : This property is an object that contains cookies sent by the request. If the request contains no cookies, it defaults to {}.

> ## **this.$headers**

- **Description** : return http header info from client.

> ## **this.$connection**

- **Description** : return client-server connection info.

> ## **this.$host**

- **Description** : Contains the hostname derived from the Host HTTP header.

> ## **this.$secure**

- **Description** : A Boolean property that is true if a TLS connection is established.

> ## **this.$ip**

- **Description** : Contains the remote IP address of the request.

> ## **this.$method**

- **Description** : Contains a string corresponding to the HTTP method of the request: GET, POST, PUT, and so on.

> ## **this.$url**

- **Description** : Retains the original request URL.

> ## **this.$protocol**

- **Description** : Contains the request protocol string: either http or (for TLS requests) https.

> ## **this.$subdomains**

- **Description** : An array of subdomains in the domain name of the request.

> ## **this.$xhr**

- **Description** : A Boolean property that is true if the request’s X-Requested-With header field is “XMLHttpRequest”, indicating that the request was issued by a client library such as jQuery.

## **Hyron method (function)**

**1. Argument**

- **Description** : Arguments of method in hyron class represent by req.query, req.body or req.file according to the situation. Example, if http method is get, argument will take from request.

  Args parsed from http request also automatically converted to the appropriate format.

  Supported formats :

  - String -> String
  - String json -> Object
  - String array -> Array
  - String boolean -> Boolean
  - String number -> Number
  - File -> Buffer

**2. Response**

- **Description** : Hyron supported 3 kind of response of method

  - Promise ( async )
  - Primary type (String, Number, Boolean, Object, Array, ...)
  - Custom response

- **Custom response**
  - $data ( **important** ) : hold response body data
  - $headers : contain object description http response header
  - $type : data type of $data
  - $redirect : make browser redirect to url $redirect
  - $render : make browser render UI from root with path is $render
  - $status : response status code

[[top](#outline)]

# Information

- npm package : [hyron](https://www.npmjs.com/package/hyron)
- github : [https://github.com/thangdjw/hyron.git](https://github.com/thangdjw/hyron.git)
- Report bug / Request new feature : [report form](https://goo.gl/forms/TQIxCXeefC1Uiw5l1)
- Help me with a cup of coffee : [Donate with PayPal](https://www.paypal.me/thangdjw)

[[top](#outline)]
