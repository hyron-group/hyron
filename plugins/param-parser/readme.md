## Introduction
param-parser is one of default fontware plugins. Used to parser input data into main executer arguments

It support for two type of client request data :

-   GET, HEAD, DELETE : as query type.
-   POST, PUT, PATCH : as body type

It also include feature help you validate input easier with comment :

```js
// @param field {condition}
```

**Supported condition :**

-   type ( string ) : check if field match with type declared.
-   mime ( string ) : check if upload is type of mime, if type is ClientFile 
-   size ( number ) : check if field size small than or equal size
-   gt (number) : check if field greater than gt
-   gte (number) : check if field greater than or equal gte
-   lt (number) : check if field small than lt
-   lte (number) : check if field small than or equal lte
-   reg (number) : check if field match input with regex
-   in (array<?>) : check if field inside array of value
-   non (array<?>) : check if field not inside array of value

### **note :**

with query type. it also support for array or object type.

**Example** : ?key1=[val1,val2]&key2={skey1:val1,skey2:val2}
