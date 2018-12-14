[ experiment ]

Addons is a very simple and powerful feature. It allows you to customize and extend the hyron framework. By allowing access to resources that are managed from the ModuleManager class ( base of hyron ) via this scope

## Declaration syntax

The simple addons are a function that is loaded into this variable from an initialized instance

```js
function myAddons(){
    // show baseURI
    console.log(this.baseURI)
}
```

through this variable, you can optionally load what you want by using the following ways :

```js
// way 1 : used object.assign for multi value
Object.assign(this, args) // merge this var with args

// way 2 : used load var for single value
this.var_name = val'
```

You can also use the above method to override the default method. However, that is not recommended. If it's a bundle of hyrons, we'd love to be able to contribute an edit from you.

To develop addons effectively, in addition to the documentation we have developed, you can study the hyron code to get a better view of the framework.

## **Here are some files that you need to keep in mind :**
> ## ./core/moduleManager.js
This is the main running file of the program. It is used to manage instances, plugins, addons, services, and store configurations in the application

> ## ./core/routerFactory.js
This class is used to initialize and run plugins and services. For convenience, it is separated into subclasses
- **./core/eventWrapper.js** : This object is used to wrap the event router, which specifies how the route is executed
- **./core/configParser.js** : This object is used to load configurations and standardize them for the router

> ## ./core/middleware.js
This class is used for storing and managing, executing plugins

> ## ./lib
It contains libraries for secondary purposes, which can be reused by other components in the framework

> ## ./plugins
Contains the default plugins of hyron. You can also rely on it to build your plugins

> ## ./addons
Contains the default addons of the framework. Currently it has no content. Hope your addons can become part of that? ;)