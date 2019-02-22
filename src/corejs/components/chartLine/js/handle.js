import WidgetBase from "corejs/components/base";
import Immutable, { Map, is } from "immutable";
import Util from "corejs/util/util";
import _ from "lodash";
import $ from "jquery";

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
        super.doQuery(...arguments);
        if (!arguments[2]) {
            //缓存下钻信息清除
            this.drillData = null;
        }
    }

    /**
     * 数据集类型数据源下钻
     * @param {Object} e 时间参数
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
    _bindClickEvent() {
        //事件绑定
        this.echartsDom.on("click", e => {
            const chartDefinition = this.cfg.chartDefinition;
            const params = chartDefinition.option.clickParmas;
            switch (chartDefinition.option.clickEvent) {
                case "drill":
                    // this._option.legend.selected = {}; //点击下转  重置图例状态
                    /*  let { query } = chartDefinition;
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
    //处理样式操作的option
    _handleOption(option) {
        //处理option
        const chartDefinition = this.cfg.chartDefinition;
        let selfoption = chartDefinition.option;
        //处理样式操作数据
        this._option = this._handleEnumOption(
            selfoption,
            this._option,
            this.htmlObj
        );
        this._customizeBar(option, this.htmlObj, selfoption); //xy轴间距调整
        //处理预警
        this._handlewarn(
            selfoption.warns,
            option,
            chartDefinition.data,
            selfoption.orientation,
            selfoption.linestack
        );
        //处理代码注入数据
        // this._option = handleChart.handleInjectOption(chartDefinition.injectOption,this._option);
        return this._option;
    }
    _handleEnumOption(store, option, htmlObj) {
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
        return option;
    }
    _handlePerStore(item, value, option, htmlObj, ownOption) {
        switch (item) {
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
                //调整坐标系位置
                option.grid.top = 40 + 5;
                break;
            case "titleBackgroundColor":
                option.title.backgroundColor = value || "transparent";
                if (this.cfg.chartDefinition.option.title === "") {
                    option.title.backgroundColor = "transparent";
                }
                break;
            case "titlePosition":
                option.title.left = value;
                break;
            case "isExportData":
                Dashboard.lib
                    .$("#" + this.cfg.id + " .chartCsv")
                    .css({ display: value ? "block" : "none" });
                break;
            case "orientation":
                if (option[item] === value) return;
                option[item] = value;
                if (option.series[0].xAxisIndex) {
                    option.series[0].xAxisIndex =
                        (option.series[0].xAxisIndex + 1) % 2;
                    option.series[0].yAxisIndex =
                        (option.series[0].yAxisIndex + 1) % 2;
                }
                [option.xAxis, option.yAxis] = [option.yAxis, option.xAxis];
                break;
            case "showData":
                for (let i of option.series) {
                    if (i.tag) continue;
                    i.label.normal.show = value;
                }
                break;
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
            case "color":
                if (value.length > 0) {
                    option.color = value;
                }
                break;
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
            case "axisTick":
                for (let i of option.xAxis) {
                    i.axisTick.show = ownOption[item];
                }
                for (let i of option.yAxis) {
                    i.axisTick.show = ownOption[item];
                }
                break;
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
            case "showDot":
                let size = ownOption[item] ? 4 : 1;
                for (let i of option.series) {
                    i.symbolSize = size;
                }
                break;
            case "showArea":
                let b = ownOption[item] ? 0.6 : 0;
                for (let i of option.series) {
                    if (i.tag || i.type !== "line" || i._name === "noNull")
                        continue;
                    i.areaStyle.normal.opacity = b;
                }
                break;
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
            case "linestack":
                let arrNum1 = [];
                let barstackMax;
                let lineNum1 = [];
                if (ownOption[item]) {
                    for (let i of option.series) {
                        if (i.tag || i.type !== "line") continue;
                        i.stack = i._name != "noNull" ? i.type : "resize";
                        for (let j = 0; j < i.data.length; j++) {
                            arrNum1[j] =
                                (arrNum1[j] ? arrNum1[j] : 0) + i.data[j];
                        }
                    }
                    barstackMax = Math.max.apply(null, arrNum1);
                    if (ownOption["stack"]) {
                        for (let i of option.series) {
                            if (i.tag || i.type !== "bar") continue;
                            for (let j = 0; j < i.data.length; j++) {
                                lineNum1[j] =
                                    (lineNum1[j] ? lineNum1[j] : 0) + i.data[j];
                            }
                        }
                    } else {
                        for (let i of option.series) {
                            if (i.tag || i.type !== "bar") continue;
                            lineNum1.push(Math.max.apply(null, i.data));
                        }
                    }
                    barstackMax =
                        barstackMax > Math.max.apply(null, lineNum1)
                            ? stackMax
                            : Math.max.apply(null, lineNum1);
                    if (ownOption["orientation"] === "vertical") {
                        option.yAxis[0].max = barstackMax;
                    } else {
                        option.xAxis[0].max = barstackMax;
                    }
                }
                break;
            case "loseData":
                var b = ownOption[item] === "null" ? false : true;
                for (let i of option.series) {
                    i.connectNulls = b;
                }
                break;
            case "lineStyle":
                let smooth = ownOption[item] === "smooth";
                for (let i of option.series) {
                    i.smooth = smooth;
                }
                break;
            case "predictionLine":
                if (ownOption[item] !== "auto") {
                    var num = ownOption[item];
                    var lineSeries = option.series.find(
                        e => e.type === "line"
                    ) || { data: [] };
                    if (num <= 0 || num > lineSeries.data.length - 1) return;
                    let tempAll = [];
                    var series = JSON.parse(
                        JSON.stringify(
                            option.series.filter(function(item) {
                                return (
                                    item.type === "line" && item.tag !== true
                                );
                            })
                        )
                    );

                    var series1 = JSON.parse(
                        JSON.stringify(
                            option.series.filter(function(item) {
                                return (
                                    item.type === "line" && item.tag !== true
                                );
                            })
                        )
                    );
                    if (ownOption["linestack"]) {
                        for (let i = 0; i < series1.length; i++) {
                            let temp = null;
                            for (let j = 0; j < i + 1; j++) {
                                temp = this.addArr(temp, series1[j].data);
                            }
                            tempAll[i] = temp;
                        }
                    }
                    for (let i = 0; i < series.length; i++) {
                        let data = {
                            name: "3的指数",
                            type: "line",
                            _name: "noNull",
                            data: [1, 3, 9, 27, 81, 247, 741, 2223, 6669],
                            label: {
                                normal: {
                                    formatter: this.numFormatter
                                }
                            },
                            lineStyle: {
                                normal: {
                                    type: "dashed"
                                }
                            },
                            areaStyle: {
                                normal: {
                                    opacity: 0
                                }
                            }
                        };
                        var itemData = series[i].data;
                        var itemData1;
                        /* if (ownOption["linestack"]) {
                            itemData1 = tempAll[i];
                        } else { */
                        itemData1 = series[i].data;
                        // }
                        data.data = Array(itemData1.length - num - 1)
                            .fill(null)
                            .concat(
                                itemData1.slice(
                                    itemData1.length - num - 1,
                                    itemData1.length
                                )
                            );
                        data.name = series[i].name;
                        for (let j = 0; j < option.series.length; j++) {
                            if (option.series[j].name === series[i].name) {
                                option.series[j].data = itemData
                                    .slice(0, itemData.length - num)
                                    .concat(Array(num).fill(null));
                            }
                        }
                        option.series.push(data);
                    }
                }
                break;
            case "backgroundColor":
                if (value) {
                    $(htmlObj).css("backgroundColor", value);
                }
                if (this.cfg.parentId) {
                    $(htmlObj).css("backgroundColor", "rgba(0, 0, 0, 0)");
                }
                break;
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
    _customizeBar(option, htmlObj, store) {
        let width = parseInt(htmlObj.clientWidth, 10),
            height = parseInt(htmlObj.clientHeight, 10);
        let offsetY,
            offsetYHeight,
            offsetX,
            offsetXLenght,
            offsetMaxLenght,
            xNameLength,
            yNameLength,
            dataArr = [];
        let chartOption = option;
        chartOption.series.forEach(e => {
            dataArr = dataArr.concat(e.data);
        });
        // chartOption._grid = chartOption._grid || Object.assign({}, chartOption.grid);
        if (store.orientation === "vertical") {
            chartOption.yAxis[0].minInterval =
                chartOption.series[0].data[0] / 4;
            offsetY = this.getMaxLength(dataArr);
            offsetYHeight = 5;
            offsetX = this.getSumLength(chartOption.xAxis[0].data);
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
    //处理图例位置
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
                chartOption.legend.left = 20;
                chartOption.legend.orient = "vertical";
                chartOption.legend.top = chartOption.grid.top;
                chartOption.grid.bottom += 24;
                break;
            case "right":
                chartOption.legend.right = 20;
                chartOption.legend.orient = "vertical";
                chartOption.legend.top = chartOption.grid.top;
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
    _lengendFn(option, type) {
        /* const _filterData = option.chartOption.legend.data.map((ele) => {
        if(!ele || ele=="null") {ele=="-"};
        const eleArr = ele.split("~");
        const len = eleArr.length;
        if(len === 2) {
          if(eleArr[0]=="") {
            ele = eleArr[1];
          }else if(eleArr[1]=="") {
            ele = eleArr[0];
          }
        }
        return ele;
      }); */

        var datas = option.chartOption.legend.data;
        option.chartOption.legend.formatter = function(param) {
            let _name = param || "-";
            _name = _name.replace(/(^null~)|(~null)/g, "");
            return _name;
        };
        if (!datas.length) {
            return false;
        }
        var yh = option.height;
        var xh = option.width;
        var selflen = {};
        var aa;
        switch (type) {
            case "left":
                selflen.maxLeg = this.getLabelMaxLength(datas);
                aa =
                    /* this.measureTextWidth(selflen.maxLeg.maxValue) */ 90 +
                    10;
                option.chartOption.grid.left += aa;
                this._setlegendTooltip();
                break;
            case "right":
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
                } */ option.chartOption.legend.width =
                    xh - 60;
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
                } */ option.chartOption.legend.width =
                    xh - 60;
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
     * @param {*} orientation 横纵向
     * @param {*} stack 是否堆叠
     */
    _handlewarn(warn, option, data, orientation, stack) {
        if (!data.metadata || !this._legendSerise || !warn.switch) {
            return false;
        }
        //拷贝series
        let selfOption = Immutable.fromJS(option).toJS();
        //分类
        let selfOption1 = selfOption.series.filter(e => e._name === "noNull");
        let selfOption2 = selfOption.series.filter(e => e._name !== "noNull");
        //是否是堆叠处理
        if (stack) {
            [selfOption1, selfOption2].forEach(ee => {
                ee.forEach((e, i) => {
                    e.data.forEach((item, ind) => {
                        if (i > 0) {
                            e.data[ind] += ee[i - 1].data[ind];
                        }
                    });
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
                            // eval(item + selfSeries.filter + selfSeries.value)
                            new Function(
                                "",
                                "return " +
                                    item +
                                    selfSeries.filter +
                                    selfSeries.value
                            )()
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
    maxLength(arr) {
        let maxLength = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].length > maxLength) maxLength = arr[i].length;
        }
        return maxLength;
    }
    addArr(temp, arr) {
        if (!temp) return arr;
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i] + temp[i];
        }
        return arr;
    }

    setChartData(chartOption, axisData = [], zipData = [], lengend) {
        const { defaultOption } = this.cfg.chartDefinition;
        var templateData = Immutable.fromJS(defaultOption.series[0]).toJS();
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
        chartOption.series = [];
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
    /* //数据集数据处理
    _handleDataSetData(drillName) {
        let self = this;
        const { chartDefinition } = this.cfg;
        const { data, query } = chartDefinition;
        let _data = this._grupDataSet();
        if (JSON.stringify(_data) === "{}") {
            return;
        }

        var _rebuildData = function(xzhou, xilie, t) {
            const data = _data;
            let result = null;
            data.yAxis.forEach((item, i) => {
                if (
                    xzhou === data.xAxis[i][0].toString() &&
                    xilie === data.series[i][0].toString()
                ) {
                    result = item[t];
                    return;
                }
            });
            if (result === null) {
                result = 0;
            }
            return result;
        };

        let option = this._option;
        let dataObj = {
            yAxisData: [],
            seriesData: [],
            legendData: [], //yAxis和series平行拼接成legend
            xAxisData: [],
            series: []
        };
        //yAxisData
        let queryYaxis = query.datasetSetting.cellsConfig.yAxis.fields;
        queryYaxis.forEach((e, i) => {
            dataObj.yAxisData.push(e.config.cellName);
        });
        //seriesData
        _data.series.forEach((e, i) => {
            dataObj.seriesData.push(e[0]);
        });
        dataObj.seriesData = [...new Set(dataObj.seriesData)];
        //legendData
        for (let i of dataObj.yAxisData) {
            if (dataObj.seriesData.length) {
                for (let j of dataObj.seriesData) {
                    dataObj.legendData.push(j + "_" + i);
                }
            } else {
                dataObj.legendData.push(i);
            }
        }
        //x轴
        dataObj.xAxisData[0] = $.extend({}, option.xAxis[0]);
        let xData = [];
        _data.xAxis.forEach((e, i) => {
            xData.push(e[0]);
        });
        dataObj.xAxisData[0].data = [...new Set(xData)];
        //series
        dataObj.legendData.forEach((legendName, i) => {
            let serie = $.extend(true, {}, option.series[0]);
            serie.name = legendName;
            serie.data = [];
            _data.yAxis.forEach((yData, j) => {
                if (_data.series.length === 0) {
                    let formatData = Util.formatData2Num(
                        yData[i],
                        queryYaxis[i].config.dataHandle
                    );
                    serie.data.push(formatData);
                } else {
                    let xzhou = _data.xAxis[j][0].toString();
                    let xilie = legendName.split("_")[0];
                    let zibiao = legendName.split("_")[1];
                    let t = dataObj.yAxisData.indexOf(zibiao);
                    let data = _rebuildData(xzhou, xilie, t);

                    let formatData = Util.formatData2Num(
                        data,
                        queryYaxis[t].config.dataHandle
                    );
                    serie.data.push(data);
                }
            });
            dataObj.series.push(serie);
        });

        option.legend.data = dataObj.legendData;
        option.tooltip.formatter = function(e) {
            var content = e[0].axisValue + "<br/>";
            e.forEach((item, i) => {
                item.value = Util.formatData2Str(
                    item.value,
                    queryYaxis[item.axisIndex].config.dataHandle
                );
                content += item.seriesName + "：" + item.value + "<br/>";
            });
            return content;
        };

        option.series = dataObj.series;
        option.xAxis = dataObj.xAxisData;

        this._legendSerise = dataObj.legendData;

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
        //当有数据的时候执行以下逻辑 xAxis X轴 series系列 lineCount折线指标 barCount柱状指标
        const { cellToInd } = chartDefinition.query.datasetSetting;
        const { util } = window.Dashboard;
        if (!ownData.metadata) {
            // util.popTips("WARING", "数据格式错误");
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
                obj.name = _name;
                legend.push(_name);
                obj.data = zipDataFilter.map(ee => {
                    let d = Util.formatData2Num(
                        ee[i],
                        cellsConfig[lineOrBar].fields[i].config
                    );
                    return d;
                });
                var len = chartOption.series.length;
                chartOption.series[len];
                chartOption.series.push(obj);
            });
        } else {
            //有系列
            selfObj.xilie.map((e, i) => {
                var _name = e;
                var obj = Immutable.fromJS(temp).toJS();
                obj.name = _name;
                legend.push(_name);
                obj.data = zipDataFilter.map(ee => {
                    var cc = cellsConfig[lineOrBar].fields;
                    let d = Util.formatData2Num(
                        ee[i],
                        cc[i % cc.length].config
                    );
                    return d;
                });
                chartOption.series.push(obj);
            });
        }
        chartOption.series.length > 1 && chartOption.series.splice(0, 1);
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
        // let _barCount = cellsConfig.barCount.fields;
        var lineCount = yAxis;
        let _lineCount = cellsConfig.yAxis.fields;
        const { metadata, resultset } = ownData;
        let chartOption = this._option,
            legend = [],
            legendObj = {};
        var templateData = Immutable.fromJS(defaultOption.series[0]).toJS();
        var temp = {
            name: "",
            type: "line",
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
        chartOption.series = [temp];
        //获取系列
        var xilie = Array.from(new Set(_data.series.map(e => e[0])));
        if (!xilie.length) {
            //柱状指标
            this._handleBarAndChart({
                _data,
                ownOption,
                chartOption,
                barCount: lineCount,
                _barCount: _lineCount,
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
            var _this = this;
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
                _barCount: _lineCount,
                lineOrBar: "yAxis",
                barCount: lineCount
            });
        }
        /* legend.forEach((e, i) => {
            if (e == null) {
                legend[i] = "-";
            } else {
                legend[i] = e.replace(/null/g, "-");
            }
        }); */
        this._legendSerise = legend;
        chartOption.legend.data = legend;
        chartOption.legend.formatter = function(param) {
            let _name = param || "-";
            _name = _name.replace(/(^null~)|(~null)/g, "");
            return _name;
        };
        chartOption.tooltip.formatter = ee => {
            var content = "";
            if (ee && ee.length) {
                ee.map((e, i) => {
                    i === 0 && (content += this.pingjie(e.name) + "<br/>");
                    for (let item of cellsConfig.yAxis.fields) {
                        if (e.seriesName.indexOf(item.field.name) !== -1) {
                            let dataHandle = item.config || {};
                            dataHandle.formatMask =
                                item.field && item.field.formatMask
                                    ? item.field.formatMask
                                    : "";
                            e.value = Util.formatData2Str(e.value, dataHandle)
                                ? Util.formatData2Str(e.value, dataHandle)
                                : "-";
                        }
                    }
                    content +=
                        this.pingjie(e.seriesName) + "：" + e.value + "<br/>";
                });
            }
            return content;
        };
    }
    //tooltip中的拼接
    pingjie(_name) {
        _name = _name + "" || "-";
        _name = _name.replace(/(^null~)|(~null)/g, "");
        return _name;
    }
}
