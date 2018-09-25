function a() {
    console.log(this.v);
    console.log(this.c);
}

// a = a.bind({ v: 10 });


a()
a.apply({ v: 12 });
