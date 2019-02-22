import Handle from "./js/handle";
import echarts from "echarts";
import Immutable, { Map, is } from "immutable";
import defaultOption from "./js/defaultCfg";
import $ from "jquery";

class ChartDot extends Handle {
    static cname = "大数据散点图";
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
        /* if (Object.keys(chartDefinition.data).length > 0) {
            this._handleData(
                chartDefinition.data,
                this._option,
                chartDefinition.option,
                drillName
            );
        }
 */
        /*本注释*/
        /*if(nextCfg.option && Object.keys(nextCfg.option).length === 1 && nextCfg.option.clickEvent){
      this.handleDefinition(chartDefinition);
    }*/

        //处理样式操作的和代码注入合成option
        this._option = this._handleOption(this._option);
        // this.__option = this.__option || Immutable.fromJS(this._option).toJS();
        return this._option;
    }

    dispatchDefinition(type, value, drillName) {
        const chartDefinition = this.cfg.chartDefinition;
        switch (type) {
            case "data":
                chartDefinition.data = value;
                // this._option = this._handleData(value, this._option,chartDefinition.option,drillName);
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
        if (
            !query.type ||
            !data.resultset ||
            (query.type === "sql" && !this._checkSql(data))
        ) {
            this.echartsDom.clear();
            return false;
        }
        // this._bindCsv();
        this.echartsDom.clear();
        this.echartsDom.setOption(this._option, true);
        // this.echartsDom.resize();
    }
    destroy() {
        this.echartsDom.dispose();
        // this.dom.removeEventListener('change',() => {});
        // this.cfg.htmlObj.removeChild(this.dom)
    }
}
export default ChartDot;
