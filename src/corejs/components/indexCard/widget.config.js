import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "indexCard",
        name: "指标卡"
    },
    //面板配置
    panel: {
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
        let {backgroundColor,borderColor,color,lineColor,textColor} = theme.chart;

        return {
            type: "indexCard",
            name: "指标卡",
            priority: 5,
            parameter: "",
            bigandsmall: true,
            executeAtStart: true,
            listeners: [],
            layout: {
                i: "",
                x: 0,
                y: 0,
                w: 3,
                h: 8,
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
                    //总标题
                    title:'',
                    //总标题文本对齐方式 left-左 center-中 right-右
                    titleAlign:'left',
                    titleColor:textColor[0],

                    //指标排列方式 portrait-纵向 transverse-横向
                    direction:'portrait',
                    //主指标标题 true-开 false-关
                    mIndexTitle:true,
                    //主指标字号
                    mIndexFontSize:28,
                    //主指标字体颜色
                    mIndexColor:color[0],

                    //副指标标题 true-开 false-关
                    sIndexTitle:true,
                    //副指标字号
                    sIndexFontSize:18,
                    //副指标字体颜色
                    sIndexColor:color[1],

                    //指标类别 off-关 on-开
                    typeShow:true,
                    //指标类别文本对齐方式 left-左 center-中 right-右
                    typeAlign:'center',
                    //指标类别字号
                    typeFontSize:20,
                    //指标类别字体颜色
                    typeColor:textColor[0],

                    //子指标卡最大显示数量
                    num:5,
                    //指标卡背景色
                    bgColor:backgroundColor,

                    //指标卡边框色
                    widgetBorderColor:lineColor[0],
                    //指标卡字体颜色
                    fontColor:textColor[1],

                    //条件设置
                    condSetting: {
                        open: false,
                        config: [
                            {
                                key: "",
                                measure: "",
                                cond: "",
                                icon:"",
                                color: ""
                            }
                        ]
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
                    }
                },
                {
                    title: "指标",
                    valueKey: "counter",
                    min: 1,
                    max: 2,
                    collectType: {
                        defaultValue: 1,
                        selectValue: 1
                    }
                }
            ]
        }
    }
};
