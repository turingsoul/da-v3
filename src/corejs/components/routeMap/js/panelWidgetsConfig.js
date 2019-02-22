const bike = require('resource/images/icon-bike.png');
const car = require('resource/images/icon-car.png');
const train = require('resource/images/icon-train.png');
const plane = require('resource/images/icon-plane.png');

import {mapCentersArr} from "corejs/resource/js/mapUtil.js";

const iconArr = [
  {
    icon: bike,
    value: 'fa fa-bicycle',
    name: '自行车'
  },
  {
    icon: car,
    value: 'fa fa-car',
    name: '汽车'
  },
  {
    icon: train,
    value: 'fa fa-train',
    name: '火车'
  },
  {
    icon: plane,
    value: 'fa fa-plane',
    name: '飞机'
  }
];

const playArr = [
  {
    name: '单次',
    value: 'single'
  },
  {
    name: '循环',
    value: 'multi'
  },
  {
    name: '关闭',
    value: 'close'
  }
];

export default (dataForPanel) => ({
  draw: {
    name: '绘制',
    value: [
      {
        type: 'string',
        cname:'轨迹色彩',
        name:'routeColor',
        widget: 'XColorPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: [{type: 'normal'}],
        defaultValue: 'rgb(16, 142, 233)'
      },
      
      {
        type: 'number',
        cname:'轨迹宽度',
        name:'routeSize',
        widget: 'XSlider',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option:  [{maxRange: 15}],
        defaultValue: 2
      },
      {
        type: 'bolean',
        cname:'轨迹箭头',
        name:'arrowShow',
        widget: 'XSwitch',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: null,
        defaultValue: true,
      },
      // {
      //   type: 'bolean',
      //   cname:'显示关键点',
      //   name:'pointShow',
      //   widget: 'XSwitch',
      //   disable: false,
      //   visible: true,
      //   belongTo: 'draw',
      //   option: null,
      //   defaultValue: true,
      // },
      {
        type: 'string',
        cname:'轨迹巡航',
        name:'arrowAnimation',
        widget: 'XRadio',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: playArr,
        defaultValue: 'close',
      },
      {
        type: 'string',
        cname:'巡航器样式',
        name:'arrowStyle',
        widget: 'XIconPicker',
        disable: false,
        visible: true,
        belongTo: 'draw',
        option: iconArr,
        defaultValue: 'fa fa-plane',
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
        defaultValue:   [39.92,116.46],
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
        defaultValue: 12
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