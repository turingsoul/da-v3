import WidgetBase from "corejs/components/base";
import Util from "corejs/util/util";
import {mapCenterMapping, onlineLayers} from "corejs/resource/js/mapUtil.js";

import "corejs/resource/style/leaflet.css";
import "corejs/resource/style/font-awesome.css";

import "corejs/resource/js/leaflet.js";
import "corejs/resource/js/leaflet.ChineseTmsProviders.js";
import "corejs/resource/js/leaflet.textpath.js";
import "corejs/resource/js/MovingMarker.js";


export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    _initRouteMap(cfg) {
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
                cfg.chartDefinition.option.minZoom +
                cfg.chartDefinition.option.zoomLevel,
            minZoom: cfg.chartDefinition.option.minZoom,
            maxZoom: cfg.chartDefinition.option.maxZoom,
            layers: [this.currentTileLayer],
            zoomControl: false,
            attributionControl: false,
            worldCopyJump : true
        });

        return (this.rootDom = this.htmlObj);
    }

    _handleData(){
        this.afterHandle = [];
        let lines = [];
        let lineArr = [];
        let checkLngLat = true;
        let value = this.cfg.chartDefinition.data;
        let resultset = this.cfg.chartDefinition.data.resultset;
        let invalidData = 0;
        if (!value || (value.success === false) || !Object.keys(value).length || resultset === undefined){
            return;
        }else{ 
            try {
                //统计有多少条line
                for(var item of resultset){
                    lines.push(item[0]);
                }
                lines = [...new Set(lines)];
                lines.forEach((item, i)=>{
                    lineArr[item] = {
                        pointList : []
                    };
                });
                //line的pointlist
                for(var item of resultset){
                    let key = item[0];
                    if(checkLngLat){
                        checkLngLat = Util.lnglatVerify(item[2],item[3]);
                    }
                    if(typeof(item[2])  === "number" && typeof(item[3])  === "number"){
                        lineArr[key].pointList.push([item[3],item[2]])
                    }else{
                        invalidData++;
                    }
                };
                //其他,设置起始点和信息
                for(let i in lineArr){
                    let line = lineArr[i];
                    line.start = line.pointList[0];
                    line.end = line.pointList[line.pointList.length - 1];
                    line.popContent = "<p>" +i +", 点数量" +line.pointList.length+"</p>";
                    this.afterHandle.push(line);
                }

                if(invalidData === resultset.length){
                    //当所有数据都不符合规范，报错
                    this.queryStatusDom.show("数据不符合规范，无法渲染",false);
                }

            } catch (error) {
                this.queryStatusDom.show("数据不符合规范，无法渲染",false);
            }
            this._renderRoute();
        }
    }

    _handleDataSetData(){
        this.afterHandle = [];
        let lineArr = {};
        let lines = [];
        let checkLngLat = true;
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        if(JSON.stringify(_data)==="{}"){
            return
        }else{
            //统计有多少line
            for(let item of _data.routeName){
                lines.push(item[0]);
            }
            lines = [...new Set(lines)];
            lines.forEach((item, i)=>{
                lineArr[item] = {
                    pointList : []
                };
            });
            //line的pointlist
            for(let i in _data.lat){
                let key = _data.routeName[i][0];
                if(checkLngLat){
                    checkLngLat = Util.lnglatVerify(_data.lng[i][0],_data.lat[i][0]);
                }
                typeof(_data.lat[i][0])  === "number" && typeof(_data.lng[i][0])  === "number" && lineArr[key].pointList.push([_data.lat[i][0], _data.lng[i][0]]);
            }
            //其他,设置起始点和信息
            for(let i in lineArr){
                let line = lineArr[i];
                line.start = line.pointList[0];
                line.end = line.pointList[line.pointList.length - 1];
                line.popContent = "<p>" +i +", 点数量" +line.pointList.length+"</p>";
                this.afterHandle.push(line);
            }
        }

        this._renderRoute();
    }

    _renderRoute() {
        this._removeRoute();
        let lineArr = this.afterHandle;
        if(!lineArr || !lineArr.length){
            return
        }
        this.pathGroup = L.layerGroup();
        this.startGroup = L.layerGroup();
        let thisOption = this.cfg.chartDefinition.option;

        for (var line of lineArr) {
            let {pointList, start, end,popContent} = line;
            //折线
            var polyline = new L.Polyline(pointList, {
                color: thisOption.routeColor,
                weight: thisOption.routeSize,
                opacity: 0.5,
                smoothFactor: 1
            });
            var popup = new L.popup({ closeButton: false })
                .setLatLng(end)
                .setContent(popContent);
            polyline.bindPopup(popup);
            polyline.on("mouseover", function(e) {
                this.openPopup();
            });
            //起始点
            let startIcon = L.divIcon({
                html:
                    "<span class='fa fa-dot-circle-o myIcon' style='color: #68BC00;font-size:" +
                    thisOption.routeSize +
                    "px'></span>"
            });
            var startMarker = L.marker(start, { icon: startIcon });
            let endIcon = L.divIcon({
                html:
                    "<span class='fa fa-dot-circle-o myIcon' style='color: #D33115;font-size:" +
                    thisOption.routeSize +
                    "px'></span>"
            });
            var endMarker = L.marker(end, {
                icon: endIcon
            });
            //画箭头
            if (thisOption.arrowShow) {
                polyline.setText("  ►   ", {
                    repeat: true,
                    offset:
                        (thisOption.routeSize * 2) / 5,
                    attributes: {
                        fill: "#fff",
                        "font-weight": "bolder",
                        "font-size":
                        thisOption.routeSize / 3 +
                        thisOption.routeSize +
                            "px"
                    }
                });
            }
            //画关键点
            if (thisOption.pointShow) {
                //this.showKeyPoint();
            }
            //画动态点
            this._renderMovingMarker();
            this.pathGroup.addLayer(polyline);
            this.startGroup.addLayer(startMarker);
            this.startGroup.addLayer(endMarker);
        }
        this.pathGroup.addTo(this.myMap);
        this.startGroup.addTo(this.myMap);
    }

    _removeRoute() {
        if (this.pathGroup) this.pathGroup.clearLayers();
        if (this.startGroup) this.startGroup.clearLayers();
        if (this.keyPointGroup) this.keyPointGroup.clearLayers();
        if (this.movingMarkerGroup) this.movingMarkerGroup.clearLayers();
    }

    _showKeyPoint() {
        var myIcon = L.divIcon({
            html:
                "<span class='fa fa-dot-circle-o myIcon' style='color: " +
                this.cfg.chartDefinition.option.routeColor +
                ";font-size:" +
                this.cfg.chartDefinition.option.routeSize +
                "px'></span>"
        });
        this.keyPointGroup = L.layerGroup();
        for (var results of this.cfg.chartDefinition.data) {
            var pointList = JSON.parse(results[1]).map(function(p) {
                return [p[1], p[0]];
            });
            for (var i = 1; i < pointList.length - 1; i++) {
                this.keyPointGroup.addLayer(
                    L.marker(pointList[i], { icon: myIcon })
                );
            }
            this.keyPointGroup.addTo(this.myMap);
        }
    }

    _renderMovingMarker() {
        let lineArr = this.afterHandle;
        if (this.movingMarkerGroup) {
            this.movingMarkerGroup.clearLayers();
        }
        this.movingMarkerGroup = L.layerGroup();
        let thisOption = this.cfg.chartDefinition.option;
        var myIcon = new L.divIcon({
            html:
                "<div class='markerButton'><span class= '" +
                thisOption.arrowStyle +
                " markerTop'></span></div>"
        });
        for (var line of lineArr) {
            let {pointList} = line;
            //准备点
            var timeList = [];
            var time = 10000 / line.pointList.length;
            pointList.map(function(p){
                timeList.push(time);
            })
            var movingMarker = L.Marker.movingMarker(pointList, timeList, {
                icon: myIcon,
                autostart: false
            });
            this.movingMarkerGroup.addLayer(movingMarker);
        }
        this.movingMarkerGroup.addTo(this.myMap);

        if (thisOption.arrowAnimation === "single") {
            for (var movingMarker of this.movingMarkerGroup.getLayers()) {
                movingMarker.start();
                movingMarker.on("end", function() {
                    this.stop();
                });
                movingMarker.getElement().style.setProperty("display", "block");
            }
        } else if (thisOption.arrowAnimation === "multi") {
            for (var movingMarker of this.movingMarkerGroup.getLayers()) {
                movingMarker.start();
                movingMarker.on("end", function() {
                    this.start();
                });
                movingMarker.getElement().style.setProperty("display", "block");
            }
        } else {
            for (var movingMarker of this.movingMarkerGroup.getLayers()) {
                movingMarker.stop();
                movingMarker.getElement().style.setProperty("display", "none");
            }
        }
    }

    _refresh(value) {
        switch (Object.keys(value)[0]) {
            case "routeColor":
                this.cfg.chartDefinition.option.routeColor =
                    value["routeColor"];
                if(this.pathGroup && this.pathGroup.getLayers()){
                    for (var path of this.pathGroup.getLayers()) {
                        path.setStyle({
                            color: value["routeColor"]
                        });
                    }
                }
                
                break;
            case "routeSize":
                this.cfg.chartDefinition.option.routeSize =
                    value["routeSize"] || 1;
                if(this.pathGroup && this.pathGroup.getLayers()){
                    for (var path of this.pathGroup.getLayers()) {
                        path.setStyle({
                            weight: value["routeSize"]
                        });
                    }
                }
                break;
            case "arrowShow":
                this.cfg.chartDefinition.option.arrowShow = value["arrowShow"];
                if(this.pathGroup && this.pathGroup.getLayers()){
                    if (value["arrowShow"]) {
                        for (var path of this.pathGroup.getLayers()) {
                            path.setText("  ►  ", {
                                repeat: true,
                                attributes: { fill: "#fff" }
                            });
                        }
                    } else {
                        for (var path of this.pathGroup.getLayers()) {
                            path._textNode.remove();
                        }
                    }
                }
                break;
            case "pointShow":
                this.cfg.chartDefinition.option.pointShow = value["pointShow"];
                if (value["pointShow"]) {
                    //this.showKeyPoint();
                } else {
                    //this.keyPointGroup.clearLayers();
                }
                break;
            case "arrowAnimation":
                this.cfg.chartDefinition.option.arrowAnimation =
                    value["arrowAnimation"];
                this._renderMovingMarker();
                break;
            case "arrowStyle":
                this.cfg.chartDefinition.option.arrowStyle =
                    value["arrowStyle"];
                if(this.movingMarkerGroup && this.movingMarkerGroup.getLayers()){
                    var myIcon = new L.divIcon({
                        html:
                            "<div class='markerButton'><span class='" +
                            this.cfg.chartDefinition.option.arrowStyle +
                            " markerTop'></span></div>"
                    });
                    for (var movingMarker of this.movingMarkerGroup.getLayers()) {
                        movingMarker.setIcon(myIcon);
                    }
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
