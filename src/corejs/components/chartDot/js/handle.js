import WidgetBase from "corejs/components/base";
import Immutable, { Map, is } from "immutable";
import ecStat from "echarts-stat";
import _ from "lodash";
import Util from "corejs/util/util";
import $ from "jquery";

export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    //事件绑定
    _bindClickEvent() {
        this.echartsDom.on("click", e => {
            const chartDefinition = this.cfg.chartDefinition;
            const params = chartDefinition.option.clickParmas;
            switch (chartDefinition.option.clickEvent) {
                case "drill":
                    this.handleDefinition(chartDefinition, e.name);
                    this.draw();
                    break;
                case "interact":
                    var _params = Immutable.fromJS(params).toJS();
                    _params.category.value = e.data[0];
                    _params.series.value = e.seriesName;
                    _params.value.value = e.data[1];
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
        this.Ydata = [100];
        const { util } = window.Dashboard;
        const { defaultOption } = this.cfg.chartDefinition;
        let thisOption = util.copy(true, {}, defaultOption, this._option);
        util.copy(true, this._option, thisOption);
    }
    /**
     * 处理预警
     * @param {*} warn 预警字段
     * @param {*} option 图表配置项
     * @param {*} data 图表数据
     */
    _handlewarn(warn, option, data, orientation) {
        if (!data.metadata || !warn.seriesList || !warn.switch) {
            return false;
        }
        let tempList = [];

        option.series.forEach(e => {
            if (!e.tag) {
                tempList.push("x->" + e.name);
                tempList.push("y->" + e.name);
            }
        });

        warn.seriesList = tempList;
        this.dispatch("seriesListChange", warn.seriesList);
        let _warn = {};
        warn.value.forEach(e => {
            e.series.length && (_warn[e.series] = e);
        });
        let _series = Object.values(_warn);
        /*let _orientation = orientation === "vertical" ? 0 : 1;*/
        if (_series.length) {
            var axisType = 0;
            option.series.forEach(e => {
                let selfSeries = _series.find(ee => {
                    if (e.name == ee.series.split("->")[1]) {
                        if (ee.series.split("->")[0] == "x") {
                            axisType = 0;
                            return true;
                        } else if (ee.series.split("->")[0] == "y") {
                            axisType = 1;
                            return true;
                        }
                    } else {
                        return false;
                    }
                });
                selfSeries &&
                    e.data.forEach((item, i) => {
                        if (
                            /* eval(item[axisType] + selfSeries.filter + selfSeries.value) */
                            /*typeof item === "number" &&
                             */
                            new Function(
                                "",
                                "return " +
                                    item[axisType] +
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
                                    /*valueIndex: _orientation,*/
                                    coord: [item[0], item[1]]
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
    //处理样式操作的option
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
        //处理代码注入数据
        // this._option = handleChart.handleInjectOption(chartDefinition.injectOption,this._option);
        this._handlewarn(
            chartDefinition.option.warns,
            option,
            chartDefinition.data,
            chartDefinition.option.orientation
        );
        return this._option;
    }
    //处理可枚举属性
    _handleEnumOption(store, option, htmlObj) {
        for (let item in store) {
            this._handlePerStore(item, store[item], option, htmlObj, store);
        }
        this._handleExample(store.example, option, htmlObj, store);
        return option;
    }
    //处理属性
    _handlePerStore(item, value, option, htmlObj, ownOption) {
        switch (item) {
            case "title":
                //用rich 是因为 要给标题设置背景颜色
                option.title.z = -2;
                option.title.padding = [0, 0, 0, 5];
                option.title.text = `{a|${value}}`;

                if (value > 0) {
                    option.title.option.height = 40;
                } else {
                    option.title.option.height = 10;
                }
                option.title.textStyle.rich.a = {
                    lineHeight: 40,
                    fontSize: 16,
                    width: 10000
                };
                //调整坐标系位置
                // option.grid.top = 40 + 5;
                break;
            //标题位置
            case "titlePosition":
                option.title.left = value;
                option.title.height = 100;
                break;
            //标题颜色
            case "titleBackgroundColor":
                option.title.backgroundColor = value || "transparent";
                if (this.cfg.chartDefinition.option.title === "") {
                    option.title.backgroundColor = "transparent";
                }
                break;
            //图例位置
            /*case 'example':
            this._handleExample(value, option, htmlObj,ownOption);
            break;*/
            //是否导出数据
            case "isExportData":
                Dashboard.lib
                    .$("#" + this.cfg.id + " .chartCsv")
                    .css({ display: value ? "block" : "none" });
                break;
            //是否显示网格线
            case "gridLine":
                for (let i of option.yAxis) {
                    if (i.tag) continue;
                    i.splitLine.show = value;
                }

                for (let i of option.xAxis) {
                    if (i.tag) continue;
                    i.splitLine.show = value;
                }

                break;
            //图表颜色
            case "color":
                if (value.length > 0) {
                    option.color = value;
                }
                break;
            //统一透明度
            case "opacity":
                option.color = option.color.map(cl => {
                    return this.colorRgb(cl, value);
                });
                break;
            //x轴
            case "xaxis":
                for (let i of option.xAxis) {
                    i.show = ownOption[item];
                }
                break;
            //y轴
            case "yaxis":
                for (let i of option.yAxis) {
                    i.show = ownOption[item];
                }
                break;
            //x轴刻度线
            case "xaxisTick":
                for (let i of option.xAxis) {
                    i.axisTick.show = ownOption[item];
                }
                break;
            //y轴刻度线
            case "yaxisTick":
                for (let i of option.yAxis) {
                    i.axisTick.show = ownOption[item];
                }
                break;
            //x轴基线
            case "xBaseLine":
                let obj;

                if (ownOption[item] === "average") {
                    obj = { type: "average", name: "平均值", valueIndex: 0 };
                } else if (ownOption[item] === "auto") {
                    obj = { xAxis: "auto" };
                } else {
                    obj = { xAxis: ownOption[item] };
                }
                for (let i of option.series) {
                    if (i.tag) continue;
                    obj && i.markLine.data.push(obj);
                }
                break;
            // y轴基线
            case "yBaseLine":
                let objY;
                if (ownOption[item] === "average") {
                    objY = { type: "average", name: "平均值", valueIndex: 1 };
                } else if (ownOption[item] === "auto") {
                    objY = { yAxis: "auto" };
                } else {
                    objY = { yAxis: ownOption[item] };
                }
                for (let i of option.series) {
                    if (i.tag) continue;
                    objY && i.markLine.data.push(objY);
                }
                break;
            //值轴标题
            case "xaxisTitle":
                for (let i of option.xAxis) {
                    i.name = ownOption[item];

                    if (ownOption[item].length > 0) {
                        i.option.height = 18;
                    } else {
                        i.option.height = 0;
                    }
                }
                break;
            //值轴标题
            case "yaxisTitle":
                for (let i of option.yAxis) {
                    i.name = value;
                    i.nameGap = this.countYMaxLen(ownOption);
                    if (ownOption[item].length > 0) {
                        i.option.width = 18;
                    } else {
                        i.option.width = 0;
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
            //是否显示数据
            case "showData":
                for (let i of option.series) {
                    if (i.tag) continue;
                    i.label.normal.show = value;
                }
                break;
            //标记图形
            case "symbol":
                for (let i of option.series) {
                    i.symbol = value;
                }
                break;
            /* //图像标记大小
            case "symbolSize":
                if (this.cfg.chartDefinition.query.type !== "dataset") {
                    for (let i of option.series) {
                        if (i.tag) continue;
                        i.symbolSize = value[0];
                        i.label.normal.offset[1] =
                            i.label.normal.offset[1] + value[0] / 2;
                    }
                    break;
                } */
            //标线
            case "markLine":
                let data = option.series.filter(function(item) {
                    return item.tag == undefined;
                });
                let fn;
                if (ownOption[item] === "exponential") {
                    fn = this.exponential;
                } else if (ownOption[item] === "logarithmic") {
                    fn = this.logarithmic;
                } else if (ownOption[item] === "line") {
                    fn = this.lineFn;
                } else if (ownOption[item] === "auto") {
                    break;
                } else if (typeof ownOption[item] === "number") {
                    fn = this.polynomial;
                } else if (
                    typeof ownOption[item] === "string" &&
                    (ownOption[item] != "auto" ||
                        ownOption[item] != "number" ||
                        ownOption[item] != "line" ||
                        ownOption[item] != "logarithmic" ||
                        ownOption[item] != "exponential" ||
                        ownOption[item] != "null")
                ) {
                    fn = this.polynomial;
                } else {
                    fn = null;
                }
                option.legend.data = option.legend.data.filter(
                    e => typeof e !== "object"
                );
                option.series = option.series.filter(
                    e => !/-趋势线/.test(e.name)
                );
                if (fn) {
                    for (let i of data) {
                        if (i && i.data && i.data[0] && i.data[0].length == 3) {
                            var list = {
                                name: i.name + "-趋势线",
                                tag: true,
                                type: "line",
                                smooth: true,
                                symbolSize: 1,
                                data: fn(i.originData, ownOption[item])
                            };
                        } else {
                            var list = {
                                name: i.name + "-趋势线",
                                tag: true,
                                type: "line",
                                smooth: true,
                                symbolSize: 1,
                                data: fn(i.data, ownOption[item])
                            };
                        }
                        option.legend.data.push({ name: list.name, iii: "11" });
                        option.series.push(list);
                    }
                }
                break;
            default:
                break;
        }
    }

    countYMaxLen(ownOption) {
        // 正负号 所占 宽度
        const countWidth = 14;
        // y轴 最长 字符
        let maxYLen = "",
            maxYPx = 0,
            temp = [];
        let unit = {
            1000: "千",
            10000: "万",
            1000000: "百万",
            100000000: "亿"
        }[ownOption.yunit];
        if (ownOption.yunit === "none") {
            maxYLen = Math.max.apply(Array, this.Ydata.map(dd => Math.abs(dd)));
            maxYPx = this.measureTextWidth(Math.round(maxYLen)) + countWidth;
        } else {
            temp = this.Ydata.map(dd => Math.abs(dd)).map(dd => {
                return (dd / ownOption.yunit).toFixed(3);
            });
            maxYLen = Math.max.apply(Array, temp).toFixed(3) + unit;
            maxYPx = this.measureTextWidth(maxYLen) + countWidth;
        }
        // 计算px
        return maxYPx;
    }

    //设置grid

    // option.grid.bottom = 50;
    //  option.grid.left = 50;
    //  option.grid.right = 50;
    //  option.grid.top = 50;
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

    /*找出貌似最长的一个字符串*/
    getLabelMax(arr = []) {
        //判断有无趋势线
        let length = arr.length;
        let max = 0;

        if (
            typeof arr[length / 2] === "object" &&
            arr[length / 2].hasOwnProperty("name")
        ) {
            //如果有趋势线的话，找出最长的字符串
            for (let i = 0; i < length / 2; i++) {
                if (arr[i].length > max) {
                    max = arr[i].length;
                }
            }
            return max + 4;
        } else {
            for (let i = 0; i < length; i++) {
                if (arr[i].length > max) {
                    max = arr[i].length;
                }
            }
            return max;
        }
    }

    _customizeBar(option, htmlObj, enumOption) {
        //如果坐标轴 和  图例 在同一个位置，就需要计算坐标系位置
        // const chartMargin = 10;//图表边距
        // const titleHeight = 40;//标题高度
        // // const bottomGap = enumOption.axisTitle.length  ? 55 : 45;
        // let maxStrObj = this.getLabelMaxLength(option.legend.data);
        // // let lengthWidth = 10 + + 30 + this.measureTextWidth(maxStrObj.maxValue) + 10;
        return option;
    }

    //处理图例位置
    _handleExample(value, chartOption, htmlObj, ownOption) {
        const legendHeight = 28;
        const chartMargin = 10; //图表边距
        const titleHeight = 30; //标题高度
        /*chartOption.legend.top = 'auto';
    chartOption.legend.right = 'auto';
    chartOption.legend.left = 'auto';
    chartOption.legend.bottom = 'auto';*/
        chartOption.legend.orient = "horizontal";
        chartOption.legend.show = true;
        chartOption._grid =
            chartOption._grid || Object.assign({}, chartOption.grid);
        var option = {
            chartOption: chartOption,
            height: parseInt(htmlObj.clientHeight, 10),
            width: parseInt(htmlObj.clientWidth, 10),
            type: "line"
        };
        //计算图例的最长长度
        let exampleTitleLength = this.getLabelMax(chartOption.legend.data);
        chartOption.legend.option.width = exampleTitleLength * 16 + 30 + 10;
        let titleTop = ownOption.title.length > 0 ? 35 : 10;

        switch (value) {
            case "null":
                chartOption.legend.show = false;
                chartOption.grid.top = titleTop;
                break;
            case "top":
                chartOption.legend.show = true;
                chartOption.legend.left = "center";
                chartOption.legend.top = titleTop;
                chartOption.grid.top = titleTop + legendHeight;
                chartOption.grid.bottom +=
                    ownOption.xaxisTitle.length > 0 ? 20 : 0;
                break;
            case "left":
                chartOption.legend.show = true;
                chartOption.legend.left = 15;
                chartOption.legend.top = "center";
                chartOption.legend.orient = "vertical";
                chartOption.grid.top = titleTop;
                chartOption.grid.right = 20;
                chartOption.grid.left =
                    chartOption.legend.option.width +
                    (ownOption.yaxisTitle.length > 0 ? 20 : 5);
                chartOption.legend.width = chartOption.legend.option.width;
                break;
            case "right":
                chartOption.legend.show = true;
                chartOption.legend.right = 15;
                chartOption.legend.top = "center";
                chartOption.legend.orient = "vertical";
                chartOption.grid.top = titleTop;
                chartOption.grid.right =
                    chartOption.legend.option.width +
                    (ownOption.yaxisTitle.length > 0 ? 20 : 5);
                chartOption.legend.width = chartOption.legend.option.width;
                break;
            case "bottom":
                chartOption.legend.show = true;
                chartOption.legend.left = "center";
                chartOption.legend.orient = "horizontal";
                chartOption.legend.top = "auto";
                chartOption.legend.bottom = 10;
                chartOption.grid.top = titleTop;
                chartOption.grid.bottom +=
                    (ownOption.xaxisTitle.length > 0 ? 10 : 0) + legendHeight;
                break;
            default:
                break;
        }
    }
    _checkSql(ownData) {
        var types = ["Numeric", "Integer"],
            isInclude;
        const { metadata } = ownData;
        if (metadata && metadata.length > 3) {
            isInclude =
                types.includes(metadata[2].colType) &&
                types.includes(metadata[3].colType);
        } else if (metadata && metadata.length > 2) {
            isInclude =
                types.includes(metadata[1].colType) &&
                types.includes(metadata[2].colType);
        }

        if (
            !ownData.metadata ||
            !ownData.resultset ||
            ownData.metadata.length < 3 ||
            !isInclude
        ) {
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
        if (!this._checkSql(ownData)) {
            // util.popTips("WARING", "数据格式错误");
            this.queryStatusDom.show("数据格式错误", false);
            /* option.series.map(e => {
                e.data = [];
            }); */
            return option;
        }
        //查找截取数据
        var types = ["Numeric", "Integer"],
            inds = [];
        ownData.metadata.forEach((e, i) => {
            types.includes(e.colType) && inds.push(i);
        });
        let _result;
        _result =
            inds.length < 3
                ? ownData.resultset
                : ownData.resultset.map(e => {
                      return e.slice(0, inds[2]);
                  });

        //第一步找到lengend的类型和数量
        //包含详细信息的数组
        var dataset = {};
        if (_result) {
            var set = _result;
            if (set[0].length == 4) {
                //第一种情况  可以包含多个类别的情况
                for (let i = 0; i < set.length; i++) {
                    if (dataset.hasOwnProperty(set[i][1])) {
                        dataset[set[i][1]].push([
                            set[i][2],
                            set[i][3],
                            set[i][0],
                            set[i][1],
                            inds.length < 3 ? 0 : ownData.resultset[i][inds[2]]
                        ]);
                    } else {
                        dataset[set[i][1]] = [];
                        dataset[set[i][1]].push([
                            set[i][2],
                            set[i][3],
                            set[i][0],
                            set[i][1],
                            inds.length < 3 ? 0 : ownData.resultset[i][inds[2]]
                        ]);
                    }
                }
            } else if (set[0].length == 3) {
                for (let i = 0; i < set.length; i++) {
                    if (dataset.hasOwnProperty("未指定类别")) {
                        dataset["未指定类别"].push([
                            set[i][1],
                            set[i][2],
                            set[i][0],
                            "",
                            inds.length < 3 ? 0 : ownData.resultset[i][inds[2]]
                        ]);
                    } else {
                        dataset["未指定类别"] = [];
                        dataset["未指定类别"].push([
                            set[i][1],
                            set[i][2],
                            set[i][0],
                            "",
                            inds.length < 3 ? 0 : ownData.resultset[i][inds[2]]
                        ]);
                    }
                }
            }

            this.Ydata = Object.values(dataset)
                .reduce((prev, next) => {
                    return prev.concat(next);
                }, [])
                .map(dd => dd[1]);

            //第二种情况   没有类别这个字段的情况
        }
        //不包含详细信息的数组
        var originset = {};
        if (_result) {
            var set = _result;
            if (set[0].length == 4) {
                for (let i = 0; i < set.length; i++) {
                    if (originset.hasOwnProperty(set[i][1])) {
                        originset[set[i][1]].push([set[i][2], set[i][3]]);
                    } else {
                        originset[set[i][1]] = [];
                        originset[set[i][1]].push([set[i][2], set[i][3]]);
                    }
                }
            } else if (set[0].length == 3) {
                for (let i = 0; i < set.length; i++) {
                    if (originset.hasOwnProperty("未指定类别")) {
                        originset["未指定类别"].push([set[i][1], set[i][2]]);
                    } else {
                        originset["未指定类别"] = [];
                        originset["未指定类别"].push([set[i][1], set[i][2]]);
                    }
                }
            }
        }

        this.setChartData(option, dataset, originset, inds, _result, ownData);
        return option;
    }

    _handleDataSetData() {
        let self = this;
        const { chartDefinition } = this.cfg;
        const { data, query } = chartDefinition;
        let _data = this._grupDataSet();
        if (data.success === false || JSON.stringify(_data) === "{}") {
            return;
        }
        let handleObj = {
            series: [],
            legendData: []
        };
        let xDataHandle =
            query.datasetSetting.cellsConfig.xAxis.fields[0].config;
        let yDataHandle =
            query.datasetSetting.cellsConfig.yAxis.fields[0].config;
        //确定节点大小， 限制在10 => 100 中;
        let bindMax,
            bindMin,
            max,
            min,
            limitFunc,
            sizeArr,
            symbelSizeArr = chartDefinition.option.symbolSize;
        if (_data.size.length) {
            sizeArr = _data.size.map(e => e[0]);
            max = Math.max.apply(Array, sizeArr);
            min = Math.min.apply(Array, sizeArr);
            (bindMin = symbelSizeArr[0]), (bindMax = symbelSizeArr[1]);
            limitFunc = param => {
                var valuue;
                valuue = param
                    ? ((Number(param) - min) / (max - min)) *
                          (bindMax - bindMin) +
                      bindMin
                    : symbelSizeArr[0];
                return valuue;
            };
        }
        let getSeries = function(type) {
            var series = $.extend(true, {}, self._option.series[0]);
            series.name = "";
            series.data = [];
            for (let i in _data.xAxis) {
                if (!_data.xAxis[i][0] || !_data.yAxis[i][0]) {
                    continue;
                }
                let x = Util.formatData2Num(_data.xAxis[i][0], xDataHandle);
                let y = Util.formatData2Num(_data.yAxis[i][0], yDataHandle);
                if (type) {
                    if (_data.types[i][0].toString() === type) {
                        _data.size.length
                            ? series.data.push([
                                  x,
                                  y,
                                  _data.name[i][0],
                                  type,
                                  _data.size[i][0]
                              ])
                            : series.data.push([
                                  x,
                                  y,
                                  _data.name[i][0],
                                  type,
                                  10
                              ]);
                    }
                } else {
                    _data.size.length
                        ? series.data.push([
                              x,
                              y,
                              _data.name[i][0],
                              "",
                              _data.size[i][0]
                          ])
                        : series.data.push([x, y, _data.name[i][0], "", 10]);
                }
            }
            if (_data.size.length) {
                series.symbolSize = function(value) {
                    // let size = Number(value[4]) ? value[4] : 10;
                    return limitFunc(value[4]);
                };
            } else {
                series.symbolSize = symbelSizeArr[0];
            }
            return series;
        };

        if (_data.types.length === 0) {
            let series = getSeries();
            handleObj.series.push(series);
        } else {
            let types = [];
            for (let item of _data.types) {
                types.push(item[0] + "");
            }
            types = [...new Set(types)];
            for (let type of types) {
                var series = getSeries(type);
                series.name = type;
                handleObj.series.push(series);
            }
            handleObj.legendData = types;
        }

        this._option.tooltip.formatter = params => {
            let { name, xAxis, yAxis } = query.datasetSetting.cellsConfig;
            let xdataHandle = xDataHandle;
            xdataHandle.formatMask = xAxis.fields[0].field.formatMask;
            let ydataHandle = yDataHandle;
            ydataHandle.formatMask = yAxis.fields[0].field.formatMask;
            let x = Util.formatData2Str(params.value[0], xdataHandle);
            let y = Util.formatData2Str(params.value[1], ydataHandle);
            if (params.value.length > 1) {
                return (
                    params.seriesName +
                    (params.seriesName ? ":" : "") +
                    (params.value[2] ? params.value[2] : "") +
                    " <br/>" +
                    xAxis.fields[0].config.cellName +
                    ":" +
                    x +
                    " <br/>" +
                    yAxis.fields[0].config.cellName +
                    ":" +
                    y +
                    " <br/>"
                );
            }
        };

        this._option.series = handleObj.series;
        this._option.legend.data = handleObj.legendData;
        this._legendSerise = handleObj.legendData;

        return this._option;
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
        var myRegression = ecStat.regression(
            "linear",
            data.map(e => e.slice(0, 2))
        );
        myRegression.points.sort(function(a, b) {
            return a[0] - b[0];
        });
        return myRegression.points;
    }
    exponential(data) {
        var myRegression1 = ecStat.regression(
            "exponential",
            data.map(e => e.slice(0, 2))
        );
        myRegression1.points.sort(function(a, b) {
            return a[0] - b[0];
        });
        return myRegression1.points;
    }
    logarithmic(data) {
        var myRegression2 = ecStat.regression(
            "logarithmic",
            data.map(e => e.slice(0, 2))
        );
        myRegression2.points.sort(function(a, b) {
            return a[0] - b[0];
        });
        return myRegression2.points;
    }
    polynomial(data, tag) {
        var myRegression3 = ecStat.regression(
            "polynomial",
            data.map(e => e.slice(0, 2)),
            tag
        );
        myRegression3.points.sort(function(a, b) {
            return a[0] - b[0];
        });
        return myRegression3.points;
    }
    colorRgb(sColor, opacityValue) {
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
        var sColor = sColor.toLowerCase();
        if (sColor && reg.test(sColor)) {
            if (sColor.length === 4) {
                var sColorNew = "#";
                for (var i = 1; i < 4; i += 1) {
                    sColorNew += sColor
                        .slice(i, i + 1)
                        .concat(sColor.slice(i, i + 1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for (var i = 1; i < 7; i += 2) {
                sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
            }
            return (
                "rgba(" +
                sColorChange.join(",") +
                "," +
                opacityValue / 100 +
                ")"
            );
        } else {
            let sColorArray = sColor.split("(");
            let step1 = sColorArray[1].split(",");
            let r = step1[0];
            let g = step1[1];
            let b = step1[2];
            let returnColor =
                "rgba(" +
                r +
                "," +
                g +
                "," +
                b +
                "," +
                opacityValue / 100 +
                ")";
            return returnColor;
        }
    }
    maxLength(arr) {
        let maxLength = 0;
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i].length > maxLength) maxLength = arr[i].length;
        }
        return maxLength;
    }
    setChartData(chartOption, lengend, originLengend, inds, _result, ownData) {
        var series = [];
        var keyArray = Object.keys(lengend);
        let bindMax,
            bindMin,
            max,
            min,
            limitFunc,
            sizeArr,
            symbelSizeArr = this.cfg.chartDefinition.option.symbolSize;
        //确定节点大小， 限制在10 => 100 中;
        if (inds.length > 2) {
            sizeArr = ownData.resultset.map(e => e[inds[2]]);
            max = Math.max.apply(Array, sizeArr);
            min = Math.min.apply(Array, sizeArr);
            (bindMin = symbelSizeArr[0]), (bindMax = symbelSizeArr[1]);
            limitFunc = param => {
                var valuue;
                valuue = param
                    ? ((Number(param) - min) / (max - min)) *
                          (bindMax - bindMin) +
                      bindMin
                    : symbelSizeArr[0];
                return valuue;
            };
        }
        for (var i = 0; i < keyArray.length; i++) {
            var seriesTemplate = Immutable.fromJS(chartOption.series[0]).toJS();
            seriesTemplate.name = keyArray[i];
            seriesTemplate.data = lengend[keyArray[i]];
            seriesTemplate.originData = originLengend[keyArray[i]];
            if (inds.length > 2) {
                seriesTemplate.symbolSize = function(value) {
                    // let size = Number(value[4]) ? value[4] : 10;
                    return limitFunc(value[4]);
                };
            } else {
                seriesTemplate.symbolSize = symbelSizeArr[0];
            }
            series.push(seriesTemplate);
        }
        chartOption.legend.data = keyArray;
        chartOption.series = series;
        return chartOption;
    }
}
