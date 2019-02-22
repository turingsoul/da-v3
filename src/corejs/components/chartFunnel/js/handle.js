import WidgetBase from "corejs/components/base";
import Immutable, { Map, is } from "immutable";
import _ from "lodash";
import Util from "corejs/util/util";
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
        if (!arguments[2]) {
            //缓存下钻信息清除
            this.drillData = null;
        }
        return super.doQuery(...arguments);
    }

    /**
     * 数据集类型数据源下钻
     * @param {Object} e 时间参数
     */
    datasetDrill(e) {
        const { cellsConfig } = this.cfg.chartDefinition.query.datasetSetting;
        const { types } = cellsConfig;
        const xAxisFields = types.fields;
        let nextIdx; //下一层
        //不足两个不能下钻
        if (xAxisFields.length < 2) {
            return;
        }

        //如果不存在，初始化 drillData
        if (this.drillData === null) {
            this.drillData = {
                cellKey: "types",
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
                    this._drilName = e.name;
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
                    _params.category.value = e.data.name;
                    // _params.series.value = e.seriesName;
                    _params.value.value = e.data.value;
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
    //处理样式操作的option
    _handleOption(option) {
        //处理option
        const chartDefinition = this.cfg.chartDefinition;
        let myOption = chartDefinition.option;
        //处理样式操作数据
        this._option = this._handleEnumOption(
            myOption,
            this._option,
            this.htmlObj
        );
        //数据显示和标签样式
        this._lableAndData(myOption.showLabel, myOption.showData);
        //处理预警
        this._handlewarn(
            chartDefinition.option.warns,
            option,
            chartDefinition.data,
            chartDefinition.option.orientation
        );
        //处理代码注入数据
        // this._option = handleChart.handleInjectOption(chartDefinition.injectOption,this._option);
        return this._option;
    }
    _lableAndData(showLabelPos, showData) {
        var _eee = null;
        if (showData) {
            this._option.series[1] = _eee = Immutable.fromJS(
                this._option.series[0]
            ).toJS();
            _eee.itemStyle.normal.color = "transparent";
            _eee.itemStyle.normal.borderColor = "transparent";
            _eee.label.normal = {
                position: "inside",
                formatter: showLabelPos !== "inside" ? "{c}" : "{b}:{c}",
                show: true
            };
            showLabelPos === "inside" &&
                (this._option.series[0].label.normal.show = false);
        }
    }
    //处理可枚举属性
    _handleEnumOption(store, option, htmlObj) {
        for (let item in store) {
            this._handlePerStore(item, store[item], option, htmlObj, store);
        }
        return option;
    }
    //初始化图表的数据
    _initOption() {
        const { util } = window.Dashboard;
        const { defaultOption } = this.cfg.chartDefinition;
        let thisOption = util.copy(true, {}, defaultOption, this._option);
        util.copy(true, this._option, thisOption);
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
            case "sort":
                option.series.map(e => {
                    e.sort = value;
                });
                break;
            case "isExportData":
                Dashboard.lib
                    .$("#" + this.cfg.id + " .chartCsv")
                    .css({ display: value ? "block" : "none" });
                break;
            case "example":
                this.handleExample(value, option, htmlObj, ownOption);
                break;
            case "showLabel":
                option.series.map(i => {
                    value === "0" && (i.label.normal.show = false);
                    i.label.normal.position = value;
                });
                break;
            case "color":
                if (value.length > 0) {
                    option.color = value;
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
                }
                break;
            default:
                break;
        }
    }
    //图例位置处理
    handleExample(value, chartOption, htmlObj, ownOption) {
        chartOption.legend.top = "auto";
        chartOption.legend.right = "auto";
        chartOption.legend.left = "auto";
        chartOption.legend.bottom = "auto";
        chartOption.legend.orient = "horizontal";
        chartOption.legend.show = true;
        var option = {
            chartOption: chartOption,
            height: parseInt(htmlObj.clientHeight, 10),
            width: parseInt(htmlObj.clientWidth, 10),
            type: "pie"
        };
        option.chartOption.legend.type = "scroll";
        if (ownOption.title.length > 0 && chartOption.grid) {
            chartOption.grid.top += 10;
        }
        switch (value) {
            case "null":
                chartOption.legend.show = false;
                break;
            case "top":
                chartOption.legend.top = ownOption.title.length > 0 ? 40 : "0";
                chartOption.legend.left = "center";
                break;
            case "left":
                chartOption.legend.left = "20";
                chartOption.legend.orient = "vertical";
                chartOption.legend.top = ownOption.title.length > 0 ? 40 : 20;
                this._setlegendTooltip();
                break;
            case "right":
                chartOption.legend.right = "20";
                chartOption.legend.orient = "vertical";
                chartOption.legend.top = ownOption.title.length > 0 ? 40 : 20;
                this._setlegendTooltip();
                break;
            case "bottom":
                chartOption.legend.left = "center";
                chartOption.legend.bottom = "20";
                break;
            default:
                null;
        }
        this.lengendFn(option, value, ownOption);
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
    lengendFn(option, type, ownOption) {
        var datas = option.chartOption.legend.data;
        var yh = option.height;
        var xh = option.width;
        var len = {};
        let pieTop = 0;
        var aa;
        //判断标签位置  重置标准半径
        var R = ownOption.labelPos === "outside" ? 0.5 : 0.8,
            outerR;
        var innerR = parseFloat(ownOption.radius) / 100;
        option.chartOption.series.forEach((e, i) => {
            switch (type) {
                case "top":
                    aa = parseInt(ownOption.title.length > 0 ? 40 : "0");
                    e.top = aa + 35;
                    e.height = (((yh - e.top) * 0.9) / yh) * 100 + "%";
                    break;
                case "bottom":
                    aa = parseInt(ownOption.title.length > 0 ? 40 : "0");
                    e.top = aa + 0;
                    e.height = (((yh - e.top - 30) * 0.9) / yh) * 100 + "%";
                    break;
                case "left":
                    len.maxLeg = this.getLabelMaxLength(datas);
                    aa =
                        /* this.measureTextWidth(len.maxLeg.maxValue) */ 90 +
                        30;
                    len.titH = parseInt(ownOption.title.length > 0 ? 50 : 10);
                    e.top = len.titH;
                    e.height = (((yh - e.top) * 0.9) / yh) * 100 + "%";
                    e.left = aa + 20;
                    e.width = (((xh - e.left) * 0.9) / xh) * 100 + "%";
                    break;
                case "right":
                    len.maxLeg = this.getLabelMaxLength(datas);
                    aa =
                        /* this.measureTextWidth(len.maxLeg.maxValue) */ 90 +
                        30;
                    len.titH = parseInt(ownOption.title.length > 0 ? 50 : 10);
                    e.top = len.titH;
                    e.height = (((yh - e.top) * 0.9) / yh) * 100 + "%";
                    e.right = aa + 20;
                    e.width = (((xh - e.right) * 0.9) / xh) * 100 + "%";
                    break;
                default:
                    break;
            }
        });
    }
    //处理枚举属性  生成option
    handleEnumOption(store, option, htmlObj) {
        for (let item in store) {
            this.handlePerStore(item, store[item], option, htmlObj, store);
        }
        return option;
    }
    //处理代码注入 反编译
    handleInjectOption(intocode, option) {
        for (let item in intocode) {
            this.handlePercode(item, option);
        }
        return option;
    }
    handleInject(item, option) {}
    /**
     * 处理预警
     * @param {*} warn 预警字段
     * @param {*} option 图表配置项
     * @param {*} data 图表数据
     */
    _handlewarn(warn, option, data, orientation) {
        if (!data.metadata || !this._legendSerise || !warn.switch) {
            return false;
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
            let e = option.series[0];
            let selfSeries = _series.find(
                el => el.series.indexOf(warn.seriesList) !== -1
            );
            selfSeries &&
                e.data.forEach((item, i) => {
                    if (
                        // eval(item.value + selfSeries.filter + selfSeries.value)
                        new Function(
                            "",
                            "return " +
                                item.value +
                                selfSeries.filter +
                                selfSeries.value
                        )()
                    ) {
                        item.itemStyle = item.itemStyle || { normal: {} };
                        item.itemStyle.normal.color = selfSeries.color;
                    }
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
    //处理数据
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
        this._legendSerise = [lengend[0]];
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
        this.setChartData(option, axisDataFilter, zipDataFilter);
        return option;
    }
    //数据集数据
    _handleDataSetData(drillName) {
        const { chartDefinition } = this.cfg;
        let option = this._option,
            ownOption = chartDefinition.option,
            data = chartDefinition.data,
            dataObj = { legend: [], data: [] };
        let ownData = Immutable.fromJS(data).toJS();
        if (is(Map(ownData), Map({}))) return option;
        //当有数据的时候执行以下逻辑 types类别 counter指标
        const { util } = window.Dashboard;
        if (!ownData.metadata) {
            // util.popTips("WARING", "数据格式错误");
            option.series[0].data = [];
            return option;
        }
        /* //预警字段添加
        const { counter } = chartDefinition.query.datasetSetting.cellsConfig;
        this._legendSerise = counter.fields.map(e => e.config.cellName);
        // this._legendSerise = [ownData[0]];
        let _data = this._grupDataSet();
        let dataHandle = counter.fields[0].config.dataHandle || {
            model: "auto"
        };
        dataHandle.formatMask = counter.fields[0].field.formatMask;
        _data.types.forEach((e, i) => {
            dataObj.legend.push(e[0]);
            dataObj.data.push({
                name: e[0],
                value: Util.formatData2Num(_data.counter[i], dataHandle)
            });
        }); */
        //构建数据
        let _resultset = [],
            { cellsConfig, cellToInd } = chartDefinition.query.datasetSetting;
        //构建数据
        let _data = this._grupDataSet();
        _resultset = _data.types.map((e, i) => {
            return e.concat(_data.counter[i]);
        });
        //获取图例数据
        var changeData = this.getChangeData(
            _resultset,
            cellToInd.counter,
            ownOption
        );
        this._drilName = drillName;
        var axisData = changeData.axisData; //获取横坐标 lebal
        var _this = this;
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
        zipDataFilter = this.zip(zipDataFilter);

        //预警字段添加
        const { counter } = chartDefinition.query.datasetSetting.cellsConfig;
        this._legendSerise = counter.fields.map(e => e.config.cellName);
        // this._legendSerise = [ownData[0]];
        // let _data = this._grupDataSet();
        let dataHandle =
            counter.fields[0] && counter.fields[0].config
                ? counter.fields[0].config
                : {};
        dataHandle.formatMask =
            counter.fields[0] &&
            counter.fields[0].field &&
            counter.fields[0].field.formatMask
                ? counter.fields[0].field.formatMask
                : "";
        /* const _axisDataFilter = axisDataFilter.map((ele) => {
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
        dataObj.legend = axisDataFilter;

        zipDataFilter.length &&
            zipDataFilter[0].forEach((e, i) => {
                let formatData = Util.formatData2Num(e, dataHandle);
                dataObj.data.push({
                    name: axisDataFilter[i],
                    value: formatData
                });
            });

        dataObj.legend.forEach((e, i) => {
            e == null && (dataObj.legend[i] = "");
        });
        option.legend.data = dataObj.legend;
        option.legend.formatter = function(param) {
            let _name = param || "-";
            _name = _name.replace(/(^null~)|(~null)/g, "");
            return _name;
        };
        option.series[0].data = dataObj.data;
        option.tooltip.formatter = e => {
            var content = "";
            e.value = Util.formatData2Str(e.value, dataHandle);
            if (e.value == null || e.value == undefined) {
                e.value = "-";
            }
            content = _this.pingjie(e.data.name) + "：" + e.value + "<br/>";
            return content;
        };
        return option;
    }
    //tooltip中的拼接
    pingjie(_name) {
        _name = _name + "" || "-";
        _name = _name.replace(/(^null~)|(~null)/g, "");
        return _name;
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
    setChartData(chartOption, axisData, zipData) {
        let pieSeriesData = this.getValueForName(zipData[0], axisData);
        chartOption.legend.data = axisData;
        chartOption.series[0].data = pieSeriesData;
    }
    getValueForName(value = [], name) {
        let arr = [];
        for (let i = 0; i < value.length; i++) {
            let item = {
                value: value[i],
                name: name[i]
            };
            arr.push(item);
        }
        // this._option.series[0].max = Math.max.apply(null, value);
        return arr;
    }
}
