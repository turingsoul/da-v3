/**
 * 组件配置文件
 */
import panelcfg from "./js/panelWidgetsConfig";

export default {
    //组件基本信息
    base: {
        type: "chartBar",
        name: "柱状图"
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
            name: "事件"
        }
    },

    cfg: theme => ({
        type: "chartBar",
        name: "柱状图",
        priority: 5,
        parameter: "",
        chartBtns: true,
        bigandsmall: true,
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
                title: "柱状图",
                titlePosition: "left",
                isExportData: false,
                example: "top",
                orientation: "vertical",
                showData: false,
                gridLine: true,
                baseLine: "auto",
                axisTick: true,
                axisTitle: "",
                stack: false,
                barBg: false,
                itemStyle: 0,
                markLine: "null",
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
                //主题部分
                color: theme.chart.color,
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
                query: "",
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
                    }
                },
                {
                    title: "系列",
                    valueKey: "series",
                    max: 1,
                    collectType: {
                        defaultValue: 0,
                        selectValue: 0
                    }
                },
                {
                    title: "y轴",
                    valueKey: "yAxis",
                    min: 1,
                    max: 5,
                    collectType: {
                        defaultValue: 1,
                        selectValue: 1
                    }
                }
            ]
        }
    }
};
