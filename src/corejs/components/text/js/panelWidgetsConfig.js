export default dataForPanel => ({
    content: {
        name: "文本内容",
        value: [
            {
                type: "string",
                cname: "文本内容",
                name: "content",
                widget: "XEditor",
                disable: false,
                visible: true,
                belongTo: "content",
                option: dataForPanel.map(param => ({
                    name: param.name,
                    value: param.id
                })),
                defaultValue: ""
            },
            {
                type: "string",
                cname: "内容滚动",
                name: "contentRoll",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "content",
                option: [
                    { name: "关", value: "none" },
                    { name: "水平滚动", value: "moveX" },
                    { name: "垂直滚动", value: "moveY" }
                ],
                defaultValue: "none"
            },
            {
                type: "string",
                cname: "滚动速度",
                name: "rollSpeed",
                widget: "XSlider",
                disable: false,
                visible: true,
                belongTo: "content",
                option: [{ maxRange: 10, step: 0.1 }],
                defaultValue: 0
            },
            {
                type: "string",
                cname: "背景颜色",
                name: "backgroundColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                belongTo: "content",
                option: [{ type: "normal" }],
                defaultValue: "rgb(16, 142, 233)"
            }
        ]
    }
});
