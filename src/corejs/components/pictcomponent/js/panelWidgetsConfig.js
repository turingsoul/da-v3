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
        name: "图片",
        value: [
            {
                type: "string",
                cname: "文件/URL",
                name: "fileSrc",
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
    },
    event: {
        name: "动作",
        value: [
            {
                type: "string",
                cname: "点击事件",
                name: "clickEvent",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "event",
                option: [
                    { name: "无", value: "null" },
                    { name: "跳转", value: "jump" }
                ],
                defaultValue: "null"
            },
            {
                type: "string",
                cname: "打开位置",
                name: "openPosition",
                widget: "XRadio",
                disable: false,
                visible: true,
                belongTo: "event",
                option: [
                    { name: "当前窗口", value: "_self" },
                    { name: "新窗口", value: "_target" }
                ],
                defaultValue: "_self"
            },
            {
                type: "string",
                cname: "文件/URL",
                name: "linkSrc",
                widget: "XFileSrc",
                disable: false,
                visible: true,
                belongTo: "event",
                option: {
                    src:
                        "/xdatainsight/api/repo/files/tree?showHidden=false&filter=*|FILES",
                    type: "image"
                },
                defaultValue: ""
            }
        ]
    }
});
