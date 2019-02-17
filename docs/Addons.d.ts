export interface AddonsMeta {

    /**
     * A function that contain logic for extends Hyron core or do something when instance created. This function could access to 'this' scope of current instance
     */
    handle(cfg: any): void;
}