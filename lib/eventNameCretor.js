const codeStyle = require('./codeStyle');

function prepareEventName(
    isREST,
    methodType,
    prefix,
    moduleName,
    methodName,
    customPath,
    config
) {
    var styleConfig = config.style;
    if (customPath == null) {
        return buildRouteName(
            styleConfig,
            isREST,
            methodType + '/',
            prefix,
            moduleName,
            methodName
        );
    } else {
        return buildRouteName(config.style, isREST, methodType + '/', customPath);
    }
}

function buildRouteName(style, isREST, methodType, ...childRoute) {
    var uri = "";
    if (isREST) uri = "REST-";
    uri += methodType;
    var styledUri = "";
    childRoute.forEach(routeName => {
        if (routeName != null && routeName != '') styledUri += routeName + "/";
    });
    if(style!=null) {
        var beforeName = styledUri;
        styledUri = codeStyle(style, styledUri);
        if(styledUri==null) styledUri = beforeName;
    }
    uri+=styledUri;
    uri = uri.substr(0, uri.length - 1);
    var styledUri;
    return uri;
}

module.exports = prepareEventName;