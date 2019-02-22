const exportIcon = require("resource/images/downCsv.png");

function createRandomItemStyle() {
    return {
        normal: {
            color: function() {
                return (
                    "rgb(" +
                    [
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160)
                    ].join(",") +
                    ")"
                );
            }
        }
    };
}

const defaultOption = {
    title: {
        text: "词云图",
        left: "left",
        textStyle: {
            color: "#393c41", //标题颜色
            fontSize: 16,
            rich: {}
        }
    },
    orientation: "vertical",
    tooltip: {
        trigger: "item",
        formatter: "{b}<br />词频:  {c}"
    },
    toolbox: {
        show: false,
        right: 15,
        feature: {
            restore: { show: true, title: "刷新" },
            myTool2: {
                show: false,
                title: "导出数据",
                icon: "image://" + exportIcon
            },
            saveAsImage: { show: true, title: "导出图片" }
        }
    },
    series: [
        {
            name: "",
            type: "wordCloud",
            width: "90%",
            height: "90%",
            textRotation: [0, 45, 90, -45],
            gridSize: 8,
            autoSize: {
                enable: true,
                minSize: 12
            },
            textStyle: createRandomItemStyle(),
            data: [
                {
                    name: "Jayfee",
                    value: 666
                },
                {
                    name: "Nancy",
                    value: 520
                },
                {
                    name: "生活资源",
                    value: "999"
                },
                {
                    name: "供热管理",
                    value: "888"
                },
                {
                    name: "供气质量",
                    value: "777"
                },
                {
                    name: "生活用水管理",
                    value: "688"
                },
                {
                    name: "一次供水问题",
                    value: "588"
                },
                {
                    name: "交通运输",
                    value: "516"
                },
                {
                    name: "城市交通",
                    value: "515"
                },
                {
                    name: "环境保护",
                    value: "483"
                },
                {
                    name: "房地产管理",
                    value: "462"
                },
                {
                    name: "城乡建设",
                    value: "449"
                },
                {
                    name: "社会保障与福利",
                    value: "429"
                },
                {
                    name: "社会保障",
                    value: "407"
                },
                {
                    name: "文体与教育管理",
                    value: "406"
                },
                {
                    name: "公共安全",
                    value: "406"
                },
                {
                    name: "公交运输管理",
                    value: "386"
                },
                {
                    name: "出租车运营管理",
                    value: "385"
                },
                {
                    name: "供热管理",
                    value: "375"
                },
                {
                    name: "市容环卫",
                    value: "355"
                },
                {
                    name: "自然资源管理",
                    value: "355"
                },
                {
                    name: "粉尘污染",
                    value: "335"
                },
                {
                    name: "噪声污染",
                    value: "324"
                }
            ]
        }
    ],
    animation: true
};
export default defaultOption;
