import WidgetBase from "corejs/components/base";

import Immutable from "immutable";
import Util from "corejs/util/util";

import $ from "jquery";
export default class handle extends WidgetBase {
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    _bindClickEvent() {
        this.echartsDom.on("click", e => {
            const chartDefinition = this.cfg.chartDefinition;
            const params = chartDefinition.option.clickParmas;
            switch (chartDefinition.option.clickEvent) {
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

    /**
     *
     * @param {*} tempOption  大模板
     * @param {*} enumOption  枚举属性
     * @param {*} htmlObj
     */
    _handleEnumOption(tempOption, enumOption, htmlObj) {
        for (let item in enumOption) {
            this._handlePerOption(
                item,
                enumOption[item],
                tempOption,
                htmlObj,
                enumOption
            );
        }
        return tempOption;
    }
    _handlePerOption(item, value, option, htmlObj, enumOption) {
        let tempArr;
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
                // option.series.top = 40 + 5;
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
                var dom =
                    document.querySelector("#" + this.cfg.id) || this.htmlObj;
                var _obj = dom.querySelector(".chartCsv");
                _obj && (_obj.style.display = value ? "block" : "none");
                break;
            case "color":
                if (value.length > 0) {
                    option.color = value;
                }
                break;
            case "backgroundColor":
                value && (htmlObj.style[item] = value);
                if (this.cfg.parentId) {
                    htmlObj.style[item] = "rgba(0, 0, 0, 0)";
                }
                break;
            case "textColor":
                if (value.length > 0) {
                    //设置主要颜色
                    option.title.textStyle.color = value[0];
                    //设置次要颜色
                    // 刻度文字、坐标名字
                    value[1] && (option.series[0].label.color = value[1]);
                }
                break;
            case "lineColor":
                if (value.length > 0) {
                    option.series[0].lineStyle.color = value[0];
                }
                break;

            case "example":
                this.handleExample(item, value, option, htmlObj, enumOption);
                break;
            case { showData: "showData", nodeText: "nodeText" }[item]:
                this.handleTextShow(option, enumOption);
                break;
            case "curveness":
                option.series[0].lineStyle.curveness = value;
                break;
            case "nodeType":
                option.series[0].symbol = value;
                break;
            case "nodeSize":
                // option.series[0].symbolSize = value;
                break;
            case "nodeDrag":
                option.series[0].draggable = value;
                break;
            case "nodeRepulsion":
                option.series[0].force.repulsion = value;
                break;
            case { mouseScale: "mouseScale", move: "move" }[item]:
                //scale move true false
                if (enumOption.mouseScale) {
                    if (enumOption.move) {
                        option.series[0].roam = true;
                    } else {
                        option.series[0].roam = "scale";
                    }
                } else {
                    if (enumOption.move) {
                        option.series[0].roam = "move";
                    } else {
                        option.series[0].roam = false;
                    }
                }
                break;
            default:
                break;
        }
    }
    /**
     * 处理 数据显示  和 文字 显示
     * @param {*} option
     * @param {*} enumOption
     */
    handleTextShow(option, enumOption) {
        let func = function(e) {};
        if (enumOption.nodeText) {
            if (enumOption.showData) {
                func = e => "{a|" + e.name + "}\n{b|" + e.value + "}";
            } else {
                func = e => e.name;
            }
        } else {
            if (enumOption.showData) {
                func = e => e.value;
            } else {
                option.series[0].label.show = false;
                return option;
            }
        }
        option.series[0].label.show = true;
        option.series[0].label.formatter = func;
        return option;
    }
    handleExample(item, value, option, htmlObj, enumOption) {
        option.legend.show = true;
        Object.assign(option.legend, {
            left: "auto",
            right: "auto",
            top: "auto",
            bottom: "auto"
        });
        option.legend.bottom = 30;
        switch (value) {
            case "top":
                option.legend.orient = "horizontal";
                option.legend.top = enumOption.title.length ? 40 : 0;
                option.legend.left = "center";
                break;
            case "bottom":
                option.legend.orient = "horizontal";
                option.legend.bottom = 30;
                option.legend.left = "center";
                break;
            case "left":
                option.legend.orient = "vertical";
                // option.legend.top = "middle";
                option.legend.left = 30;
                option.legend.bottom = 30;
                break;
            case "right":
                option.legend.orient = "vertical";
                // option.legend.top = "middle";
                option.legend.right = 30;
                option.legend.bottom = 30;
                break;
            case "null":
                option.legend.show = false;
                break;
            default:
        }
        return option;
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
    _checkSql(ownData) {
        var types = ["Numeric", "Integer"];
        const { metadata } = ownData;

        if (
            !ownData.metadata ||
            !ownData.resultset ||
            metadata.length < 3 ||
            metadata[0].colType != "String" ||
            metadata[1].colType != "String" ||
            !types.includes(metadata[2].colType)
        ) {
            return false;
        }
        return true;
    }
    _handleData(drillName) {
        const { chartDefinition } = this.cfg;
        let tempOption = this._option,
            enumOption = chartDefinition.option,
            data = chartDefinition.data;
        // _handleData(data, tempOption, enumOption) {
        // 检测是否符合类型
        if (
            /* data.metadata[0].colType != "String" ||
            data.metadata[1].colType != "String" ||
            (data.metadata[2].colType != "Numeric" &&
                data.metadata[2].colType != "Integer") */
            !this._checkSql(data)
        ) {
            // console.warn("数据格式错误");
            this.queryStatusDom.show("数据格式错误", false);
            return false;
        }

        //分离出类目
        //构造item
        //构造links
        let categories = [],
            links = [],
            items = [],
            itemsObj = [],
            len = 0,
            valueArr = [];
        let bindMax, bindMin, max, min, limitFunc;

        data.resultset.forEach(el => {
            categories.push(el[1], el[4]);
            valueArr.push(el[2], el[5]);
            //分离出 唯一item,和它的id
            let link = {
                source: "",
                target: "",
                label: el[6]
                    ? { show: true, formatter: el[6], color: "#919499" }
                    : null
            };
            if (!items.includes(`${el[0]}+${el[1]}`)) {
                len = items.push(`${el[0]}+${el[1]}`) - 1;
                itemsObj.push({
                    id: len,
                    name: el[0],
                    value: el[2],
                    category: el[1],
                    symbolSize: el[2]
                });
            } else {
                len = items.indexOf(`${el[0]}+${el[1]}`);
            }

            link.source = len;

            if (!items.includes(`${el[3]}+${el[4]}`)) {
                len = items.push(`${el[3]}+${el[4]}`) - 1;
                itemsObj.push({
                    id: len,
                    name: el[3],
                    value: el[5],
                    category: el[4],
                    symbolSize: el[5]
                });
            } else {
                len = items.indexOf(`${el[3]}+${el[4]}`);
            }
            link.target = len;

            //构造links
            links.push(link);
        });
        //确定节点大小， 限制在10 => 100 中;
        max = Math.max.apply(Array, valueArr);
        min = Math.min.apply(Array, valueArr);
        (bindMin = 10), (bindMax = 100);
        limitFunc = param =>
            ((Number(param) - min) / (max - min)) * (bindMax - bindMin) +
            bindMin;
        //item  的category 还没有确定，需要 对应到 categories  里面的index
        categories = [...new Set(categories)];
        itemsObj.forEach(item => {
            item.category = categories.indexOf(item.category);
            item.symbolSize = limitFunc(item.symbolSize) * enumOption.nodeSize;
        });

        tempOption.series[0].links = links;
        tempOption.series[0].categories = categories.map(cat => ({
            name: cat
        }));
        tempOption.series[0].data = itemsObj;
        tempOption.legend.data = categories;
        return tempOption;
    }

    _handleDataSetData() {
        let self = this;
        const { chartDefinition } = this.cfg,
            enumOption = chartDefinition.option;
        const { data, query } = chartDefinition;
        let _data = this._grupDataSet();
        if (JSON.stringify(_data) === "{}") {
            return;
        }
        let {
            relation,
            nodeData,
            tarNodeData
        } = query.datasetSetting.cellsConfig;
        let bindMax, bindMin, max, min, limitFunc;
        let valueArr = _data.nodeData.map(e => {
            return e[0] || 0;
        });
        //确定节点大小， 限制在10 => 100 中;
        max = Math.max.apply(Array, valueArr);
        min = Math.min.apply(Array, valueArr);
        (bindMin = 10), (bindMax = 100);
        limitFunc = param =>
            ((Number(param) - min) / (max - min)) * (bindMax - bindMin) +
            bindMin;
        //转化数据
        let nodeDataHandle =
            nodeData.fields[0] && nodeData.fields[0].config
                ? nodeData.fields[0].config
                : {};
        nodeDataHandle.formatMask =
            nodeData.fields[0] &&
            nodeData.fields[0].field &&
            nodeData.fields[0].field.formatMask
                ? nodeData.fields[0].field.formatMask
                : "";
        let tarNodeDataHandle =
            tarNodeData.fields[0] && tarNodeData.fields[0].config
                ? tarNodeData.fields[0].config
                : {};
        tarNodeDataHandle.formatMask =
            tarNodeData.fields[0] &&
            tarNodeData.fields[0].field &&
            tarNodeData.fields[0].field.formatMask
                ? tarNodeData.fields[0].field.formatMask
                : "";

        let handleObj = {
            categories: [],
            nodes: [],
            links: [],
            items: [], //所有的node
            types: [] //所有的类别
        };
        let defaultNode = {
            category: 0,
            id: "",
            name: "",
            symbolSize: 10,
            value: ""
        };

        let defaultLink = {
            name: null,
            source: "",
            target: "",
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            }
        };

        let getNode = function(i) {
            let node = false;
            let nodeType = _data.nodeType.length && _data.nodeType[i][0];
            let nodeId = nodeType
                ? _data.node[i][0] + "node~" + _data.nodeType[i][0]
                : _data.node[i][0] + "node";
            let nodeData = Util.formatData2Str(
                _data.nodeData[i][0],
                nodeDataHandle
            );
            if (_data.node[i][0] && handleObj.items.indexOf(nodeId) === -1) {
                handleObj.items.push(nodeId);
                node = $.extend(true, {}, defaultNode);
                node.id = nodeId;
                node.name = nodeData;
                node.value = nodeData;
                node.symbolSize = limitFunc(nodeData || 1) * enumOption.nodeSize;
                node.category = nodeType
                    ? handleObj.types.indexOf(
                          _data.node[i][0] + "node~" + _data.nodeType[i][0]
                      )
                    : 0;
            }
            return { node: node, nodeId: nodeId };
        };

        let getTarNode = function(i) {
            let node = false;
            let nodeType = _data.tarNodeType.length && _data.tarNodeType[i][0];
            let targetId = nodeType
                ? _data.tarNode[i][0] + "target~" + _data.tarNodeType[i][0]
                : _data.tarNode[i][0] + "target";
            let tarNodeData = Util.formatData2Str(
                _data.tarNodeData[i][0],
                tarNodeDataHandle
            );
            if (
                _data.tarNode[i][0] &&
                handleObj.items.indexOf(targetId) === -1
            ) {
                handleObj.items.push(targetId);
                node = $.extend(true, {}, defaultNode);
                node.id = targetId;
                node.name = tarNodeData;
                node.value = tarNodeData;
                node.symbolSize = limitFunc(tarNodeData || 1) * enumOption.nodeSize;
                node.category = nodeType
                    ? handleObj.types.indexOf(
                          _data.tarNode[i][0] +
                              "target~" +
                              _data.tarNodeType[i][0]
                      )
                    : 0;
            }
            return { node: node, nodeId: targetId };
        };

        for (let i in _data.node) {
            let nodeType =
                _data.nodeType.length && _data.nodeType[i][0]
                    ? _data.node[i][0] + "node~" + _data.nodeType[i][0]
                    : false;
            if (nodeType && handleObj.types.indexOf(nodeType) === -1) {
                handleObj.types.push(nodeType);
            }

            let targetType =
                _data.tarNodeType.length && _data.tarNodeType[i][0]
                    ? _data.tarNode[i][0] + "target~" + _data.tarNodeType[i][0]
                    : false;
            if (targetType && handleObj.types.indexOf(targetType) === -1) {
                handleObj.types.push(targetType);
            }

            let node = getNode(i);
            if (node.node) {
                handleObj.nodes.push(node.node);
            }

            let target = getTarNode(i);
            if (target.node) {
                handleObj.nodes.push(target.node);
            }

            if (_data.node[i][0] && _data.tarNode[i][0]) {
                let links = $.extend(true, {}, defaultLink);
                links.source = node.nodeId;
                links.target = target.nodeId;
                //显示关系
                if (_data.relation.length && _data.relation[i][0]) {
                    links.name = _data.relation[i][0];
                    links.label.emphasis.show = true;
                    links.label.emphasis.formatter = function(params) {
                        return (
                            relation.fields[0].config.cellName +
                            ":" +
                            params.data.name
                        );
                    };
                }

                handleObj.links.push(links);
            }
        }

        this._option.series[0].data = handleObj.nodes;
        this._option.series[0].links = handleObj.links;
        this._option.series[0].categories = handleObj.types.length
            ? handleObj.types.map(function(name) {
                  return { name: name };
              })
            : [{ name: "test" }];
        this._option.legend.data = handleObj.types.length
            ? handleObj.types
            : [];

        return this._option;
    }
}
