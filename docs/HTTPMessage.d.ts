export declare global {
    /**
    * Used like a error to break handling flow and response to client with a status code and status message
    */
    class HTTPMessage extends Error {
        /**
         * Used for init HTTP Message that could be used by ``throw`` or ``Promise.reject`` to break handle flow and response to client
         * 
         * ### params
         *  - **code** ( number ) : Is HTTP Status Sode from 1XX to 5XX. You could used StatusCode for friendly status name
         *  - **message** ( string - option ) : Is HTTP Status Message, detailed description about status code
         * 
         * ### return
         *  - **Error** : A object extended Error object contain description about Http Message
         */
        constructor(code: number, message?: string);
    }
}