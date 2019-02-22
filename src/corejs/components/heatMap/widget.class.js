import Handle from "./js/handle";

class HeatMap extends Handle {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        //地图基本信息
        this._initHeatMap(cfg);
        this.handleData();
    }

    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        } 
    }

    dispatchDefinition(type, value) {
        switch (type) {
            case "option":
                this.handleDefinition(value);
                this._refresh(value);
                break;
            case "data":
                // if (!value || (value.success === false) || !Object.keys(value).length){
                //     this.cfg.chartDefinition.data = "";
                // } else {
                //     this.cfg.chartDefinition.data = value;
                // }
                this.cfg.chartDefinition.data = value;
                this.handleData();
                break;
            case "code":
                this.cfg.chartDefinition.option.code = value;
                break;
            default:
        }
    }

    widgetDidCreated(cfg) {
        super.widgetDidCreated(cfg);
    }
    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        this.handleDefinition(nextCfg);
    }
    postUpdate(nextCfg) {
        super.postUpdate(nextCfg);
    }
    draw() {
        super.draw();
        this._resize();
    }
    destroy() {
        this.execFun = null;
    }
}
export default HeatMap;
