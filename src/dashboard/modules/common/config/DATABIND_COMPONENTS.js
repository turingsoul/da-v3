/**
 * 数据绑定配置页面支持的组件列表及配置信息
 * components[n] 数据绑定配置页面各组件，其具体配置属性如下：
 * type {String} 组件类型
 * show {Boolean} 组件图标是否展示 默认true
 * switch {Boolean} 是否可以切换至其他组件 默认true
 * iconClass {String} 组件图标对应类名
 * cells {Array} 组件支持的字段框集合
 * cells[n] {Object} 单个字段框配置对象
 * cells[n].collectType: 0 不可汇总 1 必须汇总 2 可汇总
 * cells[n].min 格子最少字段数量
 * cells[n].max 格子最多字段数量
 * cells[n].valid(len,lenArr) 格子内字段情况验证 len{Number}: 当前格子包含的字段数量 lenArr{Aray}: 当前格子组的字段数集合
 * allowFieldTypes {Array} 格子可接收字段的类型集合，如果不设置该字段则表示该格子不限制拖入字段的类型
 */

/**
 *
 * @param {Number} len 当前格子包含的字段数量
 * @param {Array} lenArr 当前格子组的字段数集合
 */
function commonValid(len, lenArr) {
    let result = {
        accept: true,
        result: true,
        errmsg: ""
    };
    let { min, max } = this;
    if (min && len < min) {
        result.result = false;
        result.errmsg = this.tip ? this.tip : "至少需要" + min + "个字段";
    }

    if (max && len > max) {
        result.result = false;
        result.errmsg = "字段数量超出，最多允许" + max + "个字段";
    }

    if (max && len >= max) {
        result.accept = false;
    }

    return result;
}

export default [
    {
        type: "table",
        name: "表格",
        iconClass: "layout-table",
        cells: [
            {
                title: "表列",
                valueKey: "datas",
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartBar",
        name: "柱状图",
        iconClass: "layout-bar",
        cells: [
            {
                title: "x轴",
                valueKey: "xAxis",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "系列",
                valueKey: "series",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "y轴",
                valueKey: "yAxis",
                min: 1,
                max: 5,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartPie",
        name: "饼图",
        iconClass: "layout-pie",
        cells: [
            {
                title: "类别",
                valueKey: "types",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartLine",
        name: "折线图",
        iconClass: "layout-line",
        cells: [
            {
                title: "x轴",
                valueKey: "xAxis",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "系列",
                valueKey: "series",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "y轴",
                valueKey: "yAxis",
                min: 1,
                max: 5,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartMix",
        name: "折柱混合图",
        iconClass: "layout-linebar",
        cells: [
            {
                title: "x轴",
                valueKey: "xAxis",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "系列",
                valueKey: "series",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "柱状指标",
                valueKey: "barCount",
                max: 5,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: function(len, arr) {
                    let result = commonValid.call(this, len, arr);
                    if (arr[2] === 0 && arr[3] === 0) {
                        result.result = false;
                        result.errmsg = "柱状指标和折线指标至少其中一个有字段";
                    }
                    return result;
                }
            },
            {
                title: "折线指标",
                valueKey: "lineCount",
                max: 5,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: function(len, arr) {
                    let result = commonValid.call(this, len, arr);
                    if (arr[2] === 0 && arr[3] === 0) {
                        result.result = false;
                        result.errmsg = "柱状指标和折线指标至少其中一个有字段";
                    }
                    return result;
                }
            }
        ]
    },
    {
        type: "chartDot",
        name: "大数据散点图",
        iconClass: "layout-dot",
        cells: [
            {
                title: "名称",
                valueKey: "name",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "类别",
                valueKey: "types",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "x轴",
                valueKey: "xAxis",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                tip: "需拖入1个数值字段",
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            },
            {
                title: "y轴",
                valueKey: "yAxis",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                tip: "需拖入1个数值字段",
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            },
            {
                title: "大小",
                valueKey: "size",
                allowFieldTypes: ["number"],
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartNestpie",
        name: "嵌套环形图",
        iconClass: "layout-nestpie",
        cells: [
            {
                title: "类别1",
                valueKey: "series1",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: function(len, arr) {
                    let result = commonValid.call(this, len, arr);
                    if (arr[0] === 0 && arr[1] === 0 && arr[2] === 0) {
                        result.result = false;
                        result.errmsg = "类别1、类别2、类别3至少其中一个有字段";
                    }
                    return result;
                }
            },
            {
                title: "类别2",
                valueKey: "series2",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: function(len, arr) {
                    let result = commonValid.call(this, len, arr);
                    if (arr[0] === 0 && arr[1] === 0 && arr[2] === 0) {
                        result.result = false;
                        result.errmsg = "类别1、类别2、类别3至少其中一个有字段";
                    }
                    return result;
                }
            },
            {
                title: "类别3",
                valueKey: "series3",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: function(len, arr) {
                    let result = commonValid.call(this, len, arr);
                    if (arr[0] === 0 && arr[1] === 0 && arr[2] === 0) {
                        result.result = false;
                        result.errmsg = "类别1、类别2、类别3至少其中一个有字段";
                    }
                    return result;
                }
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartRose",
        name: "南丁格尔玫瑰图",
        iconClass: "layout-rose",
        cells: [
            {
                title: "类别",
                valueKey: "types",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "heatchart",
        iconClass: "layout-heatchart",
        name: "热力图",
        cells: [
            {
                title: "x轴",
                valueKey: "xAxis",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "y轴",
                valueKey: "yAxis",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartFunnel",
        iconClass: "layout-chartFunnel",
        name: "漏斗图",
        cells: [
            {
                title: "类别",
                valueKey: "types",
                min: 1,
                max: 4,
                dirll: true,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartGauge",
        iconClass: "layout-chartgauge",
        name: "油量图",
        cells: [
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "chartWordCloud",
        iconClass: "layout-wordCloud",
        name: "词云图",
        cells: [
            {
                title: "词名",
                valueKey: "types",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "graph",
        name: "关联关系图",
        iconClass: "layout-graph",
        cells: [
            {
                title: "源节点",
                valueKey: "node",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "源节点类别",
                valueKey: "nodeType",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "源节点数据",
                valueKey: "nodeData",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            },
            {
                title: "目标节点",
                valueKey: "tarNode",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "目标节点类别",
                valueKey: "tarNodeType",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "目标节点数据",
                valueKey: "tarNodeData",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            },
            {
                title: "关系",
                valueKey: "relation",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "sankey",
        name: "桑基图",
        iconClass: "layout-sankey",
        cells: [
            {
                title: "来源",
                valueKey: "node",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "目标",
                valueKey: "target",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "themeriver",
        iconClass: "layout-themeriver",
        name: "河流图",
        cells: [
            {
                title: "x轴",
                valueKey: "xAxis",
                min: 1,
                max: 4,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "系列",
                valueKey: "series",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 5,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "heatMap",
        iconClass: "layout-heat",
        name: "热力图地图",
        cells: [
            {
                title: "经度",
                valueKey: "lng",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "纬度",
                valueKey: "lat",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 1,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "markerMap",
        iconClass: "layout-marker",
        name: "标记地图",
        cells: [
            {
                title: "名称",
                valueKey: "name",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "经度",
                valueKey: "lng",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "纬度",
                valueKey: "lat",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "显示信息",
                valueKey: "info",
                max: 5,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "routeMap",
        iconClass: "layout-route",
        name: "路线地图",
        cells: [
            {
                title: "路线名称",
                valueKey: "routeName",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "路线信息",
                valueKey: "routeSeries",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "经度",
                valueKey: "lng",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "纬度",
                valueKey: "lat",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "坐标信息",
                valueKey: "counter",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "migrateMap",
        iconClass: "layout-migrate",
        name: "迁徙地图",
        cells: [
            {
                title: "起点名称",
                valueKey: "startName",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "起点经度",
                valueKey: "startLng",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "起点纬度",
                valueKey: "startLat",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "终点名称",
                valueKey: "targetName",
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "终点经度",
                valueKey: "targetLng",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "终点纬度",
                valueKey: "targetLat",
                allowFieldTypes: ["number"],
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                tip: "可拖入1个数值字段",
                valid: commonValid
            },
            {
                title: "显示信息",
                valueKey: "info",
                max: 5,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "select",
        show: false,
        switch: false,
        name: "单选下拉框",
        cells: [
            {
                title: "数据",
                valueKey: "value",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "multiselect",
        show: false,
        switch: false,
        name: "多选下拉框",
        cells: [
            {
                title: "数据",
                valueKey: "value",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "checkbox",
        show: false,
        switch: false,
        name: "复选框",
        cells: [
            {
                title: "数据",
                valueKey: "value",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "radio",
        show: false,
        switch: false,
        name: "单选框",
        cells: [
            {
                title: "数据",
                valueKey: "value",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "timeline",
        show: false,
        switch: false,
        name: "动态数轴",
        cells: [
            {
                title: "数据",
                valueKey: "value",
                min: 1,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 2
                },
                valid: commonValid
            }
        ]
    },
    {
        type: "indexCard",
        show: false,
        switch: false,
        name: "指标卡",
        cells: [
            {
                title: "类别",
                valueKey: "type",
                min: 0,
                max: 1,
                collectType: {
                    defaultValue: 0,
                    selectValue: 0
                },
                valid: commonValid
            },
            {
                title: "指标",
                valueKey: "counter",
                min: 1,
                max: 2,
                collectType: {
                    defaultValue: 1,
                    selectValue: 1
                },
                valid: commonValid
            }
        ]
    }
];
