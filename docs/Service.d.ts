import { Server } from "net";

/**
 * Contain information about a router that could be used by hyron to register event
 */
export interface RouterMeta {
    /**
     * Is http method that router listen onto, it could be : GET, HEAD, POST, PUT, PATCH, ALL (not sensitive). And could be multi method if it declared in a array
     */
    method: string | Array<string>;
    /**
     * Specify exactly which fontware of the plugins will be run. Add '!' before a global fontware name to turn off it. If it is funciton, hyron will register a anonymous fontware with name is hash of this by crc algorithm
     */
    fontware: Array<string | Function>;
    /**
     * Specify exactly which backware of the plugins will be run. Add '!' before a global backware name to turn off it. If it is funciton, hyron will register a anonymous backware with name is hash of this by crc algorithm
     */
    backware: Array<string | Function>;
    /**
     * Determine exactly which plugins will be run.  Add '!' before a global plugin name to turn off it
     */
    plugins: Array<string>;
    /**
     * Used to custom whole of path instead of the default path registered by hyron
     */
    path: string;
    /**
     * used to customize the dynamic path followed by the current path. It is used by param-parser plugins to get params from the url
     */
    params: string;
}

/**
 * Used to group a set of method that could be used to register listener by hyron
 */
export interface ServiceMeta {
    /**
     * This could be used to apply properties for all routers. And could be override by each other
     */
    $all?: RouterMeta;
    /**
     * List method could be used to register router. By default, hyron will register listener on method-name in current class
     */
    [method_name: string]: RouterMeta | RouterMeta.method;
}

/**
 * Is service packaged supported by hyron contain functions that could be used to register Router
 */
declare class HyronService {
    /**
     * A interface used by Hyron to register Routers
     */
    static requestConfig(): ServiceMeta;
}

/**
 * Used to support for another services that work outside HTTP protocols or it need for more access.
 */
export interface UnofficialService{
    handle(app: Server, cfg: any): Function;
}