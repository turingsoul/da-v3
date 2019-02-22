import {mapCentersArr} from "corejs/resource/js/mapUtil.js";

export default (dataForPanel) => ({
  draw: { 
    name: '绘制',
    value: [
      {
        type: 'string',
        cname:'终点色彩',
        name:'pointColor',
        widget: 'XColorPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: [{type: 'normal'}],
        defaultValue: 'rgb(16, 142, 233)'
      }, 
      {
        type: 'string',
        cname:'线条色彩',
        name:'routeColor',
        widget: 'XColorPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: [{type: 'normal'}],
        defaultValue: '#FCC400'
      },
      {
        type: 'number',
        cname:'线条宽度',
        name:'routeWeight',
        widget: 'XSlider',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option:  [{maxRange: 15}],
        defaultValue: 2
      }
    ]
  },
  map: {
    name : "地图",
    value : [
      {
        type: 'array',
        cname:'地图中心',
        name:'mapCenter',
        widget: 'XSelect',
        disable: false,
        visible: true,
        belongTo: 'map',
        option: mapCentersArr,
        defaultValue:   '全国',
      },
      {
        type: 'number',
        cname:'放大级别',
        name:'zoomLevel',
        widget: 'XSlider',
        disable: false,
        visible: true,
        belongTo: 'map',
        option:  [{maxRange: 15}],
        defaultValue: 2
      },
      {
        type: "object",
        cname: "地图切换",
        name: "switchMap",
        widget: "XSwitchMap",
        disable: false,
        visible: true,
        belongTo: "map",
        option: [],
        defaultValue: ["online","Normal"]
      }
    ]

  }
});