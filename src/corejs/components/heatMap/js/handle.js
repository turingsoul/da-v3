import WidgetBase from "corejs/components/base";
import Util from "corejs/util/util";
import {mapCenterMapping, onlineLayers} from "corejs/resource/js/mapUtil.js";

import "corejs/resource/style/leaflet.css";
import "corejs/resource/style/font-awesome.css";

import "corejs/resource/js/leaflet.js";
import "corejs/resource/js/leaflet.ChineseTmsProviders.js";
import "corejs/resource/js/leaflet-heat.js";

export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    _initHeatMap(cfg) {
        var mapId = "map" + +new Date();
        var myMap = document.createElement("div");
        myMap.setAttribute("id", mapId);
        myMap.setAttribute("class", "myMap");
        this.htmlObj.appendChild(myMap);
        myMap.parentElement.setAttribute("class", "myMapCon");
        //实例化地图
        this.currentTileLayer = this._getBaseLayer(cfg.chartDefinition.option.switchMap);

        var southWest = L.latLng(-89.98155760646617, -180),northEast = L.latLng(89.99346179538875, 180);
        var bounds = L.latLngBounds(southWest, northEast);
        this.myMap = new L.map(mapId, {
            center: [
                mapCenterMapping[cfg.chartDefinition.option.mapCenter][1],
                mapCenterMapping[cfg.chartDefinition.option.mapCenter][0]
            ],
            zoom:
                cfg.chartDefinition.option.zoomLevel +
                cfg.chartDefinition.option.minZoom,
            minZoom: cfg.chartDefinition.option.minZoom,
            maxZoom: cfg.chartDefinition.option.maxZoom,
            layers: [this.currentTileLayer],
            zoomControl: false,
            attributionControl: false,
            worldCopyJump : true
        });

        return (this.rootDom = this.htmlObj);
    }

    _handleData() {
        let pointArr = [];
        let value = this.cfg.chartDefinition.data;
        let resultset = this.cfg.chartDefinition.data.resultset;
        let checkCoords = true;
        let invalidData = 0;
        if (!value || (value.success === false) || !Object.keys(value).length || resultset === undefined){
            return;
        }else{ 
            try {
                resultset.map(function(p) {
                    let count = Math.ceil(p[2]);
                    if(typeof(p[2]) === "number"){
                        for(let j = 0; j <count;j++){
                            //检查坐标点是否符合规范，出现一个不符合规范的点，已经报错，不用再检查
                            if(checkCoords){
                                checkCoords = Util.lnglatVerify(p[1], p[2]);
                            }
                            typeof(p[0]) === "number" && typeof(p[1]) === "number" && pointArr.push([p[1], p[0]]);
                        }
                    }
                    if(typeof(p[2]) !== "number"  || typeof(p[0]) !== "number" || typeof(p[1]) !== "number"){
                        //检查数据格式，渲染符合规范数据，记录不符合规范的数据
                        invalidData++
                    }
                });  
                if(invalidData === resultset.length){
                    //当所有数据都不符合规范，报错
                    this.queryStatusDom.show("数据不符合规范，无法渲染",false);
                }
            }catch (error) {
                this.queryStatusDom.show("数据不符合规范，无法渲染",false);
            }
            this._renderHeatLayer(pointArr);
        }
    }

    _handleDataSetData() {
        let pointArr = [];
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        let checkCoords = true;
        if (JSON.stringify(_data) === "{}" || !_data.lat) {
            return;
        } else {
            for (let i = 0; i < _data.lat.length; i++) {
                for (let j = 0; j < Math.ceil(_data.counter[i][0]); j++) {
                    //检查坐标点是否符合规范，出现一个不符合规范的点，已经报错，不用再检查
                    if(checkCoords){
                        checkCoords = Util.lnglatVerify(_data.lng[i][0], _data.lat[i][0]);
                    }
                    typeof(_data.lng[i][0]) === "number" && typeof(_data.lat[i][0]) === "number"  && pointArr.push([_data.lat[i][0], _data.lng[i][0]]);
                }
            }
        }
        this._renderHeatLayer(pointArr);
    }

    _renderHeatLayer(pointArr) {
        this._clearHeatLayer();
        if (!pointArr || !pointArr.length) {
            return;
        }
        this.heatLayer = new L.heatLayer(pointArr, {
            minOpacity: 0.5,
            radius: this.cfg.chartDefinition.option.heatRadius,
            blur: 20,
            gradient: {
                "0": "green",
                "0.5": "yellow",
                "1": "red"
            }
        }).addTo(this.myMap);
    }

    _clearHeatLayer() {
        if (this.heatLayer) {
            this.myMap.removeLayer(this.heatLayer);
        }
    }

    _refresh(value) {
        switch (Object.keys(value)[0]) {
            case "heatRadius":
                this.cfg.chartDefinition.option.heatRadius =
                    value["heatRadius"];
                this.handleData();
                break;
            case "mapCenter":
                this.cfg.chartDefinition.option.mapCenter = value["mapCenter"];
                let coordinate = mapCenterMapping[value["mapCenter"]];
                this.myMap.setView([coordinate[1], coordinate[0]]);
                break;
            case "zoomLevel":
                this.cfg.chartDefinition.option.zoomLevel = value["zoomLevel"];
                this.myMap.setZoom(
                    this.cfg.chartDefinition.option.minZoom + value["zoomLevel"]
                );
                break;
            case "switchMap":
                this.cfg.chartDefinition.option.switchMap = value["switchMap"];
                this.myMap.removeLayer(this.currentTileLayer);
                this.currentTileLayer = this._getBaseLayer(value["switchMap"]);
                this.myMap.addLayer(this.currentTileLayer);
                break;
            default:
                break;
        }
    }

    _getBaseLayer(value){
        let baseLayer = null;
        if(value[0] === "online"){
            baseLayer = new L.tileLayer.chinaProvider(onlineLayers[value[1]],{});
        }else{
            baseLayer = new L.tileLayer.wms(value[2],{
                layers: value[1],
                format: 'image/png',
                transparent: false,
                crossOrigin: true
            });
        }
        return baseLayer;
    }

    _resize() {
        if(this.myMap){
            this.myMap._onResize();
        }  
    }
}
