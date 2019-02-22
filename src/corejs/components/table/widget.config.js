import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "table",
        name: "表格"
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
        }
    },
    //组件配置
    cfg: theme => {
        let bgColor = theme.chart.backgroundColor;
        let fontColor = theme.chart.textColor;
        return {
            type: "table",
            name: "表格",
            priority: 5,
            parameter: "",
            bigandsmall: true,
            executeAtStart: true,
            listeners: [],
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
                query: {
                    type: "",
                    param: {},
                    statement: "",
                    query: "",
                    jndi: ""
                },
                data: {
                    queryInfo: { totalRows: "0" },
                    resultset: [],
                    metadata: []
                },
                option: {
                    //表格
                    tableBgColor: bgColor,
                    tableFontColor: fontColor[1],

                    //标题
                    caption: "表格", //标题
                    captionTextAlgin: "left", //标题对齐方式
                    exportable: false, //导出数据按钮
                    captionColor:fontColor[0],

                    //表头
                    theadFontColor: fontColor[1],
                    theadBgColor: "transparent",
                    theadFontSize: 14,
                    theadFontWeight: true,
                    theadGroup: {
                        open: false,
                        config: []
                    },

                    //数据
                    dataFontColor: fontColor[1],
                    oddRowBgColor: "transparent",
                    evenRowBgColor: "transparent",
                    dataFontSize: 14,
                    dataSortable: false,

                    //分页
                    pageable: true,
                    pageRows: 20,
                    pageInfo: true,

                    //统计
                    calcable: false,
                    calcMode: "",
                    calcFontColor: fontColor[1],
                    calcBgColor: "transparent",
                    calcFontSize: 14,
                    calcFontWeight: true,

                    //预警
                    warning: {
                        open: false,
                        config: []
                    }
                },
                inject: {
                    postUpdate: "function(){}"
                }
            }
        };
    },
    //数据绑定
    databind:{
        dataset:{
            iconClass: "layout-table",
            cells: [
                {
                    title: "表列",
                    valueKey: "datas",
                    collectType: {
                        defaultValue: 0,
                        selectValue: 2
                    }
                }
            ]
        }
    }
};
