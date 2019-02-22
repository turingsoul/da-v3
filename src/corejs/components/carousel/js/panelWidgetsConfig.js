export default dataForPanel => ({
    background: {
        name: "背景",
        value: [
            {
                type: "string",
                cname: "背景色彩",
                name: "backgroundColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                belongTo: "background",
                option: [{ type: "normal" }],
                defaultValue: "rgb(16, 142, 233)"
            },
            {
                type: "string",
                cname: "背景图片",
                name: "backgroundImage",
                widget: "XFileSrc",
                disable: false,
                visible: true,
                belongTo: "background",
                option: {
                    src:
                        "/xdatainsight/api/repo/files/tree?filter=*.jpg|*.png|*.gif|*.bmp",
                    type: "image"
                },
                defaultValue: ""
            },
            {
                type: "string",
                cname: "图片位置",
                name: "imgPosition",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "background",
                option: [
                    { name: "居中", value: "center" },
                    { name: "拉伸", value: "caver" },
                    { name: "填充", value: "scale" },
                    { name: "平铺", value: "flat" }
                ],
                defaultValue: "top"
            }
        ]
    },
    content: {
        name : "内容",
        value : [
        {
            type: "number",
            cname: "内容分层",
            name: "pageNumber",
            widget: "XNumberInput",
            disable: false,
            visible: true,
            belongTo: "content",
            option: {
                "errorMessage" : "内容分层支持2~8层",
                "suffix" : "层",
                "rules" : function(result){
                    return /^[2-8]$/.test(result);
                }
            }
        },
        {
            type: "number",
            cname: "内容切换",
            name: "intervalTime",
            widget: "XNumberInput",
            disable: false,
            visible: true,
            belongTo: "content",
            option: {
                "suffix" : "秒",
                "errorMessage" : "轮播时间间隔支持1秒以上",
                "rules" : function(result){
                    return result > 1 || result === 1;
                } 
            }
        },
        {
            type: "string",
            cname: "分层标识",
            name: "dotPosition",
            widget: "XRadio",
            belongTo: "content",
            disable: false,
            visible: true,
            option: [
                { name: "上", value: "top" },
                { name: "下", value: "bottom" },
                { name: "左", value: "left" },
                { name: "右", value: "right" }
            ],
            defaultValue: "top"
        }
        ]
    }
});

