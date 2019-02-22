import panelcfg from "./js/panelWidgetsConfig";
export default {
    //组件基本信息
    base: {
        type: "custom",
        name: "自定义图表"
    },
    //面板配置
    panel: {
        dataSource: {
            name: "数据源",
            typeList: ["sql", "http", "websocket", "service", "olap"]
        },
        style: {
            name: "样式",
            //提供两种面板生成方式： 配置式（优先）、组件式。
            //面板组件配置
            panelcfg,
            //面板组件
            panelcmp: null
        } /* ,
        handle: {
            name: "事件"
        } */
    },
    //组件配置
    cfg: theme => ({
        type: "custom",
        name: "自定义图表",
        priority: 5,
        parameter: "",
        chartBtns: true,
        nochartData: true,
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
                type: "sql",
                param: {},
                statement: "",
                query: 'select 1',
                jndi: ""
            },
            data: [],
            option: {
                backgroundColor: theme.chart.backgroundColor,
                code: 
`//data 是 获取的数据
var data = this.cfg.chartDefinition.data;
if(!data || !data.resultset){
    return false;
}
//jq插件
var $ = Dashboard.lib.$;
//dashboard 内置echarts ，用按如下方式使用；
var echarts = arguments[0];
//如需使用d3 请先加载，然后再回调中写逻辑
//注意： 绘图引擎切换  请先手动清除之前的数据，否则造成多个引擎渲染的图表存在
//清除方式，可以根据引擎的方式清除，如echart，可以调用echartsInstance,dipose()
Dashboard.queryAction.getScriptOnce({
    name: 'd3',
    src: 'https://d3js.org/d3.v5.min.js'
}).then(function(){
    console.log('succ');
}).catch(function(e){console.log(e)});
var option ={xAxis:{type:'category',data:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']},yAxis:{type:'value'},series:[{data:[820,932,901,934,1290,1330,1320],type:'line'}]};
//重置echarts实例
var echartsInstance = this.echartsInstance || echarts.init(this.htmlObj);
echartsInstance.dispose();
echartsInstance = echarts.init(this.htmlObj);

echartsInstance.setOption(option);
//echartsInstance.resize();
//刷新方法  在函数里面写自己的刷新逻辑  也就是重新渲染
this.resize = function(){
    echartsInstance.clear();
    echartsInstance.resize();
    echartsInstance.setOption(option,true);
};`
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
