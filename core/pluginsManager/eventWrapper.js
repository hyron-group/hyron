const parseTypeFilter = require("../../lib/typeFilter");

var createdList = {};

function eventWrapper(name, index, handlerHolder, config, pluginsMeta) {
    var {
        handle,
        onCreate,
        checkout,
        typeFilter
    } = pluginsMeta;

    var matchType = parseTypeFilter(typeFilter);

    function onCompleteCheckout() {
        handlerHolder[index] = finalFunction;
    }

    var finalFunction;

    if (handle == null) {
        finalFunction = function (req, res, prev) {
            return prev;
        }
    } else
        finalFunction =
        function (req, res, prev) {
            return handle.call(this, req, res, prev, config);
        }

    if (matchType != null) {
        finalFunction =
            function (req, res, prev) {
                if (!matchType(prev)) return prev;
                return handle.call(this, req, res, prev, config);
            }
    }

    if (checkout == null) checkout = function () {
        onCompleteCheckout();
        return false;
    }

    function idleFunction(req, res, prev) {
        var isChange = checkout.call(this, onCompleteCheckout);
        if (isChange) onCreate.call(this, config);
        else onCompleteCheckout();
        return handle.call(this, req, res, prev, config);
    };

    if (onCreate != null) {
        return function initFunction(req, res, prev) {
            if(createdList[name]!=null){
                onCreate.call(this, config);
                createdList[name]=true;
            }
            var result = handle.call(this, req, res, prev, config);
            if (checkout != null)
                handlerHolder[index] = idleFunction;
            else
                onCompleteCheckout()

            return result;
        }
    }
    return idleFunction;
}

module.exports = eventWrapper;