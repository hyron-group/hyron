import { ClientRequest, ServerResponse, Server } from "http";

type Path = string;

type AddonsHandler = (config: object) => void;

type onCompleteCheckout = () => void;
interface Middleware {
    handle: (
        req: ClientRequest,
        res: ServerResponse,
        prev: any,
        config: object
    ) => any;
    onCreate: (config: object) => any;
    checkout: (done: onCompleteCheckout) => boolean;
    typeFilter: Array<any>;
}
interface Plugins {
    fontware: Middleware;
    backware: Middleware;
}

enum SupportedMethod {
    // query type
    GET,
    HEAD,
    DELETE,
    // body type
    POST,
    PUT,
    PATCH,
    // server type
    PRIVATE,
    ALL
}

type mainExecuter = (...args) => any;
interface RouterMeta {
    method: SupportedMethod | Array<SupportedMethod>;
    fontware: Array<string>;
    backware: Array<string>;
    plugins: Array<string>;
    handle: mainExecuter;
    path: string;
    params: string;
}
interface RequestConfig {
    [methodName: string]: string | RouterMeta;
}
class HyronService {
    static requestConfig(): RequestConfig;
    constructor(...args);
    [methodName: string]: mainExecuter;
}

type unofficialService = (config: object) => void;

type onServerStarted = () => void;

class ModuleManager {
    /**
     * Used to create servers with json file
     * If module is missing, hyron will auto install it
     *
     * ### params
     * - **path** (string) : linked to build file from the root
     */
    static build(path: string): void;

    /**
     * used to create a new instance, that can be used to create difference server. default server will listen on http://localhost:3000
     */
    static getInstance(): ModuleManager;

    /**
     * Create a new instance with specified url. Hyron will parse params from it include : protocol, host, port, prefix
     *
     * ### params
     * - **baseURL** (string) : specified url. example : https://localhost:1234
     */
    static getInstance(baseURL: string): ModuleManager;

    /**
     * Create a new instance from specified port and current machine host
     *
     * ### params
     * - **port** (number) : a free port. if port is 0, server will listen on random available port
     */
    static getInstance(port: number): ModuleManager;

    /**
     * Create a new instance with specified params
     *
     * ### params
     * - **port** (number) : a free port. if port is 0, server will listen on random available port. default is '3000'
     * - **host** (string - option) : host name or ip address of current machine. Default is 'localhost'
     * - **prefix** (string - option) : a path to separate your routers, used to group routers into an instance. Default is empty
     * - **protocol** (string - option) : a protocol for this instance. default is 'http'
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
     * - **serverConfig** : object contain server config. include : protocol, host, port, prefix
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
     * **return** (Array<ModuleManager>) : return a set of instance that has been initialized
     */
    static getInstanceContainer(): Array<ModuleManager>;

    /**
     * Set config for this instance. That can be used by modules like addons, plugins or services
     *
     * In addition to this way, config can also be loaded by adding appcfg.yaml file in root dir or inside modules
     *
     * ### params
     * - **config** (object) : a description object contain config for this instance modules
     *
     * ### note
     * - appcfg from root and Hyron itself will auto loaded on startup
     */
    setting(config: object): void;

    /**
     * Retrieve config by name.
     *
     * ### params
     * - **name** (string) : name of config
     *
     * **return** (any) : config value or null if config not found
     */
    static getConfig(name: string): any;

    /**
     * Enable addons by descriptions contain linked to addons module from root
     *
     * ### params
     * - **addonsList** (object) : object description about module name (string) and path (string)
     */
    enableAddons(addonsList: { [name: string]: Path }): void;

    /**
     * Enable addons by descriptions contain addons handler
     *
     * ### params
     * - **addonsList** (object) : object description about module name (string) and handler (function)
     */
    enableAddons(addonsList: { [name: string]: AddonsHandler }): void;

    /**
     * Enable plugins by descriptions contain linked to plugins module from root
     *
     * ### params
     * - **pluginsList** (object) : object description about module name (string) and path (string)
     */
    enablePlugins(pluginsList: { [name: string]: Path }): void;

    /**
     * Enable addons by descriptions contain plugins metadata
     *
     * ### params
     * - **pluginsList** (object) : object description about module name (string) and plugins metadata (object)
     */
    enablePlugins(pluginsList: { [name: string]: Plugins }): void;

    /**
     * Enable services by descriptions contain linked to service module from root
     *
     * ### params
     * - **servicesList** (object) : object description about module name (string) and path (string)
     */
    enableServices(servicesList: { [name: string]: Path }): void;

    /**
     * Enable services by descriptions contain service metadata
     *
     * ### params
     * - **servicesList** (object) : object description about module name (string) and service metadata (object)
     */
    enableServices(servicesList: { [name: string]: HyronService }): void;


    /**
     * Create server for this instance. This function called on instance have been initialized
     *
     * ### params
     * - **server** (Server) : from net.server
     */
    initServer(server: Server): void;

    
    /**
     * Edit a server from another instance by host and port as key
     *
     * ### params
     * - **host** (string) : server host
     * - **port** (string) : server port
     * - **server** (string) : fom net.server
     */
    static setServer(host: string, port: number, server: Server): void;

    
    /**
     * Start server on specialized information from instance
     *
     * ### params
     * - **callback** (function) : a function that called when server started
     */
    startServer(callback: onServerStarted): void;
}

export = ModuleManager;
