export declare global {
    /**
     * dosomeitng useful
     */
    class HTTPMessage extends Error {
        /**
         * Used like a error to break handling flow and response to client with a status code and status message
         */
        constructor(code: number, message?: string);
    }
}