export default dataForPanel => ({
    title: {
        name: "标题",
        value: [
            {
                type: "string",
                cname: "标题",
                name: "title",
                widget: "XInput",
                disable: false,
                visible: true,
                belongTo: "title",
                option: null
            },
            {
                type: "string",
                cname: "标题位置",
                name: "titleAlign",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "title",
                option: [
                    { name: "左", value: "left" },
                    { name: "中", value: "center" },
                    { name: "右", value: "right" }
                ]
            }
        ]
    },
    indexStyle:{
        name:'指标样式',
        value:[
            {
                type: "string",
                cname: "排列方式",
                name: "direction",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: [
                    { name: "纵向", value: "portrait" },
                    { name: "横向", value: "transverse" }
                ]
            },
            {
                type: "boolean",
                cname: "主指标标题",
                name: "mIndexTitle",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: null
            },
            {
                type: "number",
                cname: "主指标字号",
                name: "mIndexFontSize",
                widget: "XNumberInput",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: {
                    errorMessage:'只能输入正整数',
                    rules:(value)=>{
                        if(typeof value === void(0)){
                            return false;
                        }
                        value = String(value);
                        return /^[1-9]\d*$/.test(value);
                    }
                }
            },
            {
                type: "string",
                cname: "主指标颜色",
                name: "mIndexColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                option: [{ type: "normal" }]
            },
            {
                type: "boolean",
                cname: "副指标标题",
                name: "sIndexTitle",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: null
            },
            {
                type: "number",
                cname: "副指标字号",
                name: "sIndexFontSize",
                widget: "XNumberInput",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: {
                    errorMessage:'只能输入正整数',
                    rules:(value)=>{
                        if(typeof value === void(0)){
                            return false;
                        }
                        value = String(value);
                        return /^[1-9]\d*$/.test(value);
                    }
                }
            },
            {
                type: "string",
                cname: "副指标颜色",
                name: "sIndexColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                option: [{ type: "normal" }]
            }
        ]
    },
    indexType:{
        name:'指标类别',
        value:[
            {
                type: "boolean",
                cname: "显示类别",
                name: "typeShow",
                widget: "XSwitch",
                disable: false,
                visible: true,
                belongTo: "indexType",
                option: null
            },
            {
                type: "string",
                cname: "对齐方式",
                name: "typeAlign",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "indexType",
                option: [
                    { name: "左", value: "left" },
                    { name: "中", value: "center" },
                    { name: "右", value: "right" }
                ]
            },
            {
                type: "number",
                cname: "字号",
                name: "typeFontSize",
                widget: "XNumberInput",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: {
                    errorMessage:'只能输入正整数',
                    rules:(value)=>{
                        if(typeof value === void(0)){
                            return false;
                        }
                        value = String(value);
                        return /^[1-9]\d*$/.test(value);
                    }
                }
            },
            {
                type: "string",
                cname: "色彩",
                name: "typeColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                option: [{ type: "normal" }]
            }
        ]
    },
    indexCard:{
        name:'指标卡',
        value:[
            {
                type: "number",
                cname: "显示数量",
                name: "num",
                widget: "XNumberInput",
                disable: false,
                visible: true,
                belongTo: "indexStyle",
                option: {
                    errorMessage:'只能输入1-10的整数',
                    rules:(value)=>{
                        if(typeof value === void(0)){
                            return false;
                        }
                        value = String(value);
                        return /^[1-9]$|^10$/.test(value);
                    }
                }
            },
            {
                type: "string",
                cname: "背景",
                name: "bgColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                option: [{ type: "normal" }]
            }
        ]
    },
    condSetting:{
        name:'条件设置',
        value: [
            {
                type: "object",
                cname: "",
                name: "condSetting",
                widget: "ICardCond",
                disable: false,
                visible: true,
                option: null
            }
        ]
    },
});
