import Handle from "./js/handle";
import echarts from "echarts";
import Immutable, { Map, is } from "immutable";
import defaultOption from "./js/defaultCfg";
import $ from "jquery";

class ChartGauge extends Handle {
    static cname = "油量图";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this.drawCount = 0;
        /*    this._option = {};
    this._initOption();//初始化option*/

        //默认option赋值
        cfg.chartDefinition.defaultOption = defaultOption;

        this.handleDefinition(cfg.chartDefinition);

        this.echartsDom = echarts.init(this.htmlObj);
        $(this.htmlObj).css("overflow", "hidden");
        this._bindClickEvent();
        return (this.rootDom = this.htmlObj);
    }
    /**
     * @Author    Liwei
     * @DateTime  2018-03-15
     * @discripte [处理数据，样式，和属性]
     * @param     {[type]}    nextCfg  [{css:{},data:{}}]
     * @param     {Boolean}   isUseSet [是否是用户调用设置宽高]
     * @return    {[type]}             [description]
     */
    handleDefinition(nextCfg, drillName) {
        //每次执行都初始化option  避免造成覆盖不能复原
        this._option = {};
        this._initOption();
        //处理返回data和样式等  制作赋值操作
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname], drillName);
        }
        const chartDefinition = this.cfg.chartDefinition;
        this.handleData(drillName || this._drilName);
        //处理样式操作的和代码注入合成option
        this._option = this._handleOption(this._option);
        return this._option;
    }

    dispatchDefinition(type, value, drillName) {
        const chartDefinition = this.cfg.chartDefinition;
        switch (type) {
            case "data":
                this._drilName = false;
                chartDefinition.data = value;
                break;
            case "option":
                for (let cname in value) {
                    chartDefinition.option[cname] = value[cname];
                }
                break;
            default:
                break;
        }
    }
    resize() {
        //每次resize都重新生成option
        this.handleDefinition(this.cfg.chartDefinition);
        this.echartsDom.resize();
        // this.echartsDom.setOption(this._option, true);
        this.draw();
    }
    widgetDidCreated(cfg) {
        super.widgetDidCreated(cfg);
    }
    /**数据入口 */
    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        this.handleDefinition(nextCfg);
    }
    postUpdate(nextCfg) {
        super.postUpdate(nextCfg);
    }
    draw() {
        super.draw();
        this.drawCount++;
        /* if (
            window.Dashboard.util.urlParse("type") == "1" &&
            this.cfg.chartDefinition.query.query &&
            this.drawCount == 1
        ) {
            return false;
        } */
        let { query, data } = this.cfg.chartDefinition;
        if (!query.type || !data.resultset) {
            this.echartsDom.clear();
            return false;
        }
        this.echartsDom.setOption(this._option, true);
    }
    destroy() {
        this.echartsDom.dispose();
    }
}
export default ChartGauge;
