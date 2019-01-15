var sto = `
success Saved lockfile.
success Saved 5 new dependencies.
info Direct dependencies
└─ hyron-cli@1.4.0
info All dependencies
├─ envinfo@6.0.1
├─ fs-extra@7.0.1
├─ hyron-cli@1.4.0
├─ jsonfile@4.0.0
└─ universalify@0.1.2
`;

var reg = /Direct dependencies[\s]*└─[\s]*(([\w\d@\-_]+)@)/;

console.log(reg.exec(sto)[2])