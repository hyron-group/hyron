This topic will taling about how to build a plugins

<img src="https://imgur.com/Y3I7nIm.png"/>

## Table of contents

1. [Plugins structure](##1.-Plugins-structure)
2. [Functions and features](##2.-Functions-and-features)
3. [Recommendations](##3.-Recommendations)

## 1.Plugins structure

### **A plugins should be package to handle a certain business function**

Example, if you want to handle auth function, you may want to start with a plugins only handle events related to session management

This unique feature not only makes your code more powerful, it also allows you to easily manage your plugins.

### **A plugins need to declare to used**

A plugins like a black-box. Therefore, you need to declare that hyron can load and use the plugins

**With the plugins themselves**

```js
module.exports = {
    // a function will be execute before main handle
    fontware: {
        // handle function for this font-middleware
        handle: Function,
         // true if enable auto run per each service for this font-middleware
        global: Boolean,
        // a function called for first time plugins loaded
        onCreate: Function,
        // a check function to revoke onCreate if it return true
        checkout: Function,
        // list of type that font-middleware handle
        typeFilter: [String]
    },
    // (option) : a function will be execute after main handle
    backware: {...}
};
```

**With in hyron framework**

to used plugins in hyron, you should declare it in each instance with _enablePlugins()_ function

```js
var myapp = hyron.getInstance();

myapp.enablePlugins({
    plugin_name: require(plugin_path)
});
```

after declared, you can call it in your router by name

```js
static requestConfig(){
    return {
        method_name : {
            ... method config
            plugins : [plugin_name]
        }
    }
}
```

you also disable global plugins by add '!' character at begin of this plugins name ('!plugin_name')

## 2. Functions and features

**With the plugins themselves**

> ### handle ( req, res, prev, config ) : Function

This function called for each time route is called. If it is fontware, this function will be called before main handle, otherwise, it will call after main handle.

Note :

If it is a fontware, pre-defined plugins will run first. Otherwise, i it is a backware the following declaration will run later

**param:**

- **req** ( ClientRequest ) : request data by node http
- **res** ( ServerResponse ) : response data from server by node http
- **prev** ( Array<?> | any ) : preview data return by another plugins, or by main handle. If it is fontware, prev is param used as input of main handle. else, if it is backware, prev as out put of main handle
- **config** : config of this plugins, declared in appcfg.ini, with name same name with that plugin declared in *enablePlugins()* method

---

> ### onCreate ( config ) : Function
This function called on the first time the router is called. It should be used to initialize content for that router, like load needed file, load feature into this scope, compiler, etc.

After called, handle will change to idle mode if checksum() has set, or final mode if not (for better performance)

**param** :
- config : config of this router, declared in appcfg.ini file

---

> ### checksum (done) : Function
This function used to check if has any change for each request. If it return true, onCreate() of this plugins will be revoke.
If done() is called, handle will be switched to final mode. And don't revoke onCreate() anymore

**param** :
- done (function) : A function will be called without any further changes


## 3. Recommendations

-   You should name plugins handle with format : name_fw.js if it is fontware, or name_bw.js if it is backware
-   Plugins should be identical to the declared name
-   The name of the plugins should be unique
-   Development plugins should also adhere to the principles of application design and development, to facilitate maintenance and expansion for later.

---

Next step : [View example]()