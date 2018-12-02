module.exports = class Demo {
    static requestConfig() {
        return {
            $all: {
                method: 'get',
                fontware: ['!args-loader']
            },
            "/": "all",
            showMyName: ["get", "post"],
            upload: "post",
            sample: "patch",
            showURL: "get",
            showArgs: "get",
            view: {
                method: ["get", "head"],
                enableREST: true
            }
        };
    }

    "/"() {
        return "hello world";
    }

    async showMyName(name) {
        return "Nice to meet you, " + name;
    }

    showArgs(args = [{
        pm: ["world"]
    }], key1) {
        console.log(args);
        return JSON.stringify(arguments)
    }

    showURL() {
        var data = [
            require('../type/path').findURL(new Demo().upload),
            require('../type/path').findURL(this.upload),
            require('../type/path').findURL('upload'),

        ]
        return data;
    }

    view(path) {
        return {
            $render: {
                path,
                data: {
                    name: 'thang'
                }
            }
        };
    }
    upload(data, to) {
        // @param data {type:ClientFile, size:10MB}
        // @param to {nullable: false, type: string}
        return to;
    }

    sample() {
        return "hello world";
    }
};