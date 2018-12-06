var a = class {
    constructor(){
        this.b = "c"
    }

    t(){
        delete this.b;
        return this;
    }
}
