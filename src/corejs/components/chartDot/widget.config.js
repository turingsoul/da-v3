import panelcfg from "./js/panelWidgetsConfig";

export default {
    //组件基本信息
    base: {
        type: "chartDot",
        name: "大数据散点图"
    },
    //面板配置
    panel: {
        // dataSource: {
        //     name: "数据源",
        //     typeList: ["sql", "service", "olap"]
        // },
        style: {
            name: "样式",
            //提供两种面板生成方式： 配置式（优先）、组件式。
            //面板组件配置
            panelcfg,
            //面板组件
            panelcmp: null
        },
        handle: {
            name: "事件",
            handleCfg: {
                clickEvent: "null"
            }
        }
    },

    cfg: theme => ({
        type: "chartDot",
        name: "大数据散点图",
        priority: 5,
        chartBtns: true,
        bigandsmall: true,
        parameter: "",
        executeAtStart: true,
        listeners: ["a1"],
        layout: {
            i: "",
            x: 0,
            y: 0,
            w: 13,
            h: 10,
            minW: 1,
            minH: 1,
            maxW: 12,
            moved: true
        },
        chartDefinition: {
            queryid: "",
            queryname: "",
            freshQuery: false,
            // defaultOption: defaultOption,//图表默认配置
            option: {
                title: "大数据散点图",
                warns: {
                    switch: false,
                    seriesList: [],
                    value: [
                        {
                            series: "",
                            filter: "==",
                            value: 10,
                            color: "rgba(228, 14, 14, 1)",
                            showMarkType: true,
                            markType: false
                        }
                    ]
                },
                titlePosition: "center",
                isExportData: false,
                symbolSize: [5, 35],
                orientation: "vertical",
                showData: false,
                gridLine: true,
                baseLine: "auto",
                xaxis: true,
                yaxis: true,
                yunit: "none",
                xunit: "none",
                xBaseLine: "auto",
                yBaseLine: "auto",
                xaxisTick: false,
                yaxisTick: false,
                symbol: "circle",
                axisTitle: "",
                yaxisTitle: "",
                xaxisTitle: "",
                stack: false,
                barBg: false,
                itemStyle: 0,
                markLine: "auto",
                example: "top",
                //主题部分
                color: theme.chart.color,
                opacity: 80,
                backgroundColor: theme.chart.backgroundColor,
                borderRadius: theme.chart.borderRadius,
                lineColor: theme.chart.lineColor,
                textColor: theme.chart.textColor,
                titleBackgroundColor: theme.chart.titleBackgroundColor,

                clickEvent: "null",
                saveToParams: "",
                toolboxShow: false,
                clickParmas: {
                    category: { name: "", id: "" },
                    series: { name: "", id: "" },
                    value: { name: "", id: "" }
                },
                sqlParmas: []
            },

            _option: {},
            query: {
                type: "",
                param: {},
                statement: "",
                query:
                    /*`SELECT '食品经营' 食品大类, 1000012 金额,'349212,13423,129843,22541' 数据 UNION ALL
                SELECT '餐饮服务',1000012,'349212,13423,129843,22541'  UNION ALL
                SELECT '食品流通',2000012,'349212,13423,129843,22541' UNION ALL
                SELECT '食品生产',3000012,'349212,13423,129843,22541'`*/ "",
                jndi: /*'dw_market'*/ ""
            },
            data: {},
            inject: {
                postUpdate: "function(){}"
            }
        }
    }),
    //数据绑定
    databind:{
        dataset:{
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
                    }
                },
                {
                    title: "类别",
                    valueKey: "types",
                    max: 1,
                    collectType: {
                        defaultValue: 0,
                        selectValue: 0
                    }
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
                    }
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
                    }
                },
                {
                    title: "大小",
                    valueKey: "size",
                    allowFieldTypes: ["number"],
                    max: 1,
                    collectType: {
                        defaultValue: 0,
                        selectValue: 2
                    }
                }
            ]
        }
    }
};
