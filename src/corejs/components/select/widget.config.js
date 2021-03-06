import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "select",
        name: "单选下拉框"
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
    cfg: theme => ({
        type: "select",
        name: "单选下拉框",
        priority: 5,
        parameter: "",
        executeAtStart: true,
        listeners: [],
        layout: {
            i: "",
            x: 0,
            y: 0,
            w: 3,
            h: 2,
            minW: 1,
            minH: 2,
            maxW: 12,
            moved: true
        },
        chartDefinition: {
            queryid: "",
            queryname: "",
            hasFreshQuery: false,
            query: {
                type: "",
                param: {},
                statement: "",
                query: ``,
                jndi: "",
                datasaetDistinct: true
            },
            data: {},
            option: {
                height: "100%",
                width: "100%",
                borderColor: "orange",
                value: "",
                valueAsId: true,
                backgroundColor: theme.chart.backgroundColor,
                textColor: theme.chart.textColor
            },
            inject: {
                postUpdate: "function(){}"
            }
        }
    }),
    //数据绑定
    databind:{
        dataset:{
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
                    }
                }
            ]
        }
    }
};
