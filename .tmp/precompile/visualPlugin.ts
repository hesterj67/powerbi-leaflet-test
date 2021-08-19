import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var sOCAFDemo280D06E13758447BABDCAADFDAC60D5A_DEBUG: IVisualPlugin = {
    name: 'sOCAFDemo280D06E13758447BABDCAADFDAC60D5A_DEBUG',
    displayName: 'SOCAFDemo',
    class: 'Visual',
    apiVersion: '3.8.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = globalThis.dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["sOCAFDemo280D06E13758447BABDCAADFDAC60D5A_DEBUG"] = sOCAFDemo280D06E13758447BABDCAADFDAC60D5A_DEBUG;
}
export default sOCAFDemo280D06E13758447BABDCAADFDAC60D5A_DEBUG;