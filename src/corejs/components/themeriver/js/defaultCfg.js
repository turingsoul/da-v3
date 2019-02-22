const exportIcon = require("resource/images/downCsv.png");
const defaultOption = () => ({
    title: {
        text: "河流图",
        textStyle: {
            color: "#393c41",
            rich: {}
        }
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
    tooltip: {
        trigger: "axis",
        axisPointer: {
            type: "line",
            lineStyle: {
                color: "rgba(0,0,0,0.2)",
                width: 1,
                type: "solid"
            }
        }
    },
    grid: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    color: ["#279df5", "#ffd401", "#72c4b8", "#3373b3", "#3f557e", "#f0b498"],
    legend: {
        // orient: 'vertical',
        right: "0",
        top: "0",
        left: "auto",
        bottom: "auto",
        orient: "horizontal",
        data: [],
        textStyle: {
            color: "#919499"
        }
    },
    singleAxis: {
        name: "",
        nameLocation: "center",
        nameGap: 35,
        nameTextStyle: {},
        top: 40,
        bottom: 50,
        left: 20,
        right: 50,
        axisTick: {},
        axisLabel: {},
        axisLine: {
            lineStyle: {}
        },
        type: "time",
        axisPointer: {
            animation: true,
            label: {
                show: true
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
                type: "dashed",
                opacity: 0.2
            }
        }
    },
    series: [
        {
            type: "themeRiver",
            itemStyle: {
                emphasis: {
                    shadowBlur: 20,
                    shadowColor: "rgba(0, 0, 0, 0.8)"
                }
            },
            data: []
        }
    ]
});

export default defaultOption;
