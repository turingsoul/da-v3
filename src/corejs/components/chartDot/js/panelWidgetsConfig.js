export default dataForPanel => ({
    title: {
        name: "标题",
        value: [
            {
                type: "string",
                name: "title",
                cname: "标题内容",
                widget: "XInput",
                disable: false,
                visible: true,
                belongTo: "title",
                option: null,
                defaultValue: null
            },
            {
                type: "string",
                cname: "标题位置",
                name: "titlePosition",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "title",
                option: [
                    { name: "左", value: "left" },
                    { name: "中", value: "center" },
                    { name: "右", value: "right" }
                ],
                defaultValue: "left"
            }
        ]
    },
    draw: {
        name: "图表",
        value: [
            {
                type: "string",
                cname: "色彩",
                name: "color",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [{ type: "listColor" }],
                // option: redux_data.globalParam.map(param => ({name: param.name, value: param.name})),
                defaultValue: "rgb(16, 142, 233)"
            },
            {
                type: "number",
                cname: "色彩透明度",
                name: "opacity",
                widget: "XSlider",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [{ maxRange: 100 }],
                defaultValue: 80
            },
            {
                type: "string",
                cname: "图例",
                name: "example",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [
                    { name: "上", value: "top" },
                    { name: "下", value: "bottom" },
                    { name: "左", value: "left" },
                    { name: "右", value: "right" },
                    { name: "无", value: "null" }
                ],
                defaultValue: "top"
            },
            {
                type: "string",
                cname: "散点形状",
                name: "symbol",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [
                    { name: "圆形", value: "circle" },
                    { name: "方形", value: "rect" },
                    { name: "三角形", value: "triangle" },
                    { name: "菱形", value: "diamond" },
                    { name: "图钉", value: "pin" },
                    { name: "箭头", value: "arrow" }
                ],
                defaultValue: "circle"
            },
            {
                type: "number",
                cname: "散点大小",
                name: "symbolSize",
                widget: "XSlider",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [{ maxRange: 32, range: true, minRange: 5 }],
                defaultValue: 14
            },
            {
                type: "string",
                cname: "x轴基准线",
                name: "xBaseLine",
                widget: "XRadioGroupInput",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [
                    { name: "无", value: "auto", defaultValue: "auto" },
                    { name: "平均", value: "average", defaultValue: "average" },
                    { name: "定值", name2: "", value: 0, defaultValue: 0 }
                ],
                // option: redux_data.globalParam.map(param => ({name: param.name, value: param.name})),
                defaultValue: "auto"
            },
            {
                type: "string",
                cname: "y轴基准线",
                name: "yBaseLine",
                widget: "XRadioGroupInput",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: [
                    { name: "无", value: "auto", defaultValue: "auto" },
                    { name: "平均", value: "average", defaultValue: "average" },
                    { name: "定值", name2: "", value: 0, defaultValue: 0 }
                ],
                // option: redux_data.globalParam.map(param => ({name: param.name, value: param.name})),
                defaultValue: "auto"
            },
            {
                type: "string",
                cname: "趋势线",
                name: "markLine",
                widget: "XRadioGroupInput",
                disable: false,
                visible: true,
                belongTo: "barPng",
                option: [
                    { name: "无", value: "auto", defaultValue: "auto" },
                    { name: "线性", value: "line", defaultValue: "line" },
                    {
                        name: "指数",
                        value: "exponential",
                        defaultValue: "exponential"
                    },
                    {
                        name: "对数",
                        value: "logarithmic",
                        defaultValue: "logarithmic"
                    },
                    { name: "多项式", value: 0, defaultValue: 1 }
                ],
                defaultValue: "auto"
            }
        ]
    },
    axis: {
        name: "坐标",
        value: [
            {
                type: "bolean",
                cname: "x轴",
                name: "xaxis",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: true
            },
            {
                type: "string",
                name: "xaxisTitle",
                cname: "x轴标题",
                widget: "XInput",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: null
            },
            {
                type: "bolean",
                cname: "x轴刻度",
                name: "xaxisTick",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: true
            },
            // {
            //     type: 'string',
            //     cname:'x轴数据单位',
            //     name:'xunit',
            //     widget: 'XRadio',
            //     disable: false,
            //     visible: true,
            //     belongTo: 'draw',
            //     option: [{name:'无',value:'none'},{name:'千',value:1000},{name:'万',value:10000},{name:'百万',value:1000000},{name:'亿',value:100000000}],
            //     defaultValue: 'none',
            // },
            {
                type: "bolean",
                cname: "y轴",
                name: "yaxis",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: true
            },
            {
                type: "string",
                name: "yaxisTitle",
                cname: "y轴标题",
                widget: "XInput",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: null
            },
            {
                type: "bolean",
                cname: "y轴刻度",
                name: "yaxisTick",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "axis",
                option: null,
                defaultValue: true
            }
            // {
            //     type: 'string',
            //     cname:'y轴数据单位',
            //     name:'yunit',
            //     widget: 'XRadio',
            //     disable: false,
            //     visible: true,
            //     belongTo: 'draw',
            //     option: [{name:'无',value:'none'},{name:'千',value:1000},{name:'万',value:10000},{name:'百万',value:1000000},{name:'亿',value:100000000}],
            //     defaultValue: 'none',
            // }
        ]
    },
    kit: {
        name: "辅助项",
        value: [
            {
                type: "bolean",
                cname: "网格线",
                name: "gridLine",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: null,
                // option: redux_data.globalParam.map(param => ({name: param.name, value: param.name})),
                defaultValue: true
            },
            {
                type: "bolean",
                cname: "显示数据",
                name: "showData",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "draw",
                option: null,
                // option: redux_data.globalParam.map(param => ({name: param.name, value: param.name})),
                defaultValue: false
            },
            {
                type: "bolean",
                cname: "导出数据",
                name: "isExportData",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "title",
                option: null,
                defaultValue: null
            }
        ]
    },
    warns: {
        name: "预警",
        value: [
            {
                type: "object",
                cname: null,
                name: "warns",
                widget: "XWarns",
                disable: false,
                visible: true,
                belongTo: "barPng",
                option: [""],
                defaultValue: {}
            }
        ]
    }
});
