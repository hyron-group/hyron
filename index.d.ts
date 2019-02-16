/**
 * Used to management resource and run your application
 */
declare class ModuleManager {

    /**
     * Used to create a instance that not managed by Hyron. Used getInstance instend it
     * 
     * ### params
     * - serverConfig( object ) : object contain server config. include : protocol, host, port, prefix
     */
    constructor(serverConfig) : ModuleManager;

    /**
     * Used to create servers with [json build file](https://hyron.gitbook.io/reference/buildin-features/apploader.core)
     * If module is missing, hyron will auto install it
     *
     * ### params
     * - **path** ( string ) : linked to a json build file from the root
     *
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#function-build
     */
    static build(path: string): void;

    /**
     * used to create a new instance, that can be used to create difference server. default server will listen on http://localhost:3000
     *
     *  ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstance-modulemanager
     */
    static getInstance(): ModuleManager;

    /**
     * Create a new instance with specified url. Hyron will parse params from it include : protocol, host, port, prefix
     *
     * ### params
     * - **baseURL** (string) : specified url. example : https://localhost:3000
     * ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstance-baseurl-string-modulemanager
     */
    static getInstance(baseURL: string): ModuleManager;

    /**
     * Create a new instance with specified port
     *
     * ### params
     * - **port** ( number ) : a free port. if port is 0, server will listen on random available port. default is 3000
     * 
     * ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstance-port-host-prefix-protocol-modulemanager
     */
    static getInstance(
        port: number,
        host?: string,
        prefix?: string,
        protocol?: string
    ): ModuleManager;


    /**
     * Create a new instance with specified params
     *
     * ### params
     * - **port** ( number ) : a free port. if port is 0, server will listen on random available port. default is 3000
     * - **host** ( string - option ) : host name or ip address of current machine. Default is 'localhost'
     * - **prefix** ( string - option ) : a path to separate your routers, used to group routers into an instance. Default is empty
     * - **protocol** ( string - option ) : a protocol for this instance. default is 'http'
     * ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstance-port-host-prefix-protocol-modulemanager
     */
    static getInstance(
        port: number,
        host?: string,
        prefix?: string,
        protocol?: string
    ): ModuleManager;

    /**
     * Create a new instance from a description object
     * ### params
     * - **serverConfig** ( object ) : object contain server config. include : protocol, host, port, prefix
     *
     * ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstance-serverconfig-modulemanager
     */
    static getInstance(serverConfig: {
        protocol: string;
        host: string;
        port: number;
        prefix: string;
    }): ModuleManager;

    /**
     * Retrieve a container contain all instances that has been initialized
     *
     * ### return
     * -  ( Array<[ModuleManager](https://hyron.gitbook.io/reference/api-reference/modulemanager#class-modulemanager)> ) : return a set of instance that has been initialized
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getinstancecontainer-array-less-than-modulemanager-greater-than
     */
    static getInstanceContainer(): Array<ModuleManager>;

    /**
     * Set config for this instance. That can be used by modules like addons, plugins or services
     *
     * In addition to this way, config can also be loaded by adding [appcfg.yaml](https://hyron.gitbook.io/reference/appcfg-file) file in root dir or inside modules
     *
     * ### params
     * - **config** ( object ) : a description object contain config for this instance modules
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#setting-config-void
     */
    setting(config: object): void;

    /**
     * Retrieve config value for a key by name
     *
     * ### params
     * - **name** ( string ) : name of config, represent by parent.child
     * - **defaultValue** ( any ) : default value if not found config data
     *
     * ### return
     * - ( any ) : config value or null if config not found
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-getconfig-name-defaultvalue-any
     */
    static getConfig(name: string, defaultValue: any): any;

    /**
     * Enable addons by descriptions contain linked to addons module from root
     *
     * ### params
     * - **addonsList** ( object < name, path > ) : object description about modules contain name and path from root
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableaddons-addonspaths-void
     */
    enableAddons(addonsList: { [name: string]: Path }): void;

    /**
     * Enable addons by descriptions contain addons handler
     *
     * ### params
     * - **addonsList** (object < name, [AddonsMeta](https://hyron.gitbook.io/reference/api-reference/addonsmeta) > ) : object description about module name and AddonsMeta
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableaddons-addonslist-void
     */
    enableAddons(addonsList: { [name: string]: AddonsMeta }): void;

    /**
     * Enable global addons that run for all instance by descriptions contain addons handler
     *
     * ### params
     * - **addonsList** ( object < name, path > ) : object description about module name and path from root
     */
    enableGlobalAddons(addonsList: { [name: string]: Path }): void;

    /**
     * Enable global addons that run for all instance by descriptions contain addons handler
     *
     * ### params
     * - **addonsList** (object < name, [AddonsMeta](https://hyron.gitbook.io/reference/api-reference/addonsmeta) > ) : object description about module name and AddonsMeta
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableglobaladdons-addonslist-void
     */
    enableGlobalAddons(addonsList: { [name: string]: AddonsMeta }): void;

    /**
     * Enable plugins by descriptions contain linked to plugins module from root
     *
     * ### params
     * - **pluginsList** ( object < name, path > ) : object description about module name and path from root
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableplugins-pluginspaths-void
     */
    enablePlugins(pluginsList: { [name: string]: Path }): void;

    /**
     * Enable addons by descriptions contain plugins metadata
     *
     * ### params
     * - **pluginsList** ( object < name, [PluginsMeta](https://hyron.gitbook.io/reference/api-reference/pluginsmeta) > ) : object description about module name and plugins metadata (object)
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableplugins-pluginslist-void
     */
    enablePlugins(pluginsList: { [name: string]: PluginsMeta }): void;

    /**
     * Enable services by descriptions contain linked to service module from root
     *
     * ### params
     * - **servicesList** (object < name, path > ) : object description about module name and path from root
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableservices-servicepaths-void
     */
    enableServices(servicesList: { [name: string]: Path }): void;

    /**
     * Enable services by descriptions contain service metadata
     *
     * ### params
     * - **servicesList** ( object < name, [HyronService](https://hyron.gitbook.io/reference/api-reference/hyronservice) | [UnnofficialService](https://hyron.gitbook.io/reference/api-reference/unofficialservice) > ) : object description about module name (string) and service metadata
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#enableservices-servicelist-void
     */
    enableServices(servicesList: { [name: string]: HyronService | UnofficalService }): void;

    /**
     * Create server for this instance. This function called on instance have been initialized
     *
     * ### params
     * - **server** ( [Server](https://nodejs.org/api/http.html#http_class_http_server) ) : from net.server
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#initserver-server-void
     */
    initServer(server: Server): void;

    /**
     * Edit a server from another instance by host and port as key
     *
     * ### params
     * - **host** ( string ) : server host
     * - **port** ( number ) : server port
     * - **server** ( [Server](https://nodejs.org/api/http.html#http_class_http_server) ) : fom net.server
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#static-setserver-host-port-server-void
     */
    static setServer(host: string, port: number, server: Server): void;

    /**
     * Start server on specialized information from instance
     *
     * ### params
     * - **callback** ( function ) : a function that called when server started
     * 
     * @see https://hyron.gitbook.io/reference/api-reference/modulemanager#startserver-callback-void
     */
    startServer(callback: onServerStarted): void;

}

export = ModuleManager;
