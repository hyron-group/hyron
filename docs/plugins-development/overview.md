Plugins are one of the core features that Hyron provides

It allows you to easily plug middleware to address specific issues,
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

## What is a hyron plugins ?

- Are functions packed to handle specific functions related to input and output

## Why we used plugins ?

- This simplifies the coding process
- Easy to share, reuse for different projects
- Easy maintenance, upgrades

## Basic concepts

**1. Hyron supports 2 types of plugins : Fontware and Backware**

-   **Fontware** : is a plugins run before [main handle]() (contain logic function) to handing input data
-   **Backware** : is a plugins run after [main handle]() to handling output data
-   A plugin can be used and distribution by packaged in a package just with few config

**2. A plugin handle will receive 4 parameters as input :**

-   **req** ( IncomingMessage ) : a object by node http, to describe client request
-   **res** ( ServerResponse ) : a object by node http, to describe server response
-   **prev** ( any ) : a response data return by before plugins or main handle. It can be used to become input of after plugins
-   **config** ( object ) : config of this plugins, declared in appcfg.ini file

**3. A plugin also used 'this' like shared-parameter :**

-   Plugins use this param to communicate with each other, or provide functionality to the main handle
-   Functions or variables loaded in this scope should begin with the '\$' (dollar) character. example : this.\$stringer
-   hyron supports some default variables, which gives you more customization, such as :
    -   \$eventName ( string ) : The name of the listener that was registered for an event handler
    -   \$executer ( function ) : is main handle function can be used to analyze and develop features related to this function

**4. Plugins can be declared and customized easily :**

-   All plugins should be declared in [hyron.prototype.enablePlugins]()
-   Plugins can be run automatically on each main handle by enabling the 'global' property when declared
-   Plugins that have been declared can be specified by running or not, by declarations in each service.
-   Plugins **handle is a function**. lambda function is wrong
-   Note the order of the declaration. With **Fontware**, whichever function is **declared in advance will run first**. Conversely, with **Backware**, any **predefined function will be run after**

**5. Some packages may not need to be declared :**

-   If you are in the trusted development organization of hyron. Some installed packages will automatically run without requiring a declaration
-   Hyron's trusted organization aims to limit the number of users that are involved, thereby increasing the trustworthiness of the plugins, avoiding malicious code that can affect users.
-   Packages developed by the hyron organization will have the **@hyron/plugin_name** prefix. and loaded automatically during runtime
-   Developers for these packages can configure these plugins to run the parts with appcfg.ini

Example : [example plugins](./example.md)

---

Next step : [How to build a plugins ?](./build-plugins.md)