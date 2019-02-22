import WidgetBase from "corejs/components/base";
import Immutable, { Map, is } from "immutable";
import _ from "lodash";
import Util from "corejs/util/util";
import { toASCII } from "punycode";
import $ from "jquery";

/**
 * 将数据进行重新构建，适用于绑定数据集类型的数据源
 * @param {Number} xIndex data中每行数据x对应index
 * @param {Array} yIndexs data中每行数据y对应index集合
 * @param {Number} seriesIndex data中每行数据series对应index
 * @param {Array} data [[],[],[],...] response data
 * @param {Object} cellsConfig 组件绑定数据集，字段分组集详细配置信息
 * @return {Object} {xValues,yKeys,yNames,data: newData}
 */
const rebuildData = (
    xIndex,
    yIndexs = [],
    seriesIndex,
    data = [],
    cellsConfig
) => {
    //x的值集合
    let xValues = [];
    //y的key集合，结合x构造新数据的结构
    let yKeys = [];
    //y的名称集合，和yKeys对应。用作图例
    let yNames = [];
    //系列的值集合
    let seriesValues = [];
    //新的数据
    let newData = [];
    //数据扁平化
    let tmpData = {};
    //是否配置了系列
    let hasSeries = typeof seriesIndex !== undefined && seriesIndex !== null;

    //数据遍历，对数据扁平化，及生成xValues seriesValues yNames yKeys
    data.forEach(v => {
        let xValue = v[xIndex];
        let seriesValue;

        //x当前值不存在，将系列的值写入xValues
        xValues.indexOf(xValue) === -1 && xValues.push(xValue);

        //如果配置了系列，且当前值不存在，将系列的值写入seriesValues
        if (hasSeries) {
            seriesValue = v[seriesIndex];
            seriesValues.indexOf(seriesValue) === -1 &&
                seriesValues.push(seriesValue);
        }

        //idx表示在查询参数中的位置，表示在cellsConfig.yAxis.fields中的位置
        yIndexs.forEach((idx, i) => {
            let yValue = v[idx];
            let field = cellsConfig.yAxis.fields[i];
            let name = field.config.cellName || field.field.name;
            let yName;
            let yKey = hasSeries ? [seriesValue, idx].join("~") : idx;
            //将数据集扁平化，key的格式为[x_series_yIndex]
            let key = [xValue, yKey].join("~");

            if (hasSeries) {
                yKey = [seriesValue, idx].join("~");
                yName = [seriesValue, name].join("~");
            } else {
                yKey = idx;
                yName = name;
            }

            if (yKeys.indexOf(yKey) === -1) {
                yKeys.push(yKey);
                yNames.push(yName);
            }
            //写入单条扁平化数据
            tmpData[key] = yValue;
            tmpData[key] = Util.formatData2Num(
                tmpData[key],
                cellsConfig.yAxis.fields[i].config
            );
        });
    });

    //xValues和yKeys元素进行组合，构建新的数据结构
    yKeys.forEach(yKey => {
        let _data = [];
        xValues.forEach(xValue => {
            let key = [xValue, yKey].join("~");
            _data.push(tmpData[key] || 0);
        });
        newData.push(_data);
    });

    return {
        xValues,
        yKeys,
        yNames,
        data: newData
    };
};

export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);

        /**
         * 当为绑定数据集数据源，且含有下钻字段组，对下钻信息进行缓存
         * drillData           {Object}  下钻缓存信息对象
         * drillData.cellKey   {String}  下钻分组的valueKey
         * drillData.nextIdx   {Number}  对应将下钻字段在分组中的index
         * drillData.value     {Array}   记录当前下钻层级前置条件value集合，值在集合中顺序和字段组中所在index对应
         */
        this.drillData = null;
    }

    /**
     * 需重写doQuery，当不存在参数drillData时，对于this.drillData清空
     */
    doQuery() {
        if (!arguments[2]) {
            //缓存下钻信息清除
            this.drillData = null;
        }
        return super.doQuery(...arguments);
    }

    /**
     * 数据集类型数据源下钻，drillData具体结构参见constructor对于this.drillData的说明
     * @param {Object} e 事件参数
     */
    datasetDrill(e) {
        const { cellsConfig } = this.cfg.chartDefinition.query.datasetSetting;
        const { xAxis } = cellsConfig;
        const xAxisFields = xAxis.fields;
        let nextIdx; //下一层

        //不足两个不能下钻
        if (xAxisFields.length < 2) {
            return;
        }

        //如果不存在，初始化 drillData
        if (this.drillData === null) {
            this.drillData = {
                cellKey: "xAxis",
                nextIdx: 0,
                value: []
            };
        }

        nextIdx = this.drillData.nextIdx + 1;

        //不存在下一级了
        if (!xAxisFields[nextIdx]) {
            return;
        }

        //下钻参数值记录
        this.drillData.value[this.drillData.nextIdx] = e.name;

        //将index指向下一层级
        this.drillData.nextIdx = nextIdx;

        //执行查询
        this.doQuery(null, false, this.drillData);
    }

    //事件绑定
    _bindClickEvent() {
        this.echartsDom.on("click", e => {
            const chartDefinition = this.cfg.chartDefinition;
            const params = chartDefinition.option.clickParmas;
            switch (chartDefinition.option.clickEvent) {
                case "drill":
                    // this._option.legend.selected = {}; //点击下转  重置图例状态
                    /* let { query } = chartDefinition;
                    let queryType = query.type;
                    if (queryType === "dataset") {
                        this.datasetDrill(e);
                    } else { */
                    this.handleDefinition(chartDefinition, e.name);
                    this.draw();
                    // }
                    break;
                case "interact":
                    var _params = Immutable.fromJS(params).toJS();
                    _params.category.value = e.name;
                    _params.series.value = e.seriesName;
                    _params.value.value = e.data;
                    var thisparam = Object.values(_params).filter(el =>
                        /param/.test(el.id)
                    );
                    // Immutable
                    const globalParam = window.Dashboard.globalParam;
                    globalParam.updateParams(thisparam);
                    break;
                default:
                    break;
            }
        });
    }
    //初始化图表的数据
    _initOption() {
        const { util } = window.Dashboard;
        const { defaultOption } = this.cfg.chartDefinition;
        let thisOption = util.copy(true, {}, defaultOption, this._option);
        util.copy(true, this._option, thisOption);
    }
    /**
     * @discripte 处理样式操作的option
     * @param     {[type]}  option [description]
     * @return    {[type]}         [description]
     */
    _handleOption(option) {
        //处理option
        const chartDefinition = this.cfg.chartDefinition;
        //处理样式操作数据
        this._option = this._handleEnumOption(
            chartDefinition.option,
            this._option,
            this.htmlObj
        );
        this._customizeBar(option, this.htmlObj, chartDefinition.option); //xy轴间距调整
        //处理预警
        this._handlewarn(
            chartDefinition.option.warns,
            option,
            chartDefinition.data,
            chartDefinition.option.orientation,
            chartDefinition.option.stack
        );
        //处理代码注入数据
        // this._option = handleChart.handleInjectOption(chartDefinition.injectOption,this._option);
        return this._option;
    }
    /**
     * @discripte 处理可枚举属性
     * @param     {[type]}  store   [枚举属性对象]
     * @param     {[type]}  option  [图标的option]
     * @param     {[type]}  htmlObj [图表的dom对象]
     * @return    {[type]}          [处理后的option]
     */
    _handleEnumOption(store, option, htmlObj) {
        //xy轴互相转换  需要在最初执行
        let orientationVal = store["orientation"];
        if (orientationVal && option["orientation"] != orientationVal) {
            option["orientation"] = orientationVal;
            // if (option.series[0].xAxisIndex) {
            option.series[0].xAxisIndex = (option.series[0].xAxisIndex + 1) % 2;
            option.series[0].yAxisIndex = (option.series[0].yAxisIndex + 1) % 2;
            // }
            [option.xAxis, option.yAxis] = [option.yAxis, option.xAxis];
        }

        for (let item in store) {
            this._handlePerStore(item, store[item], option, htmlObj, store);
        }
        //处理图例
        const chartDefinition = this.cfg.chartDefinition;
        this._handleExample(
            chartDefinition.option.example,
            this._option,
            // document.getElementById(this.cfg.id),
            this.htmlObj,
            chartDefinition.option
        );
        //更改颜色
        option.series.forEach((e, i) => {
            e.itemStyle = e.itemStyle || { normal: {} };
            if (i) {
                e.itemStyle.normal.color = store.color[i - 1];
            }
        });
        return option;
    }

    /**
     * @discripte 处理属性
     * @param     {[type]}  item      [枚举字段]
     * @param     {[type]}  value     [枚举值]
     * @param     {[type]}  option    [图表option]
     * @param     {[type]}  htmlObj   [图表外层dom]
     * @param     {[type]}  ownOption [枚举对象]
     * @return    {[type]}            [description]
     */
    _handlePerStore(item, value, option, htmlObj, ownOption) {
        switch (item) {
            //标题
            case "title":
                //用rich 是因为 要给标题设置背景颜色
                option.title.z = -2;
                option.title.padding = [0, 0, 0, 5];
                option.title.text = `{a|${value}}`;
                option.title.textStyle.rich.a = {
                    lineHeight: 40,
                    fontSize: 16,
                    width: 10000
                };
                break;
            //标题位置
            case "titlePosition":
                option.title.left = value;
                break;
            //标题颜色
            case "titleBackgroundColor":
                option.title.backgroundColor = value || "transparent";
                if (this.cfg.chartDefinition.option.title === "") {
                    option.title.backgroundColor = "transparent";
                }
                break;
            //是否导出数据
            case "isExportData":
                Dashboard.lib
                    .$("#" + this.cfg.id + " .chartCsv")
                    .css({ display: value ? "block" : "none" });
                break;
            //是否显示数据
            case "showData":
                for (let i of option.series) {
                    if (i.tag) continue;
                    i.label.normal.show = value;
                }
                break;
            //是否显示网格线
            case "gridLine":
                if (
                    option["orientation"] === "vertical" ||
                    !option["orientation"]
                ) {
                    for (let i of option.yAxis) {
                        if (i.tag) continue;
                        i.splitLine.show = value;
                    }
                } else {
                    for (let i of option.xAxis) {
                        if (i.tag) continue;
                        i.splitLine.show = value;
                    }
                }
                break;
            //图表颜色
            case "color":
                if (value.length > 0) {
                    option.color = value;
                }
                break;
            //基线
            case "baseLine":
                let obj = null;
                if (ownOption[item] === "average") {
                    obj = {
                        data: [{ type: "average" }]
                    };
                    if (ownOption["orientation"] === "vertical") {
                        option.grid.right += 30;
                    } else {
                        option.grid.top += 8;
                    }
                }
                if (/^\d+$/.test(ownOption[item] + "")) {
                    if (ownOption["orientation"] === "vertical") {
                        obj = {
                            data: [{ yAxis: ownOption[item] }]
                        };
                    } else {
                        obj = {
                            data: [{ xAxis: ownOption[item] }]
                        };
                    }
                    let s1 = ownOption[item].toString().split(".")[0];
                    let s2 = ownOption[item].toString().split(".")[1];
                    let l = s1.length + (s2 ? s2.slice(0, 2).length : 0);
                    if (ownOption["orientation"] === "vertical") {
                        option.grid.right += l * 8;
                    } else {
                        option.grid.top += 8;
                    }
                }
                for (let i of option.series) {
                    if (i.tag) continue;
                    i.markLine = obj;
                }
                break;
            //刻度线
            case "axisTick":
                for (let i of option.xAxis) {
                    i.axisTick.show = ownOption[item];
                }
                for (let i of option.yAxis) {
                    i.axisTick.show = ownOption[item];
                }
                break;
            //值轴标题
            case "axisTitle":
                if (ownOption["orientation"] === "vertical") {
                    for (let i of option.yAxis) {
                        i.name = ownOption[item];
                    }
                } else {
                    for (let i of option.xAxis) {
                        i.name = ownOption[item];
                    }
                }
                break;
            //柱状背景
            case "barBg":
                option.series[0].itemStyle.normal.opacity = ownOption[item]
                    ? 1
                    : 0;
                let arr = [],
                    stackArr = option.series[1]
                        ? new Array(option.series[1].data.length).fill(0)
                        : [0],
                    num = 0,
                    maxNum,
                    stackMaxNum;
                option.series.map(i => {
                    if (i.tag || i.type !== "bar") return;
                    for (let j = 0; j < i.data.length; j++) {
                        stackArr[j] = stackArr[j] + i.data[j];
                    }
                    num = Math.max.apply(this, i.data);
                    arr.push(num);
                });
                stackMaxNum =
                    Math.ceil((Math.max.apply(this, stackArr) / 100) * 105) ||
                    1;
                maxNum =
                    Math.ceil((Math.max.apply(this, arr) / 100) * 105) || 1;
                option.series[0].data = option.series[1]
                    ? new Array(option.series[1].data.length).fill(
                          ownOption["stack"] ? stackMaxNum : maxNum
                      )
                    : [];
                break;
            //是否堆叠
            case "stack":
                let arrNum = [];
                let stackMax;
                let lineNum = [];
                if (ownOption[item]) {
                    for (let i of option.series) {
                        if (i.tag || i.type !== "bar") continue;
                        i.stack = i.type;
                        for (let j = 0; j < i.data.length; j++) {
                            arrNum[j] = (arrNum[j] ? arrNum[j] : 0) + i.data[j];
                        }
                    }
                    stackMax = Math.max.apply(null, arrNum);
                    if (ownOption["linestack"]) {
                        for (let i of option.series) {
                            if (i.tag || i.type !== "line") continue;
                            for (let j = 0; j < i.data.length; j++) {
                                lineNum[j] =
                                    (lineNum[j] ? lineNum[j] : 0) + i.data[j];
                            }
                        }
                    } else {
                        for (let i of option.series) {
                            if (i.tag || i.type !== "line") continue;
                            lineNum.push(Math.max.apply(null, i.data));
                        }
                    }
                    stackMax =
                        stackMax > Math.max.apply(null, lineNum)
                            ? stackMax
                            : Math.max.apply(null, lineNum);
                    if (ownOption["orientation"] === "vertical") {
                        option.yAxis[0].max = parseInt(stackMax, 10);
                    } else {
                        option.xAxis[0].max = parseInt(stackMax, 10);
                    }
                }
                break;
            //柱子样式
            case "itemStyle":
                let radius = parseInt(ownOption[item], 10),
                    r;
                if (ownOption["orientation"] === "vertical")
                    r = [radius, radius, 0, 0.01];
                else r = [0, radius, radius, 0.01];
                if (ownOption["stack"]) {
                    for (let i of option.series) {
                        if (i.tag) continue;
                        i.itemStyle.normal.barBorderRadius = [0, 0, 0, 0.01];
                    }
                    for (let j = option.series.length - 1; j >= 0; j--) {
                        if (option.series[j].type !== "bar") continue;
                        option.series[j].itemStyle.normal.barBorderRadius = r;
                        break;
                    }
                } else {
                    for (let i of option.series) {
                        if (i.tag) continue;
                        i.itemStyle.normal.barBorderRadius = r;
                    }
                }
                break;
            //标线
            case "markLine":
                let data = option.series.filter(function(item) {
                    return item.tag == undefined;
                });
                let fn;
                if (ownOption[item] === "mAverage") {
                    fn = this.mAverage;
                } else if (ownOption[item] === "wmAverage") {
                    fn = this.wmAverage;
                } else if (ownOption[item] === "line") {
                    fn = this.lineFn;
                }
                option.legend.data = option.legend.data.filter(
                    e => typeof e !== "object"
                );
                option.series = option.series.filter(
                    e => !/-趋势线/.test(e.name)
                );
                if (fn) {
                    for (let i of data) {
                        var list = {
                            name: i.name + "-趋势线",
                            tag: true,
                            type: "line",
                            smooth: true,
                            symbolSize: 1,
                            data: fn(i.data)
                        };
                        option.legend.data.push({ name: list.name, iii: "11" });
                        option.series.push(list);
                    }
                }
                break;
            //背景颜色
            case "backgroundColor":
                if (value) {
                    $(htmlObj).css("backgroundColor", value);
                }
                if (this.cfg.parentId) {
                    $(htmlObj).css("backgroundColor", "rgba(0, 0, 0, 0)");
                }
                break;
            //文字颜色
            case "textColor":
                if (value.length > 0) {
                    //设置主要颜色
                    option.title.textStyle.color = value[0];
                    //设置次要颜色
                    //图例颜色
                    value[1] && (option.legend.textStyle.color = value[1]);
                    // 刻度文字、坐标名字
                    value[1] &&
                        (function(axises, option, value) {
                            axises.forEach(axise => {
                                option[axise].forEach(axis => {
                                    //坐标名字颜色
                                    axis.axisLine.nameTextStyle.color = value;
                                    //坐标刻度文字颜色
                                    axis.axisLabel.color = value;
                                });
                            });
                        })(["xAxis", "yAxis"], option, value[1]);
                }
                break;
            //线条颜色
            case "lineColor":
                if (value.length > 0) {
                    (function(axises, option, value) {
                        axises.forEach(axise => {
                            option[axise].forEach(axis => {
                                value[0] &&
                                    (axis.axisLine.lineStyle.color = value[0]);
                                value[1] &&
                                    (axis.splitLine.lineStyle.color = value[1]);
                            });
                        });
                    })(["xAxis", "yAxis"], option, value);
                }
                break;
            default:
                break;
        }
    }

    /**
     * @discripte //设置grid
     * @param     {[type]}  option  [图表option]
     * @param     {[type]}  htmlObj [图表外层dom]
     * @param     {[type]}  store   [图表枚举对象]
     * @return    {[type]}          [description]
     */
    _customizeBar(option, htmlObj, store) {
        let width = parseInt(htmlObj.clientWidth, 10),
            height = parseInt(htmlObj.clientHeight, 10);
        let offsetY,
            offsetYHeight,
            offsetX,
            offsetXLenght,
            offsetMaxLenght,
            xNameLength,
            yNameLength;
        let chartOption = option;
        if (store.orientation === "vertical") {
            chartOption.yAxis[0].minInterval =
                chartOption.series[0].data[0] / 4;
            offsetY = this.getMaxLength(chartOption.series[0].data);
            offsetYHeight = 5;
            //获取x总长
            offsetX = this.getSumLength(
                chartOption.xAxis[0].data
            ) /* + option.grid.left + */;
            offsetXLenght = chartOption.xAxis[0].data.length;
            offsetMaxLenght = this.getMaxLength(chartOption.xAxis[0].data);
            yNameLength =
                chartOption.yAxis[0].name &&
                chartOption.yAxis[0].name.length > 0
                    ? 10
                    : 0;
            xNameLength = 0;
            chartOption.yAxis[0].nameGap = offsetY + 20;
        } else {
            // chartOption.xAxis[0].max = Math.ceil(getMaxNum(chartOption.series));
            chartOption.xAxis[0].minInterval =
                chartOption.series[0].data[0] / 4;
            offsetY = this.getMaxLength(chartOption.yAxis[0].data);
            offsetYHeight = chartOption.yAxis[0].data.length;
            offsetX = (chartOption.series[0].data[0] + "").length * 4;
            offsetXLenght = chartOption.series[0].data.length;
            offsetMaxLenght = this.getMaxLength(chartOption.series[0].data);
            xNameLength =
                chartOption.xAxis[0].name &&
                chartOption.xAxis[0].name.length > 0
                    ? 10
                    : 0;
            yNameLength = 0;
        }
        chartOption.grid.left += offsetY + yNameLength + 10;
        chartOption.grid.bottom += xNameLength;
        /* //x轴
        if (offsetX >= width) {
            chartOption.xAxis[0].axisLabel.rotate = "45";
            let o =
                (width - chartOption.grid.left - chartOption.grid.right) /
                offsetXLenght;
            chartOption.xAxis[0].axisLabel.interval = Math.floor(12 / o);
            chartOption.grid.bottom += Math.ceil(offsetMaxLenght / 1.5);
        } else {
            chartOption.xAxis[0].axisLabel.interval = 0;
            chartOption.xAxis[0].axisLabel.rotate = "0";
            // chartOption.grid.bottom += 20;
        } */
        if (offsetMaxLenght >= (width - offsetY - 100) / offsetXLenght) {
            chartOption.xAxis[0].axisLabel.rotate = "45";
            let o =
                (width - chartOption.grid.left - chartOption.grid.right) /
                offsetXLenght;
            chartOption.xAxis[0].axisLabel.interval = Math.floor(12 / o);
            chartOption.grid.bottom += Math.ceil(offsetMaxLenght / 1.5);
        } else {
            chartOption.xAxis[0].axisLabel.interval = 0;
            chartOption.xAxis[0].axisLabel.rotate = "0";
        }
        if (store.orientation !== "vertical") {
            chartOption.xAxis[0].nameGap = Math.ceil(offsetMaxLenght / 1.8);
        }
        chartOption.yAxis[0].axisLabel.interval = "auto";
        chartOption.yAxis[0].axisLabel.rotate = "0";
    }

    /**
     * @discripte 处理图例位置
     * @param     {[type]}  value       [图例位置值]
     * @param     {[type]}  chartOption [图表option]
     * @param     {[type]}  htmlObj     [图表外层对象]
     * @param     {[type]}  ownOption   [枚举对象]
     * @return    {[type]}              [description]
     */
    _handleExample(value, chartOption, htmlObj, ownOption) {
        chartOption.legend.top = "auto";
        chartOption.legend.right = "auto";
        chartOption.legend.left = "auto";
        chartOption.legend.bottom = "auto";
        chartOption.legend.orient = "horizontal";
        chartOption.legend.show = true;
        chartOption._grid =
            chartOption._grid || Object.assign({}, chartOption.grid);
        chartOption.grid = Object.assign({}, chartOption._grid);
        var option = {
            chartOption: chartOption,
            height: parseInt(htmlObj.clientHeight, 10),
            width: parseInt(htmlObj.clientWidth, 10),
            type: "line"
        };
        option.chartOption.legend.type = "scroll";
        chartOption.grid.top = ownOption.title.length ? 45 : 5;
        switch (value) {
            case "null":
                chartOption.legend.show = false;
                chartOption.grid.bottom += 24;
                break;
            case "top":
                chartOption.legend.top = ownOption.title.length > 0 ? 40 : 10;
                chartOption.legend.left = "center";
                chartOption.grid.top += 24;
                chartOption.grid.bottom += 24;
                break;
            case "left":
                chartOption.legend.top = chartOption.grid.top;
                chartOption.legend.left = 20;
                chartOption.legend.orient = "vertical";
                chartOption.grid.bottom += 24;
                break;
            case "right":
                chartOption.legend.top = chartOption.grid.top;
                chartOption.legend.right = 20;
                chartOption.legend.orient = "vertical";
                chartOption.grid.bottom += 24;
                break;
            case "bottom":
                chartOption.legend.bottom = 10;
                chartOption.legend.left = "center";
                chartOption.grid.bottom += 44;
                break;
            default:
                break;
        }
        this._lengendFn(option, value);
    }
    /**
     * @discripte 图例再处理
     * @param     {[type]}  option [图表option和图表宽高的对象]
     * @param     {[type]}  type   [图表图例位置]
     * @return    {[type]}         [description]
     */
    _lengendFn(option, type) {
        var datas = option.chartOption.legend.data;
        if (!datas.length) {
            return false;
        }
        var yh = option.height;
        var xh = option.width;
        var selflen = {};
        var aa;
        switch (type) {
            case "left":
                option.chartOption.legend.bottom = 30;
                selflen.maxLeg = this.getLabelMaxLength(datas);
                aa =
                    /* this.measureTextWidth(selflen.maxLeg.maxValue) */ 90 +
                    10;
                option.chartOption.grid.left += aa;
                this._setlegendTooltip();
                break;
            case "right":
                option.chartOption.legend.bottom = 30;

                selflen.maxLeg = this.getLabelMaxLength(datas);
                aa =
                    /* this.measureTextWidth(selflen.maxLeg.maxValue) */ 90 +
                    10;
                option.chartOption.grid.right += aa;
                this._setlegendTooltip();
                break;
            case "top":
                selflen._length = datas.reduce((a, b) => {
                    return (
                        (typeof a != "number" ? this.measureTextWidth(a) : a) +
                        80 +
                        this.measureTextWidth(b)
                    );
                });
                /* if (selflen._length > xh - 50) {
                    option.chartOption.legend.left = 30;
                    option.chartOption.legend.right = 30;
                } */
                option.chartOption.legend.width = xh - 60;
                break;
            case "bottom":
                selflen._length = datas.reduce((a, b) => {
                    return (
                        (typeof a != "number" ? this.measureTextWidth(a) : a) +
                        80 +
                        this.measureTextWidth(b)
                    );
                });
                /* if (selflen._length > xh - 50) {
                    option.chartOption.legend.left = 30;
                    option.chartOption.legend.right = 30;
                } */
                option.chartOption.legend.width = xh - 60;
                break;
            default:
                break;
        }
    }

    /**
     * 使用canvas 测量字符所占长度
     * @param {*} text
     * @param {*} fontSize
     */
    measureTextWidth(text, fontSize = 12) {
        let ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${fontSize}px Arial`;
        return ctx.measureText(text).width;
    }
    /**
     * 找出字符最长的一个
     * @param {*} arr
     */
    getLabelMaxLength(arr = []) {
        let maxLength = 0,
            maxIndex = 0;
        let tempArr = arr.map(el => {
            let str = el + "".trim(),
                strLen = 0;
            for (let i = 0, len = str.length; i < len; i++) {
                if (str[i].charCodeAt(i) > 256) {
                    strLen += 3;
                } else {
                    strLen++;
                }
            }
            return strLen;
        });
        //找到最大值 和 对应索引
        maxLength = Math.max.apply(Array, tempArr);
        if (maxLength) {
            maxIndex = tempArr.indexOf(maxLength);
        }
        return {
            maxLength,
            maxIndex,
            maxValue: arr[maxIndex]
        };
    }
    tArr(arr = []) {
        return arr.filter(function(item) {
            return typeof item == "number" || typeof item == "string";
        });
    }
    getMaxLength(arr = []) {
        arr = this.tArr(arr);
        let array = arr.map(function(item) {
            if (typeof item == "number") {
                return Math.ceil(item) + "";
            } else if (typeof item == "string") {
                return item + "";
            }
        });
        var len = {},
            aa = 0;
        if (array.length) {
            len.maxLeg = this.getLabelMaxLength(arr);
            aa = this.measureTextWidth(len.maxLeg.maxValue);
        }
        return aa;
    }
    getSumLength(arr = []) {
        arr = this.tArr(arr);
        let array = arr.map(function(item) {
            return (item + "").length;
        });
        return (
            array.reduce(function(pre, next) {
                return pre + next;
            }, 0) * 8
        );
    }
    /**
     * 处理预警
     * @param {*} warn 预警字段
     * @param {*} option 图表配置项
     * @param {*} data 图表数据
     */
    _handlewarn(warn, option, data, orientation, stack) {
        if (!data.metadata || !this._legendSerise || !warn.switch) {
            return false;
        }
        //拷贝series
        let selfOption = Immutable.fromJS(option).toJS();
        //是否是堆叠处理
        if (stack) {
            selfOption.series
                .filter(e => e.type === "bar")
                .forEach((e, i) => {
                    e.data.forEach((item, ind) => {
                        if (i > 1) {
                            e.data[ind] += selfOption.series[i - 1].data[ind];
                        }
                    });
                });
        }
        warn.seriesList = this._legendSerise;
        this.dispatch("seriesListChange", this._legendSerise);
        let _warn = {};
        warn.value.forEach(e => {
            e.series.length && (_warn[e.series] = e);
        });
        let _series = Object.values(_warn);
        let _orientation = orientation === "vertical" ? 0 : 1;
        if (_series.length) {
            option.series.forEach((e, ind) => {
                let selfSeries = _series.find(ee => e.name === ee.series);
                selfSeries &&
                    e.data.forEach((item, i) => {
                        let _item = selfOption.series[ind].data[i];
                        if (
                            typeof item === "number" &&
                            new Function(
                                "",
                                "return " +
                                    item +
                                    selfSeries.filter +
                                    selfSeries.value
                            )()
                            // eval(item + selfSeries.filter + selfSeries.value)
                        ) {
                            if (selfSeries.markType) {
                                e.markPoint = e.markPoint || {
                                    symbol: "pin",
                                    data: [],
                                    itemStyle: {}
                                };
                                e.markPoint.itemStyle.color = selfSeries.color;
                                e.markPoint.data.push({
                                    name: "某个坐标",
                                    valueIndex: _orientation,
                                    coord: !_orientation
                                        ? [i, _item]
                                        : [_item, i]
                                });
                            }
                            e.data[i] = {
                                value: item,
                                itemStyle: {
                                    normal: { color: selfSeries.color }
                                }
                            };
                        }
                    });
            });
        }
    }
    /**
     * 柱状图对查询相应数据处理
     *
     * 个数 x轴：xAxisIdx[1] y轴：yAxisIdx[1-4] 系列：seriesIdx[0-1]
     */
    /* _handleDataSetData() {
        let option = this._option;
        let { data, query } = this.cfg.chartDefinition;
        let { metadata, resultset } = data;
        let { datasetSetting } = query;
        let { cellToInd, cellsConfig } = datasetSetting;

        if (!cellToInd || !resultset || resultset.length === 0) {
            return option;
        }

        let seriesIdx = cellToInd.series;
        let xAxisIdx = cellToInd.xAxis;
        let yAxisIdx = cellToInd.yAxis;

        //当不存在x轴和y轴字段时候，字段个数不满足，不处理
        if (!xAxisIdx.length || !yAxisIdx.length) {
            return option;
        }

        xAxisIdx = xAxisIdx[0];

        seriesIdx = seriesIdx.length ? seriesIdx[0] : null;

        let relData = rebuildData(
            xAxisIdx,
            yAxisIdx,
            seriesIdx,
            resultset,
            cellsConfig
        );
        let legend = relData.yNames;

        option.tooltip.formatter = function(e) {
            let t = 0;
            cellsConfig.yAxis.fields.forEach((item, i) => {
                if (e.seriesName.indexOf(item.config.cellName) !== -1) {
                    t = i;
                    return;
                }
            });

            var content = e.seriesName + "<br/>";
            let dataHandle = cellsConfig.yAxis.fields[t].config.dataHandle || {
                model: "auto"
            };
            dataHandle.formatMask =
                cellsConfig.yAxis.fields[t].field.formatMask;
            e.data = Util.formatData2Str(e.data, dataHandle);
            content += e.name + "：" + e.data + "<br/>";
            return content;
        };

        //用于预警配置，将图例值集合写入_legendSerise
        this._legendSerise = legend;

        this.setChartData(option, relData.xValues, relData.data, legend);

        return option;
    } */
    //数据集数据
    _handleDataSetData(drillName) {
        const { chartDefinition } = this.cfg;
        let option = this._option,
            ownOption = chartDefinition.option,
            data = chartDefinition.data,
            dataObj = { legend: [], data: [] };
        let ownData = Immutable.fromJS(data).toJS();
        if (is(Map(ownData), Map({}))) return option;
        //当有数据的时候执行以下逻辑 xAxis X轴 series系列 yAxis柱状指标
        const { cellToInd } = chartDefinition.query.datasetSetting;
        const { util } = window.Dashboard;
        if (!ownData.metadata) {
            util.popTips("WARING", "数据格式错误");
            option.series.map(e => {
                e.data = [];
            });
            return option;
        }
        this._drilName = drillName;
        let _data = this._grupDataSet();
        this.getDatasetData(_data, ownData, cellToInd, ownOption, drillName);
    }
    /**
     *
     * @param {Obj} data 处理数据集下转与否
     */
    _handleBarAndChart(data) {
        const {
            _data, //数据分类的数据
            ownOption, //枚举属性
            chartOption, //图标的option
            barCount, //数据集合
            _barCount, //对应的数据配置
            lineOrBar, //直线还是柱子
            legend, //图例数组
            temp, //目标series
            selfObj, //当有系列的时候的数据
            cellsConfig, //数据配置
            xilie //系列数组
        } = data;
        if (!_data[lineOrBar].length) {
            return false;
        }
        var _barArr, lent, changeData;
        if (!xilie) {
            _barArr = _data.xAxis.map((e, i) => {
                return e.concat(_data[lineOrBar][i]);
            });
            lent = _data.xAxis[0].length;
            //获取图例数据
            changeData = this.getChangeData(
                _barArr,
                barCount.map((e, i) => lent + i),
                ownOption
            );
        } else {
            changeData = this.getChangeData(selfObj.ddr, barCount, ownOption);
        }

        var axisData = changeData.axisData; //获取横坐标 lebal
        var zipData = changeData.zipData;
        var drillName = this.drillName;
        var axisDataFilter = [],
            zipDataFilter = [];
        if (ownOption.clickEvent === "drill") {
            var indexes = [];
            if (!drillName) {
                for (let i = 0; i < axisData.length; i++) {
                    if (!axisData[i].includes("~")) {
                        indexes.push(i);
                    }
                }
            } else {
                for (let i = 0; i < axisData.length; i++) {
                    if (!axisData[i].includes(drillName)) continue;
                    var str = axisData[i].split(drillName)[1];
                    var regex = new RegExp("~", "g");
                    var result = str.match(regex);
                    var count = !result ? 0 : result.length;
                    if (count === 1) indexes.push(i);
                }
            }
            if (indexes.length === 0) {
                let indArr = [];
                axisDataFilter = axisData.filter((el, ind) => {
                    if (el.split("~").length === 1) {
                        indArr.push(ind);
                        return true;
                    }
                });
                zipDataFilter = zipData.filter((el, ind) =>
                    indArr.includes(ind)
                );
            } else {
                axisDataFilter = axisData.filter(function(item, i) {
                    return indexes.includes(i);
                });
                zipDataFilter = zipData.filter(function(item, i) {
                    return indexes.includes(i);
                });
            }
        } else {
            this._drilName = false;
            //柱状指标
            axisDataFilter = axisData;
            zipDataFilter = zipData;
        }
        chartOption.xAxis.forEach(e => (e.data = axisDataFilter));
        if (!xilie) {
            //无系列
            barCount.forEach((e, i) => {
                var _name = _barCount[i].config.cellName;
                var obj = Immutable.fromJS(temp).toJS();
                lineOrBar === "lineCount" && (obj.type = "line");
                obj.name = _name;
                legend.push(_name);
                obj.data = zipDataFilter.map(ee => {
                    let d = Util.formatData2Num(
                        ee[i],
                        cellsConfig[lineOrBar].fields[i].config
                    );
                    return d;
                });
                chartOption.series.push(obj);
            });
        } else {
            //有系列
            selfObj.xilie.map((e, i) => {
                var _name = e;
                var obj = Immutable.fromJS(temp).toJS();
                lineOrBar === "lineCount" && (obj.type = "line");
                obj.name = _name;
                legend.push(_name);
                obj.data = zipDataFilter.map(ee => {
                    var cc = cellsConfig[lineOrBar].fields;
                    let d = Util.formatData2Num(
                        ee[i],
                        cc[i % cc.length].config
                        /* cellsConfig[lineOrBar].fields[
                            i % cellsConfig[lineOrBar].fields.length
                        ].config.dataHandle */
                    );
                    return d;
                });
                chartOption.series.push(obj);
            });
        }
    }
    /**
     * 梳理数据及数据
     * @param {Object} _data 数据分类
     * @param {object} ownData 查询回来的数据
     * @param {obj} cellToInd 数据各自的下标
     * @param {obj} ownOption 对应option
     * @param {str} drillName 下转类名
     */
    getDatasetData(_data, ownData, cellToInd, ownOption, drillName) {
        const { defaultOption } = this.cfg.chartDefinition;
        const { xAxis, series, yAxis } = cellToInd;
        const { cellsConfig } = this.cfg.chartDefinition.query.datasetSetting;
        let _barCount = cellsConfig.yAxis.fields;
        var barCount = yAxis;
        // let _lineCount = cellsConfig.lineCount.fields;
        const { metadata, resultset } = ownData;
        let chartOption = this._option,
            legend = [],
            legendObj = {};
        var templateData = Immutable.fromJS(defaultOption.series[0]).toJS();
        var temp = {
            name: "",
            type: "bar",
            data: [],
            label: {
                normal: {
                    show: false
                }
            },
            markLine: {},
            itemStyle: {
                normal: {
                    barBorderRadius: [0, 0, 0, 0.01]
                }
            },
            areaStyle: {
                normal: {
                    opacity: 0
                }
            }
        };
        this.drillName = drillName;
        let xAixs = Array.from(new Set(_data.xAxis.map(e => e[0])));
        chartOption.xAxis.forEach(e => (e.data = xAixs));
        chartOption.series = [templateData];
        //获取系列
        var xilie = Array.from(new Set(_data.series.map(e => e[0])));
        var _this = this;
        if (!xilie.length) {
            //柱状指标
            this._handleBarAndChart({
                _data,
                ownOption,
                chartOption,
                barCount,
                _barCount,
                lineOrBar: "yAxis",
                legend,
                temp,
                cellsConfig,
                xilie: false
            });
        } else {
            var _selfData = Immutable.fromJS(_data).toJS();
            var _selfObj = { xilie: [], barData: [], ddr: [], barIndArr: [] };
            _selfObj._xlen = _data.xAxis[0].length;

            function sst(data) {
                const { _barCount, lineOrBar, barCount } = data;
                if (!barCount.length) {
                    return;
                }
                _selfObj.barData = _data.xAxis.map((e, i) => {
                    var arr = [];
                    xilie.map((ee, ii) => {
                        arr = arr.concat(
                            ee === resultset[i][series[0]]
                                ? _data[lineOrBar][i]
                                : new Array(barCount.length).fill(null)
                        );
                        _barCount.map(itte => {
                            var str = ee + "~" + itte.config.cellName;
                            _selfObj.xilie.includes(str) ||
                                _selfObj.xilie.push(str);
                        });
                    });
                    _selfData[lineOrBar][i] = arr;
                    return e.concat(arr);
                });
                _selfObj.ddr = Array.from(
                    new Set(_data.xAxis.map(e => e.join("~")))
                ).map(e => {
                    var arr = [];
                    _selfObj.barData
                        .filter(ee => {
                            return ee.slice(0, _selfObj._xlen).join("~") === e;
                        })
                        .map(item => {
                            item.map(
                                (ite, idd) =>
                                    (arr[idd] === undefined ||
                                        arr[idd] === null) &&
                                    (arr[idd] = ite)
                            );
                        });
                    return arr;
                });

                _selfObj.barIndArr = _selfObj.barData[0]
                    .slice(_data.xAxis[0].length, _selfObj.barData[0].length)
                    .map((e, i) => i + _data.xAxis[0].length);
                _this._handleBarAndChart({
                    _data: _selfData,
                    ownOption,
                    chartOption,
                    barCount: _selfObj.barIndArr,
                    selfObj: _selfObj,
                    _barCount,
                    lineOrBar: lineOrBar,
                    legend,
                    temp,
                    cellsConfig,
                    xilie: true
                });
            }
            sst({
                _barCount,
                lineOrBar: "yAxis",
                barCount
            });
        }
        /* legend.forEach((e, i) => {
            e == null && (legend[i] = "");
        }); */
        this._legendSerise = legend;
        chartOption.legend.data = legend;
        chartOption.legend.formatter = function(param) {
            let _name = param || "-";
            _name = _name.replace(/(^null~)|(~null)/g, "");
            return _name;
        };
        chartOption.tooltip.formatter = e => {
            var content = this.pingjie(e.seriesName) + "<br/>";
            for (let item of cellsConfig.yAxis.fields) {
                if (e.seriesName.indexOf(item.field.name) !== -1) {
                    let dataConfig = item.config || {};
                    dataConfig.formatMask = item.field.formatMask;
                    e.value = Util.formatData2Str(e.value, dataConfig);
                }
            }
            content += _this.pingjie(e.name) + "：" + e.value + "<br/>";
            return content;
        };
    }
    //tooltip中的拼接
    pingjie(_name) {
        _name = _name + "" || "-";
        _name = _name.replace(/(^null~)|(~null)/g, "");
        return _name;
    }
    _checkSql() {
        var types = ["Numeric", "Integer"];
        var ownData = this.cfg.chartDefinition.data;
        const { metadata } = ownData;
        var lengendMetaData = metadata && metadata.slice(1); //第一列展示为类目轴
        var lengendIndex = this.getLengendNumericIndex(lengendMetaData || []);
        if (!lengendIndex.length) {
            return false;
        }
        return true;
    }
    //处理请求返回的data
    _handleData(drillName) {
        const { chartDefinition } = this.cfg;
        let option = this._option,
            ownOption = chartDefinition.option,
            data = chartDefinition.data;
        let ownData = Immutable.fromJS(data).toJS();
        if (is(Map(ownData), Map({}))) return option;
        const { util } = window.Dashboard;
        if (!this._checkSql()) {
            this.queryStatusDom.show("数据格式错误", false);
            return false;
        }
        var lengendMetaData = ownData.metadata.slice(1); //第一列展示为类目轴
        //获取图例名称
        var lengend = this.getLengendNumeric(lengendMetaData);
        this._legendSerise = lengend;
        //获取图例下标
        var lengendIndex = this.getLengendNumericIndex(lengendMetaData);
        //获取图例数据
        var changeData = this.getChangeData(
            ownData.resultset,
            lengendIndex,
            ownOption
        );
        this._drilName = drillName;
        var axisData = changeData.axisData; //获取横坐标 lebal
        var zipData = changeData.zipData;
        var axisDataFilter = [],
            zipDataFilter = [];
        if (ownOption.clickEvent === "drill") {
            var indexes = [];
            if (!drillName) {
                for (let i = 0; i < axisData.length; i++) {
                    if (!axisData[i].includes("~")) {
                        indexes.push(i);
                    }
                }
            } else {
                for (let i = 0; i < axisData.length; i++) {
                    if (!axisData[i].includes(drillName)) continue;
                    var str = axisData[i].split(drillName)[1];
                    var regex = new RegExp("~", "g");
                    var result = str.match(regex);
                    var count = !result ? 0 : result.length;
                    if (count === 1) indexes.push(i);
                }
            }
            if (indexes.length === 0) {
                let indArr = [];
                axisDataFilter = axisData.filter((el, ind) => {
                    if (el.split("~").length === 1) {
                        indArr.push(ind);
                        return true;
                    }
                });
                zipDataFilter = zipData.filter((el, ind) =>
                    indArr.includes(ind)
                );
            } else {
                axisDataFilter = axisData.filter(function(item, i) {
                    return indexes.includes(i);
                });
                zipDataFilter = zipData.filter(function(item, i) {
                    return indexes.includes(i);
                });
            }
        } else {
            this._drilName = false;
            axisDataFilter = axisData;
            zipDataFilter = zipData;
        }
        // var seriesData = filterNumeric(ownData.resultset);

        zipDataFilter = this.zip(zipDataFilter);
        this.setChartData(option, axisDataFilter, zipDataFilter, lengend);
        return option;
    }
    getLengendNumeric(metadata) {
        var typeArr = ["Numeric", "Integer"];
        return metadata
            .filter(function(item) {
                return typeArr.includes(item.colType);
            })
            .map(function(item) {
                return item.colName;
            });
    }
    getLengendNumericIndex(metadata) {
        var typeArr = ["Numeric", "Integer"];
        return metadata
            .filter(function(item) {
                return typeArr.includes(item.colType);
            })
            .map(function(item) {
                return item.colIndex;
            });
    }
    getType(resultset, length) {
        let array = [];
        resultset.map(item => {
            array.push(
                item
                    .slice(0, length)
                    .filter(e => e !== null)
                    .join("~")
            );
        });
        return array;
    }
    getType1(resultset, length) {
        let array = [];
        for (let j = 0; j < resultset.length; j++) {
            for (let i = 0; i < length; i++) {
                if (!resultset[j][i]) continue;
                let arr = resultset[j].slice(0, i + 1).join("~");
                if (!array.includes(arr)) {
                    array.push(arr);
                }
            }
        }
        return array;
    }
    getChangeData(resultset, lengendArr, ownOption) {
        var array = [];
        var type;
        var length = Math.min.apply(null, lengendArr);
        !lengendArr.length && (length = 0);
        var tempRes = resultset.map(function(item) {
            return item.join("~");
        });
        //判断是否开启下转功能
        var getIfNull = ownOption.clickEvent !== "drill";
        var min = lengendArr[0],
            max = lengendArr[lengendArr.length - 1];
        //未开启下转
        if (getIfNull) {
            type = this.getType(resultset, length);
            resultset.map(el => {
                array.push(el.slice(min, max + 1));
            });
        } else {
            type = this.getType1(resultset, length);
            //处理数据为连接数据
            let selfResultset = [];
            for (let i = 0; i < resultset.length; i++) {
                selfResultset[i] = [
                    resultset[i]
                        .slice(0, min)
                        .filter(e => e !== null)
                        .join("~"),
                    resultset[i].slice(min, max + 1)
                ];
            }
            let selfArrObj = {};
            //遍历生成的type,合成对应的数据
            for (let j = min; j > 0; j--) {
                var selfLenArr = type.filter(el => {
                    var itemArr = el.split("~");
                    return itemArr.length === j;
                });
                selfLenArr.map(el => {
                    var itemArr = el.split("~");
                    var itemArrLen = el.split("~").length;
                    selfResultset.filter((e, ind) => {
                        var itemArr1 = e[0].split("~");
                        var itemArr1Len = e[0].split("~").length;
                        if (itemArrLen === itemArr1Len && el === e[0]) {
                            selfArrObj[el] = e[1];
                        }
                        //如果原数组里面无此项数据  救进行求和处理
                        else if (
                            e[0].includes(el) &&
                            itemArrLen !== itemArr1Len
                        ) {
                            let arrObj = {
                                arr: [],
                                ArrSum: []
                            };
                            Object.keys(selfArrObj).filter((eli, indd) => {
                                var itemArr2 = eli.split("~");
                                var itemArr2Len = eli.split("~").length;
                                if (
                                    itemArr2Len - itemArrLen === 1 &&
                                    itemArr2.splice(0, itemArrLen).join("~") ===
                                        el
                                ) {
                                    arrObj.arr.push(selfArrObj[eli]);
                                    return true;
                                }
                            });
                            arrObj.arr.map(el => {
                                el.map((e, i) => {
                                    arrObj.ArrSum[i] =
                                        (arrObj.ArrSum[i] || 0) + e;
                                });
                            });
                            selfArrObj[el] = arrObj.ArrSum;
                        }
                    });
                });
            }
            type.map(el => {
                array.push(selfArrObj[el]);
            });
        }
        return {
            axisData: type,
            zipData: array
        };
    }
    zip(arr = []) {
        let array = [];
        let length = this.maxLength(arr);
        for (let i = 0; i < length; i++) {
            let tempArr = [];
            arr.forEach(function(item) {
                tempArr.push(item[i]);
            });
            array.push(tempArr);
        }
        return array;
    }
    lineFn(data) {
        /**
         * <p>
         * 函数功能：最小二乘法曲线拟合
         * </p>
         * <p>
         * 方程:Y = a(0) + a(1) * (X - X1)+ a(2) * (X - X1)^2 + ..... .+ a(m) * (X -
         * X1)^m X1为X的平均数
         * </p>
         *
         * @param x
         *            实型一维数组,长度为 n. 存放给定 n 个数据点的 X 坐标
         * @param y
         *            实型一维数组,长度为 n.存放给定 n 个数据点的 Y 坐标
         * @param n
         *            变量。给定数据点的个数
         * @param a
         *            实型一维数组，长度为 m.返回 m-1 次拟合多项式的 m 个系数
         * @param m
         *            拟合多项式的项数，即拟合多项式的最高次数为 m-1. 要求 m<=n 且m<=20。若 m>n 或 m>20
         *            ，则本函数自动按 m=min{n,20} 处理.
         *            <p>
         *            Date:2007-12-25 16:21 PM
         *            </p>
         * @author qingbao-gao
         * @return 多项式系数存储数组
         */
        function PolyFitForcast() {
            function PolyFit(x, y, n, a, m) {
                var i, j, k;
                var z,
                    p,
                    c,
                    g,
                    q = 0,
                    d1,
                    d2;
                var s = new Array(20);
                var t = new Array(20);
                var b = new Array(20);
                var dt = new Array(3);
                for (i = 0; i <= m - 1; i++) {
                    a[i] = 0.0;
                }
                if (m > n) {
                    m = n;
                }
                if (m > 20) {
                    m = 20;
                }
                z = 0.0;
                for (i = 0; i <= n - 1; i++) {
                    z = z + x[i] / (1.0 * n);
                }
                b[0] = 1.0;
                d1 = 1.0 * n;
                p = 0.0;
                c = 0.0;
                for (i = 0; i <= n - 1; i++) {
                    p = p + (x[i] - z);
                    c = c + y[i];
                }
                c = c / d1;
                p = p / d1;
                a[0] = c * b[0];
                if (m > 1) {
                    t[1] = 1.0;
                    t[0] = -p;
                    d2 = 0.0;
                    c = 0.0;
                    g = 0.0;
                    for (i = 0; i <= n - 1; i++) {
                        q = x[i] - z - p;
                        d2 = d2 + q * q;
                        c = c + y[i] * q;
                        g = g + (x[i] - z) * q * q;
                    }
                    c = c / d2;
                    p = g / d2;
                    q = d2 / d1;
                    d1 = d2;
                    a[1] = c * t[1];
                    a[0] = c * t[0] + a[0];
                }
                for (j = 2; j <= m - 1; j++) {
                    s[j] = t[j - 1];
                    s[j - 1] = -p * t[j - 1] + t[j - 2];
                    if (j >= 3)
                        for (k = j - 2; k >= 1; k--) {
                            s[k] = -p * t[k] + t[k - 1] - q * b[k];
                        }
                    s[0] = -p * t[0] - q * b[0];
                    d2 = 0.0;
                    c = 0.0;
                    g = 0.0;
                    for (i = 0; i <= n - 1; i++) {
                        q = s[j];
                        for (k = j - 1; k >= 0; k--) {
                            q = q * (x[i] - z) + s[k];
                        }
                        d2 = d2 + q * q;
                        c = c + y[i] * q;
                        g = g + (x[i] - z) * q * q;
                    }
                    c = c / d2;
                    p = g / d2;
                    q = d2 / d1;
                    d1 = d2;
                    a[j] = c * s[j];
                    t[j] = s[j];
                    for (k = j - 1; k >= 0; k--) {
                        a[k] = c * s[k] + a[k];
                        b[k] = t[k];
                        t[k] = s[k];
                    }
                }
                dt[0] = 0.0;
                dt[1] = 0.0;
                dt[2] = 0.0;
                for (i = 0; i <= n - 1; i++) {
                    q = a[m - 1];
                    for (k = m - 2; k >= 0; k--) {
                        q = a[k] + q * (x[i] - z);
                    }
                    p = q - y[i];
                    if (Math.abs(p) > dt[2]) {
                        dt[2] = Math.abs(p);
                    }
                    dt[0] = dt[0] + p * p;
                    dt[1] = dt[1] + Math.abs(p);
                }
                return a;
            } // end

            /**
             * <p>
             * 对X轴数据节点球平均值
             * </p>
             *
             * @param x
             *            存储X轴节点的数组
             *            <p>
             *            Date:2007-12-25 20:21 PM
             *            </p>
             * @author qingbao-gao
             * @return 平均值
             */
            function average(x) {
                var ave = 0;
                var sum = 0;
                if (x !== null) {
                    for (var i = 0; i < x.length; i++) {
                        sum += x[i];
                    }
                    ave = sum / x.length;
                }
                return ave;
            }

            /**
             * <p>
             * 由X值获得Y值
             * </p>
             * @param x
             *            当前X轴输入值,即为预测的月份
             * @param xx
             *            当前X轴输入值的前X数据点
             * @param a
             *            存储多项式系数的数组
             * @param m
             *            存储多项式的最高次数的数组
             *            <p>
             *            Date:2007-12-25 PM 20:07
             *            </p>
             * @return 对应X轴节点值的Y轴值
             */
            function getY(x, xx, a, m) {
                var y = 0;
                var ave = average(xx);
                var m = 2;
                var l = 0;
                for (var i = 0; i < m; i++) {
                    l = a[0];
                    if (i > 0) {
                        y += a[i] * Math.pow(x - ave, i);
                    }
                }
                return y + l;
            }

            /**
             * 返回拟合后的点坐标数组
             * @param  {Array} arr 点坐标数组
             * @return {Array}     拟合后的点坐标数组
             */
            this.get = function(arr) {
                var arrX = [],
                    arrY = [];

                for (var i = 0; i < arr.length; i++) {
                    arrX.push(arr[i].x);
                    arrY.push(arr[i].y);
                }

                var len = arrY.length;
                var m = 3;
                var a = new Array(arrX.length);
                var aa = PolyFit(arrX, arrY, len, a, m);
                var arrRes = [];
                for (var i = 0; i < len; i++) {
                    arrRes.push({
                        x: arrX[i],
                        y: getY(arrX[i], arrX, aa, m)
                    });
                }

                return arrRes;
            };
        }
        var xq = [];
        var xy = [];
        // for (let i = 0; i < data.length; i++) {
        //   arr.push([i + 1, data[i]]);
        // }
        for (let i = 0; i < data.length; i++) {
            xq.push({
                x: i + 1,
                y: data[i]
            });
        }
        var xe = new PolyFitForcast().get(xq);

        for (let i = 0; i < xe.length; i++) {
            xy.push(xe[i].y);
        }

        return xy;
    }

    mAverage(data) {
        var markLineData = [];
        var m = data[0];
        markLineData.push(m);
        for (var i = 1; i < data.length; i++) {
            if (i < 2) {
                m = (m + data[i]) / (i + 1);
            } else {
                m = (data[i] + data[i - 1] + data[i - 2]) / 3;
            }
            markLineData.push(m);
        }
        return markLineData;
    }
    wmAverage(data) {
        var markLineData = [];
        var m = data[0];
        markLineData.push(m);
        for (var i = 1; i < data.length; i++) {
            if (i < 2) {
                m = (m + data[i] * (i + 1)) / (i + i + 1);
            } else {
                m = (data[i] * 3 + data[i - 1] * 2 + data[i - 2]) / 6;
            }
            markLineData.push(m);
        }
        return markLineData;
    }
    maxLength(arr) {
        let maxLength = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].length > maxLength) maxLength = arr[i].length;
        }
        return maxLength;
    }
    setChartData(chartOption, axisData = [], zipData = [], lengend) {
        const { defaultOption } = this.cfg.chartDefinition;

        const { data, query } = defaultOption;

        var templateData1 = Immutable.fromJS(defaultOption.series[0]).toJS();
        var templateData = Immutable.fromJS(defaultOption.series[1]).toJS();
        // var arr = [];
        // for (let i = 0; i < lengend.length; i++) {
        //   arr.push(`{b${i}}<br/>{a${i}}: {c${i}}`)
        // }
        // var tooltipData = arr.join('</br>');
        // chartOption.tooltip.formatter = tooltipData;

        //设置图例数据
        chartOption.legend.data = lengend;
        for (let item of chartOption.xAxis) {
            item.data = axisData;
        }

        //删除模板中的示例数据
        chartOption.series = [templateData1];
        if (zipData.length) {
            for (let i = 0; i < zipData.length; i++) {
                templateData.name = lengend[i];
                templateData.data = zipData[i];
                var obj = Immutable.fromJS(templateData).toJS();
                chartOption.series.push(obj);
            }
        } else {
            var obj = Immutable.fromJS(templateData).toJS();
            chartOption.series.push(obj);
        }
        return chartOption;
    }
}
