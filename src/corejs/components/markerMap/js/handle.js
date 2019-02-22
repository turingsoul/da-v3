import WidgetBase from "corejs/components/base";
import Util from "corejs/util/util";
import {mapCenterMapping, onlineLayers} from "corejs/resource/js/mapUtil.js";

import "corejs/resource/style/leaflet.css";
import "corejs/resource/style/font-awesome.css";

import "dashboard/resource/font/iconfont.css";


import "corejs/resource/js/leaflet.js";
import "corejs/resource/js/leaflet.ChineseTmsProviders.js";

const tilelayerArr = {
    Normal: "Geoq.Normal.Map",
    PurplishBlue: "Geoq.Normal.PurplishBlue",
    Gray: "Geoq.Normal.Gray",
    Warm: "Geoq.Normal.Warm",
    Light: "GaoDe.Normal.Map",
    Satellite: "GaoDe.Satellite.Map"
};

export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    _initMarkerMap(cfg) {
        //地图基本信息
        var mapId = "map" + +new Date();
        var myMap = document.createElement("div");
        myMap.setAttribute("id", mapId);
        myMap.setAttribute("class", "myMap");
        this.htmlObj.appendChild(myMap);
        myMap.parentElement.setAttribute("class", "myMapCon");
       
        //实例化地图
        this.currentTileLayer = this._getBaseLayer(cfg.chartDefinition.option.switchMap);

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
        this.layers = [];
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
                        checkCoords = Util.lnglatVerify(item[1], item[2]);
                    }
                    let point = {};
                    point.coordinate = [item[2], item[1]];
                    point.popContent =
                        "<p>地区 : " +item[0] +"</p>"+
                        "<p>坐标 : " +item[1] + "," + item[2] +"</p>"+
                        "<p>信息 : " +item[4] +"</p>";
                    if(typeof(item[1]) === "number" && typeof(item[2]) === "number"){
                        pointArr.push(point)
                    }else{
                         //检查数据格式，渲染符合规范数据，记录不符合规范的数据
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
            this._renderMarkers(pointArr);
        }
    }

    _handleDataSetData() {
        let pointArr = [],
            self = this;
        let checkCoords = true;
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        if (JSON.stringify(_data) === "{}") {
            return;
        } else {
            let infoset = self._getInfoset();
            for (let i in _data.lat) {
                //检查坐标点是否符合规范，出现一个不符合规范的点，已经报错，不用再检查
                if(checkCoords){
                    checkCoords = Util.lnglatVerify(_data.lng[i][0], _data.lat[i][0]);
                }
                let point = {};
                point.coordinate = [_data.lat[i][0], _data.lng[i][0]];
                if (_data.name.length !== 0 || infoset.length !== 0) {
                    point.popContent = self._getPopContent(
                        _data.name[i],
                        _data.info[i],
                        infoset
                    );
                }
                typeof(_data.lat[i][0])  === "number" && typeof(_data.lng[i][0])  === "number" && pointArr.push(point);
            }
        }
        this._renderMarkers(pointArr);
    }

    _renderMarkers(pointArr) {
        this._removeMarkers();
        if (!pointArr || !pointArr.length) {
            return;
        }
        let thisOption = this.cfg.chartDefinition.option;
        var myIcon = new L.divIcon({
            html:
                "<span class='" +
                thisOption.markerImg +
                " myIcon'" +
                "style='color: " +
                thisOption.markerColor +
                "; " +
                "font-size:" +
                thisOption.markerSize +
                "px'></span>"
        });
        for (let i of pointArr) {
            var marker = new L.marker(i.coordinate, { icon: myIcon }).addTo(
                this.myMap
            );
            if (i.popContent) {
                let popup = new L.popup({ closeButton: false })
                    .setLatLng(i.coordinate)
                    .setContent(i.popContent);
                marker.bindPopup(popup);
                marker.on("mouseover", function(e) {
                    this.openPopup();
                });
            }

            marker.on("click", () => {
                this.myMap.setView(i.coordinate);
            });
            this.layers.push(marker);
        }
    }

    _getPopContent(name, info, infoset) {
        var self = this;
        const { data, query } = this.cfg.chartDefinition;
        let cellsConfig = query.datasetSetting.cellsConfig;
        let popContent = "";
        if (name) {
            let label = cellsConfig.name.fields[0].config.cellName;
            popContent = "<p>" + label + ":" + name + "</p>";
        }
        if (info) {
            for (let i in info) {
                let theOne = cellsConfig.info.fields[i];
                let dataHandle = theOne.config ? theOne.config : {};
                dataHandle.formatMask = theOne.field && theOne.field.formatMask ?theOne.field.formatMask : "";
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

    _getInfoset() {
        const { data, query } = this.cfg.chartDefinition;
        let obj = [];
        let cellsConfig = query.datasetSetting.cellsConfig;
        for (let item of cellsConfig.info.fields) {
            obj.push(item.config.editeName || item.field.name);
        }
        return obj;
    }

    _removeMarkers() {
        if (this.layers || !this.layers.length) {
            for (var item of this.layers) {
                item.remove();
            }
            this.layers = [];
        }
    }

    _refresh(value) {
        switch (Object.keys(value)[0]) {
            case "markerColor":
                this.cfg.chartDefinition.option.markerColor =
                    value["markerColor"];
                for (var item of document.getElementsByClassName("myIcon")) {
                    item.style.setProperty("color", value["markerColor"]);
                }
                break;
            case "markerImg":
                this.cfg.chartDefinition.option.markerImg = value["markerImg"];
                this.handleData();
                break;
            case "markerSize":
                this.cfg.chartDefinition.option.markerSize =
                    value["markerSize"];
                for (var item of document.getElementsByClassName("myIcon")) {
                    item.style.setProperty(
                        "font-size",
                        value["markerSize"] + "px"
                    );
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

    _resize() {
        if(this.myMap){
            this.myMap._onResize();
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
}
