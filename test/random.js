function a(v, c, b) {
    console.log(this.r);
    console.log(this.y);
    console.log(arguments);
}

a = a.bind({r:10}, '32a', false)

a.apply({y:32}, ['re']);