class AbstractRouters {
    /**
     * @typedef {string|Array.<string>} methodType supported http request method type for this router.
     * Includes : get, post, head, put, delete, patch, all
     */

    /**
     * @typedef {object} CustomConfig
     * @property {methodType} method
     * @property {boolean} enableREST enable REST mode in this router
     * @property {Array.<string|function>} fontware list of fontware run before router. add '!' before name to turn of global fontware
     * @property {Array.<string|function>} backware list of backware run after router. add '!' before name to turn of global backware 
     * @property {Array.<string>} plugins list of plugins. add '!' before name to turn of global plugins.
     * @property {string} path custom path of router
     */

    /**
     * @description Contain config about routers
     * @returns {{methodName:String, config:methodType|CustomConfig}} 
     */
    static requestConfig() {}
}

AbstractRouters.req;

module.exports = AbstractRouters;
