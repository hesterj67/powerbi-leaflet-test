/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/


import "core-js/stable";
import "./../style/visual.less";
import layers from "./layers";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import * as L from 'leaflet';
import { VisualSettings } from "./settings";

//Testing Layers
let publicLayers = [
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png")
]

//Active Layers 
let privateLayers = layers.forEach(layer => {
    L.tileLayer.wms(layer);
});

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private map: L.Map;
    private locationGroup: L.LayerGroup;
    
    constructor(options: VisualConstructorOptions) { 
        console.log('Visual constructor', options);
        this.target = options.element;


        if (typeof document !== "undefined") {
            this.map = L.map(this.target).setView([0, 0], 2);

            if(window.location.host == "app.powerbi.com"){
                let defaultLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
                this.map.addLayer(defaultLayer);
                let publicMaps = {
                    "Default English": publicLayers[0],
                    "Default German": publicLayers[1]
                };
                L.control.layers(publicMaps).addTo(this.map);
            }else{
                
            }
        }

    }

    public update(options: VisualUpdateOptions) {
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        let metadataColumns = options.dataViews[0].metadata.columns;
        let mapData = options.dataViews[0].table.rows;

        // this.map.eachLayer(function(layer) { 
          //      this.map.removeLayer(layer);
        // });  
      
              
        if(metadataColumns.length >= 2){
            let parsedValues = this.parseData(metadataColumns,mapData);
            if(parsedValues){
                this.setPoints(parsedValues);  
            }
        }
     
    }

    private parseData(columns,mapData){
        let findIndexArray = [];
        let parsedArray = [];

        //Finds the index of each of the values in the mapData array. We need to identify which values go with which column based on the order the user put in the values.
        columns.forEach(function(col,idx){
            if("title" in col.roles){
                findIndexArray[0] = idx;
            } 
            if("latitude" in col.roles){
                findIndexArray[1] = idx;
            } 
            if("longitude" in col.roles){
                findIndexArray[2] = idx;
            } 
            if("radius" in col.roles){
                findIndexArray[3] = idx;
            } 
            if("color" in col.roles){
                findIndexArray[4] = idx;
            }     
        });

        if(typeof findIndexArray[1] != undefined && typeof findIndexArray[2] != undefined){
            mapData.forEach(function(row){
                let title = row[findIndexArray[0]];
                let latitude = row[findIndexArray[1]];
                let longitude = row[findIndexArray[2]];
                let radius = "5000";
                let color = "blue";

                if(row[findIndexArray[3]] != "" && row[findIndexArray[3]] != null){
                    radius = row[findIndexArray[3]].toString();
                }

                if(row[findIndexArray[4]] != "" && row[findIndexArray[4]] != null){
                    color = row[findIndexArray[4]];
                }
                
                 parsedArray.push([title,latitude,longitude,radius,color]); 
            });

            return parsedArray;
        
        }else{
            return false;   
        }
    }

    private setPoints(locations){  
        for (var i = 1; i < locations.length; i++) { 
           /* locationArray.push(L.circle([locations[i][1], locations[i][2]],{
                color:locations[i][4],
                fillColor: locations[i][4],
                fillOpacity: 0.9,
                radius: locations[i][3]      
           }).bindPopup(locations[i][0]));*/

          var circle= L.circle([locations[i][1], locations[i][2]], {
                color:locations[i][4],
                fillColor: locations[i][4],
                fillOpacity: 0.5,
                radius: locations[i][3]  
            }).bindPopup(locations[i][0]);
            this.map.addLayer(circle); 


            /*var marker = L.marker(, {
                color:locations[i][4],
                fillColor: locations[i][4],
                fillOpacity: 0.5,
                radius: locations[i][3] 
              }).addTo(this.map);
              circle.bindTooltip('Hello world!');
              L.tooltipLayout.resetMarker(circle);

            /*var options = {
                icon: 'leaf',
                iconShape: 'marker'
            };
              
              var marker = L.marker([locations[i][1], locations[i][2]], {
                icon: L.BeautifyIcon.icon(options),
              }).addTo(this.map);
              marker.bindTooltip('Hello world!');
              L.tooltipLayout.resetMarker(marker);*/
        }

        var testPoint = L.circle([6.358, 48.37], {
            color:"green",
            fillColor: "green",
            fillOpacity: 0.5,
            radius: 50000  
        }).bindPopup("test point");
        var locationTest = L.layerGroup([testPoint]);
        locationTest.addTo(this.map);
    }

    private clearMap() { 
        this.map.eachLayer(function(layer) { 
            this.map.removeLayer(layer);
        });  
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}