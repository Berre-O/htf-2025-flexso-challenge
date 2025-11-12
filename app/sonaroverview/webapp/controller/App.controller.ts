import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace flexso.cap.hrf.sonaroverview.controller
 */
export default class App extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        const oModel = this.getOwnerComponent()?.getModel();
        this.getView()?.setModel(oModel);
    }
}