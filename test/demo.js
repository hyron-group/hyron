module.exports = class Demo {
    static requestConfig() {
        return {
            $all: {
                method: 'get',
                fontware: ['!args-loader']
            },
            "": "all",
            showMyName: ["get", "post"],
            upload: "post",
            sample: "patch",
            showURL: {
                method: ["get", "head"],
                enableREST: true
            },
            showArgs: {
                method: "get",
                enableREST: true
            },
            view: {
                method: ["get", "head"],
                enableREST: true
            }
        };
    }

    ""() {
        return "hello world";
    }

    async showMyName(name, pass) {
        return "Nice to meet you, " + name+pass;
    }

    showArgs(args = {
        pm: ["world"]
    }, key1) {
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
    upload(id, $body, to) {
        console.log(JSON.parse($body));
        console.log(typeof $body);
        return arguments;
    }

    sample() {
        return "hello world";
    }
};