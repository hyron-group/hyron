const compare = require('performance-tools');

compare.comparator({
    v1 : ()=>{
        return Math.round("3.43");
    },
    v2 : ()=>{
        return Math.floor("3.63");
    }
})