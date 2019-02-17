import { ServerResponse, IncomingMessage } from "http";

/**
 * Middleware is a part of a Plugins, used to define logics for Plugins
 * 
 * ### note
 * It could be implement 'this scope' from current service in a sandbox and access to bellow attribute :
 * - this.$config ( any ) : is config of this service
 * - this.$requestConfig ( RouterMeta ) : is config of this router
 * - this.$eventName ( string ) : is event name of this router
 * - this.$mainExecuter ( function ) : is main-handler function that could be used to parse & analysis data
 * - this.$argsList ( Array< string > ) : provided by params-parser plugins to access to main-handler args name
 */
export interface Middleware {
    /**
     * This function used to call each time request have make
     * 
     * ### params
     * - req ( IncomingMessage ) : contain information about client request from http protocol
     * - res ( ServerResponse ) : contain response information that could be sent to client
     * - prev ( any | Promise< any > ) : contain response from abort middleware or result from main-handle if it is first backware
     * - cfg ( any ) : config for this plugins declare in appcfg.yaml or ModuleManager.setting method
     * 
     * ### return
     * - any | Promise< any > : a result that could be used by bellow middleware or ResponseHandler if it is last backware
     */
    handle(req: IncomingMessage, res: ServerResponse, prev: any, cfg: any): any | Promise<any>;
    /**
     * Used to call for the fist time this Plugins trigger by client, in InitMode, after that, ti switch to Idle or Final state for saving resource
     */
    onCreate(cfg: any): any | Promise<any>;
    /**
     * It used to detect any change for revoke onCreate. It active on Idle or Init mode and could switch to Final mode to saving resource
     */
    checkout(done: Function, cfg: any): boolean | Promise<boolean>;
    typeFilter: Array<any>;
    global: boolean;
}

/**
 * Plugins in Hyron is a module ( also called IO block ) that could be used to call before or after Logic Block
 */
export interface PluginsMeta {
    /**
     * Fontware is a function that could be called before main-handler when a request to this event has make. It used to handle input data, load special resource or do something useful
     */
    fontware: Middleware,
    /**
    * Backware is a function that could be called after main-handler when a request to this event has make. It used to handle output response, or do something useful
    */
    backware: Middleware
}