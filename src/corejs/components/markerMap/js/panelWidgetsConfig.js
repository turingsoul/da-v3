const wiappbiaozhu = require('resource/images/wiappbiaozhu.png');
const biaozhu1 = require('resource/images/biaozhu1.png');
const tuding = require('resource/images/tuding.png');
const ic_flag_px = require('resource/images/ic_flag_px.png');
const yuanxing1 = require('resource/images/yuanxing1.png');
import {mapCentersArr} from "corejs/resource/js/mapUtil.js";


const iconArr = [
  {
    icon: wiappbiaozhu,
    value: 'iconfont icon-wiappbiaozhu',
    name: '标记'
  },
  {
    icon: biaozhu1,
    value: 'iconfont icon-biaozhu1',
    name: '标注'
  },
  {
    icon: tuding,
    value: 'iconfont icon-tuding',
    name: '针'
  },
  {
    icon: ic_flag_px,
    value: 'iconfont icon-ic_flag_px',
    name: '旗帜'
  },
  {
    icon: yuanxing1,
    value: 'iconfont icon-yuanxing1',
    name: '原形'
  }
];

export default (dataForPanel) => ({
  draw: {
    name: '绘制',
    value: [
      {
        type: 'string',
        cname:'标识色彩',
        name:'markerColor',
        widget: 'XColorPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: [{type: 'normal'}],
        defaultValue: 'rgb(16, 142, 233)'
      },
      {
        type: 'string',
        cname:'标识符号',
        name:'markerImg',
        widget: 'XIconPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: iconArr,
        defaultValue: '"icon iconfont icon-wiappbiaozhu'
      },
      {
        type: 'number',
        cname:'标识大小',
        name:'markerSize',
        widget: 'XSlider',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: [{maxRange: 50}],
        defaultValue: 24,
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