/* eslint-disable linebreak-style */
import Dialog from "sap/m/Dialog";
import ListItemBase from "sap/m/ListItemBase";
import Table from "sap/m/Table";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import Binding from "sap/ui/model/Binding";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataContextBinding from "sap/ui/model/odata/v4/ODataContextBinding";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

/**
 * @namespace flexso.cap.htf.symboltranslation.controller
 */
export default class Master extends Controller {
  creationDialog!: Dialog;
  table!: Table;

  public onInit(): void {
    this.table = this.byId("idProductsTable") as Table;
  }

  public async addIcon(): Promise<void> {
    const createModel = new JSONModel({
      symbol: "",
      whereFound: "",
      language: "",
    });

    if (!this.creationDialog) {
      this.creationDialog = (await Fragment.load({
        name: "flexso.cap.htf.symboltranslation.view.fragments.create",
        controller: this,
      })) as Dialog;
      this.getView()?.addDependent(this.creationDialog);
    }

    // Set only the create model; the Select items bind directly to OData via {/SubnauticLocation} and {/Languages}
    this.creationDialog.setModel(createModel, "create");

    this.creationDialog.open();
  }

  public save(): void {
    const listBinding = this.getView()
      ?.getModel()
      ?.bindList("/Symbols") as ODataListBinding;
    const data = this.creationDialog.getModel("create");

    listBinding.create({
      symbol: data?.getProperty("/symbol"),
      whereFound: data?.getProperty("/whereFound"),
      language: data?.getProperty("/language"),
    });

    this.creationDialog.close();
    (this.table.getBinding("items") as Binding).refresh();
  }

  public submitForm(): void {
    this.save();
  }

  public closeDialog(): void {
    this.creationDialog.close();
  }

  public async translate(): Promise<void> {
    this.table.getSelectedItems().forEach(async (item: ListItemBase) => {
      const contextBinding = this.getView()
        ?.getModel()
        ?.bindContext(
          `${(
            item.getBindingContext() as Context
          ).getPath()}/AdminService.translateSymbolBound(...)`,
          item.getBindingContext() as Context
        ) as ODataContextBinding;

      await contextBinding.invoke();
      (this.table.getBinding("items") as Binding).refresh();
    });
  }
}
