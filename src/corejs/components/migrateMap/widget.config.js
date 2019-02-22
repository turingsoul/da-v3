import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "migrateMap",
        name: "迁徙地图"
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
        type: "migrateMap",
        name: "迁徙地图",
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
                // query: `select * from migratedata where fromname="北京"`,
                // jndi: "map"
            },
            data: [
                [
                    "北京",
                    "116.4551,40.2539",
                    "上海",
                    "121.4648,31.2891",
                    1000,
                    "北京->上海 1000"
                ],
                [
                    "北京",
                    "116.4551,40.2539",
                    "广州",
                    "113.5107,23.2196",
                    3,
                    "北京->广州 1"
                ]
            ],
            option: {
                routeColor: "#FCC400",
                pointColor: "rgb(0, 142, 233)",
                routeWeight: 2,
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
                    tip: "可拖入1个数值字段"
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
                    tip: "可拖入1个数值字段"
                },
                {
                    title: "终点名称",
                    valueKey: "targetName",
                    max: 1,
                    collectType: {
                        defaultValue: 0,
                        selectValue: 0
                    }
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
                    tip: "可拖入1个数值字段"
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
