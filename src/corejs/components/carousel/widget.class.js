import WidgetBase from "corejs/components/base";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from "jquery";


export default class CarouselWidget extends WidgetBase {
    static cname = "";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this.$div = $(this.rawhtmlObj);
        this.handleDefinition(cfg.chartDefinition);
    }

    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
        let { imgPosition } = this.cfg.chartDefinition.option;
        this._handlePos(imgPosition);
    }

    dispatchDefinition(type, value) {
        switch (type) {
            case "data":
                break;
            case "option":
                this.handleDefinition(value);
                break;
            case "backgroundColor":
                $(this.htmlObj).css("backgroundColor", value);
                this.cfg.chartDefinition.option[type] = value;
                break;
            case "backgroundImage":
                this._image = new Image();
                this._image.src = value;
                this.$div.css({
                    backgroundImage: "url(" + value + ")",
                    backgroundRepeat: "no-repeat"
                });
                break;
            case "pageNumber":
                window.Dashboard.event.dispatch("carouselSettingChange_"+this.id, {"type": "pageNumber", "value" : value});
                break;
            case "intervalTime":
                window.Dashboard.event.dispatch("carouselSettingChange_"+this.id, {"type": "intervalTime", "value" : value});
                break;
            case "dotPosition":
                window.Dashboard.event.dispatch("carouselSettingChange_"+this.id, {"type": "dotPosition", "value" : value});
                break;
            default:
        }
    }

    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        this.handleDefinition(nextCfg);
    }

    resize() {}

    /*
        { name: "居中", value: "center" },
        { name: "拉伸", value: "caver" },
        { name: "填充", value: "scale" },
        { name: "平铺", value: "flat" }
    */
    _handlePos(value) {
        switch (value) {
            case "center":
                this.$div.css({
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "auto"
                });
                break;
            case "caver":
                this.$div.css({
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100% 100%"
                });
                break;
            case "scale":
                var h = this.htmlObj.clientHeight,
                    w = this.htmlObj.clientWidth,
                    imgH = this._image.height,
                    imgW = this._image.width,
                    _size = 0,
                    size = "";
                if (h > w) {
                    _size = h / imgH;
                    size = ((imgW * _size) / w) * 100 + "% 100%";
                } else {
                    _size = w / imgW;
                    size = "100% " + ((imgH * _size) / h) * 100 + "%";
                }
                this.$div.css({
                    backgroundPosition: "top left",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: size
                });
                break;
            case "flat":
                this.$div.css({
                    backgroundPosition: "top left",
                    backgroundRepeat: "repeat",
                    backgroundSize: "auto"
                });
                break;
            default:
                break;
        }
    }
}
