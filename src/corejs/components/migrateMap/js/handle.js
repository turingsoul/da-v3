import WidgetBase from "corejs/components/base";
import Util from "corejs/util/util";
import {mapCenterMapping, onlineLayers} from "corejs/resource/js/mapUtil.js";

import "corejs/resource/style/leaflet.css";

import "corejs/resource/js/leaflet.js";
import "corejs/resource/js/leaflet.ChineseTmsProviders.js";
import "corejs/resource/js/leaflet.curve.js";

export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    _initMigrateMap(cfg) {
        var mapId = "map" + +new Date();
        var myMap = document.createElement("div");
        myMap.setAttribute("id", mapId);
        myMap.setAttribute("class", "myMap");
        this.htmlObj.appendChild(myMap);
        myMap.parentElement.setAttribute("class", "myMapCon");
        
        //实例化地图
        this.currentTileLayer = this._getBaseLayer(cfg.chartDefinition.option.switchMap);

        this.myMap = L.map(mapId, {
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

        this.pathArr = [];
        this.movingPathArr = [];
        this.makerArr = [];

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
                for (var item of resultset) {
                    //检查坐标点是否符合规范，出现一个不符合规范的点，已经报错，不用再检查
                    if(checkCoords){
                        checkCoords = Util.lnglatVerify(item[2],item[1]);
                    }
                    if(checkCoords){
                        checkCoords = Util.lnglatVerify(item[5],item[4]);
                    }
                    let point = {};
                    point.start = [item[2],item[1]];
                    point.end = [item[5],item[4]];
                    point.middle = [
                        (parseFloat(point.start[0]) + parseFloat(point.end[0])) / 2 + 2, 
                        (parseFloat(point.start[1]) + parseFloat(point.end[1])) / 2 + 2
                    ]  
                    point.popContent = "<p>" + item[7] + "</p>";
                    if(typeof(item[1]) === "number" &&  typeof(item[2]) === "number"  &&  typeof(item[4]) === "number"  &&  typeof(item[5]) === "number" ){
                        pointArr.push(point);
                    }else{
                        invalidData++
                    }
                }
                if(invalidData === resultset.length){
                    //当所有数据都不符合规范，报错
                    this.queryStatusDom.show("数据不符合规范，无法渲染",false);
                }
            } catch (error) {
                this.queryStatusDom.show("数据不符合规范，无法渲染",false);
            }
            this.myMap && this._renderPath(pointArr);
        }
    }

    _handleDataSetData() {
        let pointArr = [],
            self = this;
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        let checkLngLat = true;
        if (JSON.stringify(_data) === "{}") {
            return;
        } else {
            let infoset = self._getInfoset();
            for (let i = 0; i < _data.startLat.length; i++) {
                if(checkLngLat){
                    checkLngLat = Util.lnglatVerify(_data.startLng[i][0],_data.startLat[i][0])
                }
                if(checkLngLat){
                    checkLngLat = Util.lnglatVerify(_data.targetLng[i][0],_data.targetLat[i][0])
                }
                let point = {};
                let start = [_data.startLat[i][0], _data.startLng[i][0]];
                let end = [_data.targetLat[i][0], _data.targetLng[i][0]];
                point.middle = [
                    (parseFloat(start[0]) + parseFloat(end[0])) / 2 + 2,
                    (parseFloat(start[1]) + parseFloat(end[1])) / 2 + 2
                ];
                if (
                    _data.startName.length !== 0 ||
                    _data.targetName.length !== 0 ||
                    infoset.length !== 0
                ) {
                    point.popContent = self._getPopContent(
                        _data.startName[i],
                        _data.targetName[i],
                        _data.info[i],
                        infoset
                    );
                }
                point.start = start;
                point.end = end;
                pointArr.push(point);
            }
        }
        this.myMap && this._renderPath(pointArr);
    }

    _renderPath(pointArr) {
        this._removePath();
        let self = this;
        let thisOption = this.cfg.chartDefinition.option;
        //icon
        var myIcon = L.divIcon({
            html:
                "<span class='fa fa-dot-circle-o myIcon' style='color: " +
                thisOption.pointColor +
                "; font-size:14px'></span>"
        });
        for (let item of pointArr) {
            let { start, middle, end, popContent } = item;
            //画path
            var path = new L.curve(["M", start, "Q", middle, end], {
                weight: thisOption.routeWeight + 2
            }).addTo(self.myMap);
            //动态path
            var movingPath = new L.curve(["M", start, "Q", middle, end], {
                weight: thisOption.routeWeight,
                color: thisOption.routeColor,
                animate: {
                    duration: 3000,
                    iterations: Infinity,
                    direction: "normal"
                }
            }).addTo(self.myMap);
            //终点
            var marker = L.marker(end, { icon: myIcon }).addTo(self.myMap);
            //终点的popcontent
            if (popContent) {
                let popup = new L.popup({ closeButton: false })
                    .setLatLng(end)
                    .setContent(popContent);
                marker.bindPopup(popup);
                marker.on("mouseover", function(e) {
                    this.openPopup();
                });
            }
            this.pathArr.push(path);
            this.movingPathArr.push(movingPath);
            this.makerArr.push(marker);
        } 
    }

    _getInfoset() {
        const { data, query } = this.cfg.chartDefinition;
        let obj = [];
        let cellsConfig = query.datasetSetting.cellsConfig;
        for (let item of cellsConfig.info.fields) {
            obj.push(item.config.cellName);
        }
        return obj;
    }

    _getPopContent(startName, targetName, info, infoset) {
        let self = this;
        const { data, query } = this.cfg.chartDefinition;
        let cellsConfig = query.datasetSetting.cellsConfig;

        let popContent = "";
        if (startName) {
            let label = cellsConfig.startName.fields[0].config.cellName;
            popContent = "<p>" + label + ":" + startName + "</p>";
        }
        if (targetName) {
            let label = cellsConfig.targetName.fields[0].config.cellName;
            popContent += "<p>" + label + ":" + targetName + "</p>";
        }
        if (info) {
            for (let i in info) {
                let theOne = cellsConfig.info.fields[i];
                let dataHandle = theOne.config || {};
                dataHandle.formatMask = theOne.field && theOne.field.formatMask ? theOne.field.formatMask : "";
                popContent +=
                    "<p>" +
                    infoset[i] +
                    ":" +
                    Util.formatData2Str(info[i], dataHandle) +
                    "</p>";
            }
        }
        return popContent;
    }

    _removePath() {
        if (this.pathArr && this.pathArr.length) {
            for (var item of this.pathArr) {
                item.remove();
            }
            for (var item of this.movingPathArr) {
                item.remove();
            }
            for (var item of this.makerArr) {
                item.remove();
            }
            this.pathArr = [];
            this.movingPathArr = [];
            this.makerArr = [];
        }
       
    }

    _refresh(value) {
        switch (Object.keys(value)[0]) {
            case "routeColor":
                this.cfg.chartDefinition.option.routeColor =
                    value["routeColor"];
                for (var item of this.movingPathArr) {
                    item.setStyle({
                        color: value["routeColor"]
                    });
                }
                break;
            case "pointColor":
                this.cfg.chartDefinition.option.pointColor =
                    value["pointColor"];
                for (var item of document.getElementsByClassName("myIcon")) {
                    item.style.setProperty("color", value["pointColor"]);
                }
                break;
            case "routeWeight":
                this.cfg.chartDefinition.option.routeWeight =
                    value["routeWeight"];
                for (var item of this.pathArr) {
                    item.setStyle({
                        weight: value["routeWeight"] + 2
                    });
                }
                for (var item of this.movingPathArr) {
                    item.setStyle({
                        weight: value["routeWeight"]
                    });
                }
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
