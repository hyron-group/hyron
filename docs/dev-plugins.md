Plugins are one of the core features that Hyron provides

It allows you to easily plug middleware to address specific issues

such as to process account authentication, encrypt information, restrict transmission, serve security situations, etc.

With hyron, you can do it extremely easily

With just a few simple steps, you can easily use a plugins for your application

## Content

This document will help you visualize how to build your own plugins

To do so, you need to follow some of the guidelines and suggestions below

## Preparation

In general, to build a plugins is relatively easy. You need to equip yourself with the following knowledge

-   Basic knowledge about javascript
-   Understand the business logic that you need to handle
-   The rules that the document wants to convey

## Basic concepts

**1. Hyron supports 2 types of plugins : Fontware and Backware**

-   **Fontware** : is a plugins run before [main handle]() (contain logic function) to handing input data
-   **Backware** : is a plugins run after [main handle]() to handling output data

**2. A plugin will receive 3 parameters as input :**

-   req ( IncomingMessage ) : a object by node http, to describe client request
-   res ( ServerResponse ) : a object by node http, to describe server response
-   prev (any) : a response data return by before plugins or main handle. It can be used to become input of after plugins

**3. A plugin also used 'this' like shared-parameter :**

-   Plugins use this param to communicate with each other, or provide functionality to the main handle
-   Functions or variables loaded in this scope should begin with the $character. example : this.$stringer
-   hyron supports some default variables, which gives you more customization, such as :
    -   \$eventName ( string ) : The name of the listener that was registered for an event handler
    -   \$executer ( function ) : is main handle function can be used to analyze and develop features related to this function

**4. Plugins can be declared and customized easily :**

-   All plugins should be declared in [hyron.prototype.enableFontware]() or [hyron.prototype.enableBackware]()
-   Plugins can be run automatically on each main handle by enabling the 'global' property when declared
-   Plugins that have been declared can be specified by running or not, by declarations in each service
-   Note the order of the declaration. With **Fontware**, whichever function is **declared in advance will run first**. Conversely, with **Backware**, any **predefined function will be run after**

**5. Some packages may not need to be declared :**

-   If you are in the trusted development organization of hyron. Some installed packages will automatically run without requiring a declaration
-   Hyron's trusted organization aims to limit the number of users that are involved, thereby increasing the trustworthiness of the plugins, avoiding malicious code that can affect users.
-   Packages developed by the hyron organization will have the **@hyron/plugin_name** prefix. and loaded automatically during runtime
-   Developers for these packages can configure these plugins to run the parts with appcfg.ini

**6. hyron's life cycle is sequential**

<!-- life cycle diagram -->

## Recommendations

-   You should name plugins handle with format : name_fw.js if it is fontware, or name_bw.js if it is backware
-   Plugins should be identical to the declared name
-   The name of the plugins should be unique
-   Development plugins should also adhere to the principles of application design and development, to facilitate maintenance and expansion for later.

## Example

this is simple example fontware plugins to store data in memory for cache

plugin/cache/CacheStorage.js : declare a handler object

```js
var memory = {};

module.exports = {
    set: (key, val) => {
        memory[key] = val;
    },

    get: key => {
        return memory[key];
    }
};
```

plugin/cache/cache_fw.js : declare a fontware

```js
const CacheStorage = require("./CacheStorage");

module.exports = function(req, res, prev) {
    console.log("new request coming ...");
    this.$cache = CacheStorage;
    return prev;
};
```

declare plugins in app.js

```js
const hyron = require("hyron");

const instance = hyron.getInstance(4729);

// declare fontware by name. So, you can config to run it just by registered name
instance.enableFontware({
    cache: {
        handle: require("./plugin/cache/cache_fw.js"),
        global: true // turn on for all routers
    }
});

instance.enableService({
    // declare your service in here
});

instance.startServer();
```

appcfg.ini : config runner ( if you in Hyron Organization )

```ini
[fontware]
cache="./cache_fw.js"

```

custom running plugins in requestConfig() function

```js
static requestConfig(){
    return {
        method_1 : "get",
        method_2 : {
            method : "post",
            fontware : [
                "!cache" // used '!' before plugins name to turn off plugins.
                "another_fontware" // or just name of plugin to turn it on
            ]
        }
    }

    // handle function
}
```

### Result

Now, you can access a fontware plugins from main handler thought this scope with :

```js
// Used to get a var from memory by name
this.$cache.get("key");

// Used to set a var into memory by name
this.$cache.set("key", "val");
```

## Note

-   Using multiple plugins can affect application performance. Therefore, only use plugins if you use it
-   With plugins that use this parameter, you can only use it with routes via hyyon. if outside this scope (such as calling it from a function, or from another class). You can use them with the **Function.apply(this, args)** method that javascript supports
-   You need to keep in mind the order in which the plugins are declared, as some plugins will probably depend on other plugins. Please check the documentation of the plugins, to avoid problems
-   The plugins are relatively flexible, and can handle most situations. However, there will be some exceptions. Please contact hyron's development organization for advice and assistance. We will try to respond as soon as possible
-   a middleware needs to be a function (declaare with function (req, res, prev){...} )
