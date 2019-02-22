import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "markerMap",
        name: "标记地图"
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
        type: "markerMap",
        name: "标记地图",
        priority: 5,
        parameter: "",
        executeAtStart: true,
        bigandsmall: true,
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
                query: ``,
                jndi: ""
            },
            data: [["北京市", "116.405285,39.904989", 10, "province"]],
            option: {
                markerColor: "rgb(16, 142, 233)",
                markerImg: "icon iconfont icon-wiappbiaozhu",
                markerSize: 14,
                mapCenter: "全国",
                zoomLevel: 2,
                minZoom: 1,
                maxZoom: 16,
                switchMap: ["online","Normal"]
            },
            inject: {
                postUpdate: "function(){}"
            }
        }
    }),
    //数据绑定
    databind:{
        dataset:{
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
                    }
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
                    title: "显示信息",
                    valueKey: "info",
                    max: 5,
                    collectType: {
                        defaultValue: 0,
                        selectValue: 2
                    }
                }
            ]
        }
    }
};
