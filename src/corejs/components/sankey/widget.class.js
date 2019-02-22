import Handle from "./js/handle";
import echarts from "echarts";
import defaultOption from "./js/defaultCfg";

class Sankey extends Handle {
    static cname = "桑基图";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }

    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this._option = defaultOption();
        this.drawCount = 0;
        this.handleDefinition(cfg.chartDefinition);
        this.echartsDom = echarts.init(this.htmlObj);
        this.htmlObj.style.overflow = "hidden";
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
    handleDefinition(nextCfg) {
        //处理返回data和样式等  制作赋值操作
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
        const chartDefinition = this.cfg.chartDefinition;

        if (Object.keys(chartDefinition.data).length > 0) {
            this.handleData();
        }

        //处理样式操作的和代码注入合成option
        this._option = this._handleEnumOption(
            this._option,
            chartDefinition.option,
            this.htmlObj
        );
        return this._option;
    }

    dispatchDefinition(type, value, drillName) {
        const chartDefinition = this.cfg.chartDefinition;
        switch (type) {
            case "data":
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
        this.echartsDom.resize();
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
export default Sankey;
