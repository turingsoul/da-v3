export default dataForPanel => ({
    // style: {
    //   name: '样式',
    //   value: [
    //     {
    //       type: 'string',
    //       name: 'width',
    //       cname:'宽度',
    //       widget: 'XRadioInput',
    //       disable: false,
    //       visible: true,
    //       belongTo: 'style',
    //       option: [{name:'适应内容',value:'auto', defaultValue: 'auto'},{name:'固定',value:'custom', unit:'px',defaultValue: 100}],
    //       defaultValue: 'auto',
    //     },
    //     {
    //       type: 'string',
    //       cname:'高度',
    //       name:'height',
    //       widget: 'XRadioInput',
    //       disable: false,
    //       visible: true,
    //       belongTo: 'style',
    //       option: [{name:'适应内容',value:'auto', defaultValue: 'auto'},{name:'固定',value:'custom', unit:'px',defaultValue: 100}],
    //       defaultValue: 'auto',
    //     }
    //   ]
    // },
    image: {
        name: "背景",
        value: [
            {
                type: "string",
                cname: "背景色彩",
                name: "backgroundColor",
                widget: "XColorPicker",
                disable: false,
                visible: true,
                belongTo: "draw",
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
                belongTo: "image",
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
                belongTo: "image",
                option: [
                    { name: "居中", value: "center" },
                    { name: "拉伸", value: "caver" },
                    { name: "填充", value: "scale" },
                    { name: "平铺", value: "flat" }
                ],
                defaultValue: "top"
            }
        ]
    }
});
