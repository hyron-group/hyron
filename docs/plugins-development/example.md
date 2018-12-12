
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

plugins/cache/cache_fw.js : declare a fontware

```js
const CacheStorage = require("./CacheStorage");

module.exports = {
    global: true,
    handle: function(req, res, prev) {
        console.log("new request coming ...");
        this.$cache = CacheStorage;
        return prev;
    }
};
```

plugins/cache/index.js

```js
module.exports = {
    fontware: require("./cache_fw")
};
```

declare plugins in app.js

```js
const hyron = require("hyron");

const instance = hyron.getInstance(4729);

// declare fontware by name. So, you can config to run it just by registered name
instance.enablePlugins({
    cache: require("./plugins/cache")
});

instance.enableService({
    // declare your service in here
});

instance.startServer();
```

custom running plugins in requestConfig() function

```js
static requestConfig(){
    return {
        method_1 : "get",
        method_2 : {
            method : "post",
            plugins : [
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
