module.exports = class Demo {
    static requestConfig() {
        return {
            $all: {
                method: 'get',
            },
            "": "all",
            testGetParams: "get",
            testPostParams: "post",
            testPlugins: ["get", "post", "get"],
            testRest: {
                method: "get",
                params: "/:var1"
            }
        };
    }

    ""() {
        return "hello world";
    }

    async testGetParams(name) {
        "Nice to meet you, " + name;
        return name != null;
    }

    testPostParams(arg1 = {
        pm: ["world"]
    }, arg2) {
        var jsonData = JSON.stringify(arg1);
        return jsonData != null && arg2 != null;
    }

    testPlugins() {
        return this.$stringer.get("txt_demo_string");
    }

    testRest(var1) {
        return var1;
    }

    testPath() {
        var data = [
            require('../../type/path').findURL(new Demo().upload),
            require('../../type/path').findURL(this.upload),
            require('../../type/path').findURL('upload'),
        ]
        console.log(this.upload)
        return data;
    }

    testUpload(id, $body, to) {
        console.log(JSON.parse($body));
        console.log(typeof $body);
        return arguments;
    }

};