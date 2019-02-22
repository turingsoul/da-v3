const mapCenterMapping = {
    全国: [103.82664, 36.060476],
    北京市: [116.39737, 39.939502],
    天津市: [117.133262, 39.256321],
    上海市: [121.36464, 31.303465],
    重庆市: [106.32485, 29.895013],
    河北省: [114.336873, 38.21885],
    山西省: [112.349964, 38.044464],
    辽宁省: [123.241164, 41.948112],
    吉林省: [125.228072, 43.894927],
    黑龙江省: [126.479088, 45.985284],
    江苏省: [118.715429, 32.246466],
    浙江省: [120.040035, 30.350837],
    安徽省: [117.170056, 31.99595],
    福建省: [119.156964, 26.182279],
    江西省: [115.808656, 28.774611],
    山东省: [116.912494, 36.812038],
    河南省: [113.453802, 34.895028],
    湖北省: [114.116105, 30.764814],
    湖南省: [112.800698, 28.474291],
    广东省: [113.233035, 23.224606],
    海南省: [110.179083, 19.921006],
    四川省: [103.924003, 30.796585],
    贵州省: [106.499624, 26.844365],
    云南省: [102.599397, 25.248948],
    陕西省: [108.780889, 34.408508],
    甘肃省: [103.66644, 36.218003],
    青海省: [101.605943, 36.752842],
    西藏自治区: [90.972306, 29.838888],
    广西壮族自治区: [108.265765, 23.020403],
    内蒙古自治区: [111.614073, 40.951504],
    宁夏回族自治区: [106.094884, 38.624116],
    新疆维吾尔自治区: [87.476819, 43.894927],
    香港特别行政区: [114.1529, 22.542716],
    澳门地区: [113.417008, 22.337477],
    台湾省: [121.36464, 25.248948]
};
const mapCentersArr = [
    {"name":"全国", "value" : "全国"},
    {"name":"北京市", "value" : "北京市"},
    {"name":"天津市", "value" : "天津市"},
    {"name":"上海市", "value" : "上海市"},
    {"name":"重庆市", "value" : "重庆市"},
    {"name":"河北省", "value" : "河北省"},
    {"name":"山西省", "value" : "山西省"},
    {"name":"辽宁省", "value" : "辽宁省"},
    {"name":"吉林省", "value" : "吉林省"},
    {"name":"黑龙江省", "value" : "黑龙江省"},
    {"name":"江苏省", "value" : "江苏省"},
    {"name":"浙江省", "value" : "浙江省"},
    {"name":"安徽省", "value" : "安徽省"},
    {"name":"福建省", "value" : "福建省"},
    {"name":"江西省", "value" : "江西省"},
    {"name":"山东省", "value" : "山东省"},
    {"name":"河南省", "value" : "河南省"},
    {"name":"湖北省", "value" : "湖北省"},
    {"name":"湖南省", "value" : "湖南省"},
    {"name":"广东省", "value" : "广东省"},
    {"name":"海南省", "value" : "海南省"},
    {"name":"四川省", "value" : "四川省"},
    {"name":"贵州省", "value" : "贵州省"},
    {"name":"云南省", "value" : "云南省"},
    {"name":"陕西省", "value" : "陕西省"},
    {"name":"甘肃省", "value" : "甘肃省"},
    {"name":"青海省", "value" : "青海省"},
    {"name":"西藏自治区", "value" : "西藏自治区"},
    {"name":"广西壮族自治区", "value" : "广西壮族自治区"},
    {"name":"内蒙古自治区", "value" : "内蒙古自治区"},
    {"name":"宁夏回族自治区", "value" : "宁夏回族自治区"},
    {"name":"新疆维吾尔自治区", "value" : "新疆维吾尔自治区"},
    {"name":"香港特别行政区", "value" : "香港特别行政区"},
    {"name":"澳门地区", "value" : "澳门地区"},
    {"name":"台湾省", "value" : "台湾省"}
  ];

const onlineLayers = {
    Normal: "Geoq.Normal.Map",
    PurplishBlue: "Geoq.Normal.PurplishBlue",
    Gray: "Geoq.Normal.Gray",
    Warm: "Geoq.Normal.Warm",
    Light: "GaoDe.Normal.Map",
    Satellite: "GaoDe.Satellite.Map"
};

export {mapCenterMapping,mapCentersArr,onlineLayers}