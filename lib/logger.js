module.exports = {
    info: function(){
        console.log.apply(console, Array.prototype.slice.call(arguments))
    },
    error: function(){
        console.error.apply(console, Array.prototype.slice.call(arguments))
    },
    warn: function(){
        console.warn.apply(console, Array.prototype.slice.call(arguments))
    }
}