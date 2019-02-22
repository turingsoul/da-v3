import panelcfg from "./js/panelWidgetsConfig";

export default {
    //组件基本信息
    base: {
        type: "chartMix",
        name: "折柱混合图"
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
        type: "chartMix",
        name: "折柱混合图",
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
            w: 12,
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
                title: "折柱混合图",
                titlePosition: "left",
                isExportData: false,
                example: "top",
                orientation: "vertical",
                showData: false,
                gridLine: true,
                color: [
                    "#279df5",
                    "#ffd401",
                    "#72c4b8",
                    "#3373b3",
                    "#3f557e",
                    "#f0b498"
                ],
                baseLine: "auto",
                axisTick: true,
                axisTitle: "",
                secondY: false,
                secondYTitle: "",
                stack: false,
                barBg: false,
                itemStyle: 0,
                markLine: "null",

                showDot: false,
                showArea: false,
                predictionLine: "auto",
                linestack: false,
                loseData: "null",
                lineStyle: "broken",
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
                    title: "柱状指标",
                    valueKey: "barCount",
                    max: 5,
                    collectType: {
                        defaultValue: 1,
                        selectValue: 1
                    },
                    valid: function(len, arr, commonValid) {
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
                    valid: function(len, arr, commonValid) {
                        let result = commonValid.call(this, len, arr);
                        if (arr[2] === 0 && arr[3] === 0) {
                            result.result = false;
                            result.errmsg = "柱状指标和折线指标至少其中一个有字段";
                        }
                        return result;
                    }
                }
            ]
        }
    }
};
