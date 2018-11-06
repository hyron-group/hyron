class a {
    static requestConfig(){
        return {
            b:'get'
        }
    }

    c(){
        return 'c'
    }
}

class d {
    static requestConfig(){
        return {
            e:'post'
        }
    }
    f(){
        return 'f'
    }
}

var route = require('../type/Route');

var finalClass = route.merge(a, d);

console.log(new finalClass().f())
