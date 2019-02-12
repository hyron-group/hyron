import { IncomingMessage, ServerResponse, Server } from "http";
import { AsyncFunc } from "mocha";

declare enum SupportedMethod {
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

/**
 * path to a resource from root
 */
type Path = string;

/**
 * contains processing functions that extend the functionality of the hyron, by allowing access and editing to the resources that the Hyron manages.
 */
type AddonsMeta = (config: object) => void;

/**
 * end checkout of this middle, switch to the smallest optimal version
 */
type onCompleteCheckout = () => void;
interface Middleware {
    /**
     * This function will be called each time request has make
     */
    handle: (
        /**
         * corresponding to the http IncomingMessage
         */
        req: IncomingMessage,
        /**
         * corresponding to the http ServerResponse
         */
        res: ServerResponse,
        /**
         * Value returned by previous plugins. or the mainHandler result if it is the first backware
         */
        prev: any
    ) => any;
    /**
     * Called for the first time request of current instance. Used to init value or do something
     */
    onCreate: (config: object) => void | Promise<void>;
    /**
     * Used to detect changes. If result is true, then onCreate will be recalled
     */
    checkout: (done: onCompleteCheckout) => boolean | Promise<boolean>;
    /**
     * Which filter to use for the prev data type will be handled by this middleware. If not in the list, this middleware will be ignored
     */
    typeFilter: Array<any>;
}
interface PluginsMeta {
    /**
     * Mark that middleware is called before mainHandler called when request has make
     */
    fontware: Middleware;
    /**
     * Mark that middleware is called after mainHandler called when request has make
     */
    backware: Middleware;
}

/**
 * Is the main function defined in the HyronService, which contains the main processing logic for a router
 */
type mainHandler = (...args) => any;

/**
 * Used to describe information about routers that will be registered processed by hyron
 */
interface RouterMeta {
    /**
     * Indicates which method this router will listen to
     */
    method: SupportedMethod | Array<SupportedMethod>;
    /**
     * Use to enable middleware or turn off global middleware if you add "!" at the beginning
     */
    fontware: Array<string | Function>;
    /**
     * Use to enable middleware or turn off global middleware if you add "!" at the beginning
     */
    backware: Array<string | Function>;
    /**
     * Use to enable plugins or turn off global plugins if you add "!" at the beginning
     */
    plugins: Array<string>;
    /**
     * Used to register mainHandler for this router. This method has a higher priority than the same name method in this service
     */
    handle: mainHandler;
    /**
     * Use to customize the path for this router. If this method has not been defined. This method should be limited to ensure the rigor of the application
     */
    path: string;
    /**
     * Use to customize the path for this router. If this method has not been defined. This method should be limited to ensure the rigor of the application. a dynamic path is defined by the syntax /:param_name/
     */
    params: string;
}
interface RequestConfig {
    [methodName: string]: string | RouterMeta;
}
interface HyronService {
    /**
     * Used to indicate which routers will be listening for this service, and configure the information for them
     */
    static requestConfig(): RequestConfig;
    /**
     * Used to initialize an instance, providing an interactive interface for other plugins. It is used as a regular javascript class
     */
    constructor(...args): any;
    /**
     * MainHandlers can be listened on the same name router declared in the requestConfig, or interactive interface for other services
     */
    [methodName: string]: mainHandler;
}

/**
 * The service is loosely managed by the hyron, since it is not yet complete. Therefore, features like addons, or plugins do not work on this service
 */
type unofficialService = (app: Server, config: object) => void;

type onServerStarted = () => void;



declare class ModuleManager {
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
     * - **port** (number) : a free port. if port is 0, server will listen on random available port. default is "3000"
     * - **host** (string - option) : host name or ip address of current machine. Default is "localhost"
     * - **prefix** (string - option) : a path to separate your routers, used to group routers into an instance. Default is empty
     * - **protocol** (string - option) : a protocol for this instance. default is "http"
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
     * Retrieve config value for a key by name
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
    enableAddons(addonsList: { [name: string]: AddonsMeta }): void;

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
    enablePlugins(pluginsList: { [name: string]: PluginsMeta }): void;

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