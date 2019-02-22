import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "heatMap",
        name: "热力地图"
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
        // handle: {
        //     name: "事件"
        // }
    },
    //组件配置
    cfg: () => ({
        type: "heatMap",
        name: "热力地图",
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
                query :``,
                jndi:""
            },
            data: [["116.191031,39.988585", 10]],
            option: {
                heatRadius: 25,
                mapCenter: "全国",
                zoomLevel: 2,
                minZoom: 1,
                maxZoom: 16,
                switchMap: ["online","Normal"]
            },
            inject: {}
        }
    }),
    //数据绑定
    databind:{
        dataset:{
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
                    tip: "可拖入1个数值字段"
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
                    tip: "可拖入1个数值字段"
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
                    }
                }
            ]
        }
    }
};
