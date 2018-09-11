function getQueryData(type, params) {
    var result = "";
    params = JSON.parse(params);
    
    console.log(type);
    if (type == "query") {
        Object.keys(params).forEach(key => {
            console.log(key);

            var value = params[key];
            if(value!=null){
                var type = value.type;
                if(type!=null)paramType = type;
            }


            result += `&<div class='query'>
                <div class='key'>
                    ${key}
                </div>
                =
                <div class='value'>
                    [value]
                </div>
                
            </div>`;
        });
        result='?'+result.substr(1);
    }

    return result;
}

function queryEditor(type, params){
    var result="";
    params = JSON.parse(params);
    
    if (type == "query") {
        Object.keys(params).forEach(key => {
            var acceptedType="any";
            var inputType = "text";

            var value = params[key];
            if(value!=null){
                var type = value.type;
                if(type!=null)acceptedType = type;
            }


            result += `<div class='editor-field'>
                <div class='key'>
                    ${key} : 
                </div>
                <div class='value'>
                    <input type='${inputType}' placeholder='${acceptedType}'/>
                </div>
                
            </div>`;
        });
    }
    return result;
}