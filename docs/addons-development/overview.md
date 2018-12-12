This feature is used when you want to load / load the necessary resources, used to write hyron ecosystem features, such as debug tools, document tools, analysis tools, etc.


## What is addons ?

Addons is a special feature, that allows you to customize the framework at a higher level. By allowing access to all the resources the user has declared

## Why to use addons ?

If you want to handle something at runtime, or you want your app more powerful with some of insane feature. Addons is perfect choice to do that

## Basic concepts

**1. Addons can access and add resource / feature into hyron**

- You can add / edit function or var of ModuleManager at runtime
- You can access into **'this' scope**

**2. A Addons is a function**

- Make a addons very simple. it just is a function with this scope from an instance

**3. Addons loaded on runtime**

- After declared, with *enableAddons()*, it will be execute
- You can custom runtime of addons by add listener to 'this.app', when listener registered

---

Next step : [write a addons]()
