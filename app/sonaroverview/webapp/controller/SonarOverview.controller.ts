import Controller from "sap/ui/core/mvc/Controller";
import VizFrame from "sap/viz/ui5/controls/VizFrame";
import Event from "sap/ui/base/Event";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Popover from "sap/viz/ui5/controls/Popover";
import ChartFormatter from "sap/viz/ui5/format/ChartFormatter";
import SimpleForm from "sap/ui/layout/form/SimpleForm";
import Label from "sap/m/Label";
import Text from "sap/m/Text";
import FlattenedDataset from "sap/viz/ui5/data/FlattenedDataset";

/**
 * @namespace flexso.cap.hrf.sonaroverview.controller
 */
export default class SonarOverview extends Controller {
    private selectedSonarReading: any;

    public onInit(): void {
        this._initVizFrame();
    }

    private async _initVizFrame(): Promise<void> {
        const oViz = this.byId("sonarBubble") as VizFrame;
        if (!oViz) return;

        const i18nModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel | undefined;
        const resourceBundle = await i18nModel?.getResourceBundle();

        oViz.setVizProperties({
            title: { text: resourceBundle?.getText("title") },
            plotArea: {
                dataLabel: { visible: true },
                background: { visible: true }
            },
            legend: { visible: true },
            valueAxis: { title: { text: resourceBundle?.getText("HoursInPast") } },
            valueAxis2: { title: { text: resourceBundle?.getText("MilesFromBase") } },
            interaction: { selectability: { mode: "single" } }
        });

        oViz.attachSelectData(this.onSelectData, this);
        oViz.attachEventOnce("renderComplete", () => {
            oViz.setVizProperties({
                legend: { title: { text: resourceBundle?.getText("SonarType") } }
            });
        });

        (oViz.getDataset() as FlattenedDataset).setContext("SonarFinding");

        const vizPopover = this.byId("sonarPopOver") as Popover;
        if (vizPopover) {
            vizPopover.setCustomDataControl(() => {
                const data = this.selectedSonarReading;

                if (!data) {
                    return new Text({ text: "No sonar data found." });
                }

                return new SimpleForm({
                    editable: false,
                    content: [
                        new Label({ text: "Finding" }),
                        new Text({ text: data.finding }),

                        new Label({ text: "Hours in Past" }),
                        new Text({ text: data.hoursInPast }),

                        new Label({ text: "Miles from Base" }),
                        new Text({ text: data.milesFromBase }),

                        new Label({ text: "Signal Strength" }),
                        new Text({ text: data.signalStrength })
                    ]
                });
            });

            vizPopover.connect(oViz.getVizUid());
            vizPopover.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
        }
    }

    public onSelectData(oEvent: Event): void {
        const event = oEvent as any;
        const dataPoints = event.getParameter("data");
        if (!dataPoints || dataPoints.length === 0) return;

        const dp = dataPoints[0].data;

        this.selectedSonarReading = {
            finding: dp.SonarFinding,
            hoursInPast: dp.Hours,
            milesFromBase: dp.Miles,
            signalStrength: dp.SignalStrength ?? dp.signalStrength ?? "N/A"
        };
    }
}
