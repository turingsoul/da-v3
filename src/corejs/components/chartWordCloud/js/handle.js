import WidgetBase from "corejs/components/base";
import Immutable, { Map, is } from "immutable";
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
                    _params.category.value = e.name;
                    _params.value.value = e.value;
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
        //处理样式操作数据
        this._option = this._handleEnumOption(
            chartDefinition.option,
            this._option,
            this.htmlObj
        );
        return this._option;
    }
    //处理可枚举属性
    _handleEnumOption(store, option, htmlObj) {
        for (let item in store) {
            this._handlePerStore(item, store[item], option, htmlObj, store);
        }
        return option;
    }
    //处理属性
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

            //图表颜色
            case "color":
                if (value.length > 0) {
                    option.series[0].textStyle = {
                        normal: {
                            color: function() {
                                return value[
                                    Math.floor(Math.random() * value.length)
                                ];
                            }
                        }
                    };
                }
                break;
            case "textColor":
                if (value.length > 0) {
                    //设置主要颜色
                    option.title.textStyle.color = value[0];
                }
                break;
            //形状
            case "worldType":
                option.series[0].shape = value;
            //文字大小
            case "fontSize":
                option.series[0].sizeRange = value;
                break;
            //文字间距
            case "fontSpace":
                option.series[0].gridSize = parseInt(value);
                break;
            //文字角度
            case "fontAngle":
                option.series[0].rotationRange = [
                    0,
                    value === "auto" ? 90 : parseInt(value)
                ];
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
            case "showValue":
                value && htmlObj.style && (htmlObj.style[item] = value);
                break;
            default:
                break;
        }
    }
    //设置formatter
    _setFormatter(option, formatterData) {
        option.tooltip.formatter = function(param) {
            const name = (param.name && param.name !== "null") ? param.name : '-';
            const value = param.value ? param.value : '-';
            return (
                name +
                "</br>" +
                (formatterData.colName || "词频") +
                ":" +
                value
            );
            // return ;
        };
    }
    //数据集数据
    _handleDataSetData(drillName) {
        const { chartDefinition } = this.cfg;
        let option = this._option,
            ownOption = chartDefinition.option,
            data = chartDefinition.data,
            dataObj = { legend: [], data: [] };
        let ownData = Immutable.fromJS(data).toJS();

        let fields =
            chartDefinition.query.datasetSetting.cellsConfig.counter.fields;
        let dataHandle = null;
        if (fields.length) {
            dataHandle = fields[0].config || {};
            dataHandle.formatMask = fields[0].field.formatMask;
        }

        if (is(Map(ownData), Map({}))) return option;
        //当有数据的时候执行以下逻辑 types类别 counter指标
        const { util } = window.Dashboard;
        if (!ownData.metadata) {
            // util.popTips("WARING", "数据格式错误");
            option.series[0].data = [];
            return option;
        }
        const { cellToInd } = chartDefinition.query.datasetSetting;
        let _data = this._grupDataSet(),
            len = _data.counter[0] && _data.counter[0][0] ? _data.counter[0].length : 0;

        /* option.series[0].data = _data.types.map((e, i) => {
            let final =
                len && fields.length
                    ? Util.formatData2Num(_data.counter[i][0], dataHandle)
                    : 1;
            return {
                name: e[0],
                value: final
            };
        }); */
        var data8 = {},
            data1 = [];
        _data.types.forEach((e, i) => {
            data8[e[0]] = data8[e[0]] || [];
            e[1] = len === 1 ? _data.counter[i][0] : 1;
            data8[e[0]].push(e);
        });
        data1 = Object.values(data8).map(e => {
            var value =
                e.length > 1
                    ? e.reduce(
                          (a, b) => (typeof a === "number" ? a : a[1]) + b[1]
                      )
                    : e[0][1];
            return {
                name: (e[0][0] && e[0][0]!=="null") ? e[0][0] : "-",
                value: Util.formatData2Num(value, dataHandle)
            };
        });
        option.series[0].data = data1;
        this._setFormatter(
            option,
            data.metadata[
                cellToInd.counter[0] !== undefined ? cellToInd.counter[0] : 1
            ] || {}
        );

        option.tooltip.formatter = function(e) {
            var content = "";
            e.value = fields.length
                ? Util.formatData2Str(e.value, dataHandle)
                : e.value;
            const name = (e.data.name && e.data.name !== "null")  ? e.data.name : '-';
            const value = e.value ? e.value : '-';
            content = name + "：" + value + "<br/>";
            return content;
        };
    }
    _checkSql(ownData) {
        var types = ["Numeric", "Integer"];
        const { metadata } = ownData;

        if (
            !ownData.metadata ||
            !ownData.resultset ||
            !ownData.metadata[0] ||
            (ownData.metadata[1] && !types.includes(metadata[1].colType))
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

        let _result = ownData.resultset;
        //第一列作为展示的数据
        const { util } = window.Dashboard;
        if (
            /* !ownData.metadata ||
            !ownData.metadata[0] ||
            (ownData.metadata[1] &&
                ["Integer", "Numeric"].indexOf(ownData.metadata[1].colType) ===
                    -1) */
            !this._checkSql(ownData)
        ) {
            // util.popTips("WARING", "数据格式错误");
            this.queryStatusDom.show("数据格式错误", false);
            option.series[0].data = [];
            return option;
        }
        option.series[0].data = this.setSeriesData(
            _result,
            ownData.metadata.length
        );
        this._setFormatter(option, data.metadata[1] || {});
        return option;
    }
    setSeriesData(result = [], len) {
        var data = {},
            data1 = [];
        result.forEach(e => {
            data[e[0]] = data[e[0]] || [];
            e[1] = len === 1 ? 1 : e[1];
            data[e[0]].push(e);
        });
        data1 = Object.values(data).map(e => {
            return {
                name: e[0][0],
                value:
                    e.length > 1
                        ? e.reduce(
                              (a, b) =>
                                  (typeof a === "number" ? a : a[1]) + b[1]
                          )
                        : e[0][1]
            };
        });
        return data1;
    }
}
