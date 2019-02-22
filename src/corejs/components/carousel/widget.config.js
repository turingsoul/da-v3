import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "carousel",
        name: "轮播"
    },
    //面板配置
    panel: {
        /*dataSource: {
        name: '数据源',
        typeList: ['sql','service','olap']
      },*/
        style: {
            name: "样式",
            //提供两种面板生成方式： 配置式（优先）、组件式。
            //面板组件配置
            panelcfg: panelcfg,
            //面板组件
            panelcmp: null
        } 
        /*handle: {
        name: '事件'
      }*/
    },
    //组件配置
    cfg: theme => ({
        type: "carousel",
        name: "轮播",
        priority: 5,
        parameter: "",
        children: [],
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
            hasFreshQuery: false,
            option: {
                height: "100%",
                width: "100%",
                value: "",
                backgroundColor: theme.chart.backgroundColor,
                backgroundImage: "",
                imgPosition: "center",
                pageNumber: 2,
                intervalTime: 5,
                dotPosition: "top"

            },
            inject: {
                postUpdate: "function(){}"
            }
        }
    }),
    //数据绑定
    databind:{

    }
};
