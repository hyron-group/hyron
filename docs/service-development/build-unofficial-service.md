If your service is not the same as the normal services that hyron supports, use the http protocol

For example, you need to work with sockets for realtime applications, manipulate them through other protocols, or use third-party source code.
Or simply create a cron task that allows for scheduled events.

You can still work with them with hyron.
By default, hyron supports a way that allows you to do that.

By wrapping the methods in a function

```js
function (app, config){
    // app : is node 'http' instance
    // config : is config of this instance, and this service
}
```

You can also develop your own addons, which will allow you to extend the functionality of the hyron.
With the syntax extremely easy, you will not take long to develop it

You can see more at : [how to build a Addons ?](./addons-development/overview.md)

Since hyron has only recently been developed, there are still many shortcomings. I hope you can join the development cooperation and complete the project hyron become more complete