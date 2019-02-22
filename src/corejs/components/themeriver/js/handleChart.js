import WidgetBase from "corejs/components/base";
import Util from "corejs/util/util";
import $ from "jquery";

/**
 * 将数据进行重新构建，适用于绑定数据集类型的数据源
 * @param {Number} xIndex data中每行数据x对应index
 * @param {Array} yIndexs data中每行数据y对应index集合
 * @param {Number} seriesIndex data中每行数据series对应index
 * @param {Array} data [[],[],[],...] response data
 * @param {Object} cellsConfig 组件绑定数据集，字段分组集详细配置信息
 * @return {Object} {xValues,yKeys,yNames,data: newData}
 */
const rebuildData = (
    xIndex,
    yIndexs = [],
    seriesIndex,
    data = [],
    cellsConfig
) => {
    //x的值集合
    let xValues = [];
    //y的key集合，结合x构造新数据的结构
    let yKeys = [];
    //y的名称集合，和yKeys对应。用作图例
    let yNames = [];
    //系列的值集合
    let seriesValues = [];
    //新的数据
    let newData = [];
    //数据扁平化
    let tmpData = {};
    //是否配置了系列
    let hasSeries = typeof seriesIndex !== undefined && seriesIndex !== null;

    //数据遍历，对数据扁平化，及生成xValues seriesValues yNames yKeys
    data.forEach(v => {
        let xValue = v[xIndex];
        let seriesValue;

        //x当前值不存在，将系列的值写入xValues
        xValues.indexOf(xValue) === -1 && xValues.push(xValue);

        //如果配置了系列，且当前值不存在，将系列的值写入seriesValues
        if (hasSeries) {
            seriesValue = v[seriesIndex];
            seriesValues.indexOf(seriesValue) === -1 &&
                seriesValues.push(seriesValue);
        }

        //idx表示在查询参数中的位置，表示在cellsConfig.counter.fields中的位置
        yIndexs.forEach((idx, i) => {
            let yValue = v[idx];
            let field = cellsConfig.counter.fields[i];
            let name = field.config.cellName || field.field.name;
            let yName;
            let yKey = hasSeries ? [seriesValue, idx].join("~") : idx;
            //将数据集扁平化，key的格式为[x_series_yIndex]
            let key = [xValue || "null", yKey || "null"].join("~");

            if (hasSeries) {
                yKey = [seriesValue || "null", idx].join("~");
                yName = [seriesValue || "null", name || "null"].join("~");
            } else {
                yKey = idx;
                yName = name;
            }

            if (yKeys.indexOf(yKey) === -1) {
                yKeys.push(yKey);
                yNames.push(yName);
            }

            //写入单条扁平化数据
            tmpData[key] = yValue;
            tmpData[key] = Util.formatData2Num(
                tmpData[key],
                cellsConfig.counter.fields[i].config || {}
            );
        });
    });

    //xValues和yKeys元素进行组合，构建新的数据结构
    yKeys.forEach(yKey => {
        let _data = [];
        xValues.forEach(xValue => {
            let key = [xValue || "null", yKey || "null"].join("~");
            _data.push(tmpData[key] || 0);
        });
        newData.push(_data);
    });

    return {
        xValues,
        yKeys,
        yNames,
        data: newData
    };
};

class HandleChart extends WidgetBase {
    /**
     *
     * @param {*} data 数据
     * @param {*} tempOption 大模板
     * @param {*} enumOption 枚举属性
     */
    _handleData(drillName) {
        const { chartDefinition } = this.cfg;
        let tempOption = this._option,
            enumOption = chartDefinition.option,
            data = chartDefinition.data;
        // handleData(data, tempOption, enumOption) {
        if (!data.metadata || !data.metadata.length) return {};

        //metadata 第一个元素放x轴，根据其数据类型确定是 category or time or value
        //确定singleAxis 类型
        //string 类型 为legend, Numberic 类型为 指标

        //删除该字段
        tempOption.singleAxis.data && delete tempOption.singleAxis.data;
        let colType = data.metadata[0].colType.toLowerCase();
        if (colType === "date") {
            tempOption.singleAxis.type = "time";
            this.sortFull(data, tempOption);
        } else if (colType === "string") {
            tempOption.singleAxis.type = "category";
            let { mainTime } = this.sortFull(data, tempOption);
            //mainTime 是类目 category
            tempOption.singleAxis.data = mainTime;

            tempOption.series[0].data.forEach(el => {
                el[0] = mainTime.indexOf(el[0]);
            });
        } else if (colType === "numeric" || colType === "integer") {
            tempOption.singleAxis.type = "value";
            this.sortFull(data, tempOption);
        }

        return tempOption;
    }
    _handleDataSetData() {
        let option = this._option;
        let { data, query } = this.cfg.chartDefinition;
        let { metadata, resultset } = data;
        let { datasetSetting } = query;
        let { cellToInd, cellsConfig } = datasetSetting;
        let counterFields = query.datasetSetting.cellsConfig.counter.fields[0];
        let dataHandle = counterFields.config || {};
        dataHandle.formatMask = counterFields.field.formatMask || "";

        if (!cellToInd || !resultset || resultset.length === 0) {
            return option;
        }

        let seriesIdx = cellToInd.series;
        let xAxisIdx = cellToInd.xAxis;
        let counterIdx = cellToInd.counter;

        //当不存在x轴和指标轴字段时候，字段个数不满足，不处理
        if (!xAxisIdx.length || !counterIdx.length) {
            return option;
        }
        resultset.forEach(e => {
            e[xAxisIdx[0]] = xAxisIdx.map(item => e[item] || "null").join("~");
        });
        xAxisIdx = xAxisIdx[0];
        seriesIdx = seriesIdx.length ? seriesIdx[0] : null;
        let relData = rebuildData(
            xAxisIdx,
            counterIdx,
            seriesIdx,
            resultset,
            cellsConfig
        );

        const _filterData =
            relData.yNames; /* .map((ele) => {
            if(!ele || ele=="null") {ele=="-"};
            const eleArr = ele.split("~");
            const len = eleArr.length;
            if(len === 2) {
              if(eleArr[0]=="") {
                ele = eleArr[1];
              }else if(eleArr[1]=="") {
                ele = eleArr[0];
              }
            }
            return ele;
          }) */

        option.legend.data = _filterData;
        option.legend.formatter = function(param) {
            let _name = param || "-";
            _name = _name.replace(/(^null~)|(~null)/g, "");
            return _name;
        };
        option.series[0].data = [];

        relData.data.forEach((item, index) => {
            item.forEach((v, i) => {
                option.series[0].data.push([
                    relData.xValues[i],
                    v,
                    relData.yNames[index]
                ]);
            });
        });

        let colType = query.datasetSetting.cellsConfig.xAxis.fields[0].field.type.toLowerCase();

        if (relData.xValues) {
            let sampling = relData.xValues[0];
            //对数据取样，不能转换的时间格式数据当字符串类型处理
            if (
                typeof sampling === "string" &&
                new Date(sampling).toString() === "Invalid Date"
            ) {
                colType = "string";
            }
        }

        if (colType === "date") {
            option.singleAxis.type = "time";
        } else if (colType === "string") {
            option.singleAxis.type = "category";
            option.singleAxis.data = relData.xValues;
            option.series[0].data.forEach(e => {
                e[0] = relData.xValues.indexOf(e[0]);
            });
        } else if (colType === "numeric" || colType === "integer") {
            option.singleAxis.type = "value";
        }

        // if (JSON.stringify(_data) === "{}") {
        //     return;
        // }

        // let colType = query.datasetSetting.cellsConfig.xAxis.fields[0].field.type.toLowerCase();

        // if (colType === "date") {
        //     tempOption.singleAxis.type = "time";
        //     this.sortFullSetData(_data, tempOption);
        // } else if (colType === "string") {
        //     tempOption.singleAxis.type = "category";
        //     let { mainTime } = this.sortFullSetData(_data, tempOption);
        //     //mainTime 是类目 category
        //     tempOption.singleAxis.data = mainTime;

        //     tempOption.series[0].data.forEach(el => {
        //         el[0] = mainTime.indexOf(el[0]);
        //     });
        // } else if (colType === "numeric" || colType === "integer") {
        //     tempOption.singleAxis.type = "value";
        //     this.sortFullSetData(_data, tempOption);
        // }

        option.tooltip.formatter = params => {
            let node = this.pingjie(params[0].data[0]) + "</br>";
            for (let item of params) {
                let counter = Util.formatData2Str(item.data[1], dataHandle);
                node += this.pingjie(item.data[2]) + ":" + counter + "</br>";
            }
            return node;
        };
        return option;
    }
    //tooltip中的拼接
    pingjie(_name) {
        _name = _name || "-";
        _name = _name.replace(/(^null~)|(~null)/g, "");
        return _name;
    }
    sortFullSetData(_data, tempOption) {
        let legendKey = {},
            temArr = []; //时间主干

        for (let i in _data.xAxis) {
            if (!_data.series.length) {
                if (!legendKey["default"]) {
                    legendKey["default"] = [];
                }
                legendKey["default"].push([
                    _data.xAxis[i][0],
                    _data.counter[i][0],
                    "default"
                ]);
            } else {
                if (!legendKey[_data.series[i][0]]) {
                    legendKey[_data.series[i][0]] = [];
                }
                legendKey[_data.series[i][0]].push([
                    _data.xAxis[i][0],
                    _data.counter[i][0],
                    _data.series[i][0].toString()
                ]);
            }

            if (_data.xAxis[i][0] || _data.xAxis[i][0] === 0) {
                temArr.push(_data.xAxis[i][0]);
            }
        }

        let sameLengend = Object.values(legendKey);
        //获得时间主干
        let mainTime = [...new Set(temArr)];
        //所有补全
        sameLengend = sameLengend.map(len => ({
            els: len,
            length: len.length,
            name: len[0][2]
        }));

        for (let maxLengend of sameLengend) {
            let maxLengendTimes = maxLengend.els.map(el => el[0]);
            let newMainTime = mainTime.map(time => {
                let idx = maxLengendTimes.indexOf(time);
                return [
                    time,
                    idx > -1 ? maxLengend.els[idx][1] : 0,
                    maxLengend.name
                ];
            });
            legendKey[maxLengend.name] = newMainTime;
        }

        //设置图例
        tempOption.legend.data = [...new Set(Object.keys(legendKey))];
        //先平级话legendkey，然后设置data
        tempOption.series[0].data = Object.values(legendKey).reduce(
            (prev, next) => prev.concat(next),
            []
        );
        return {
            tempOption,
            mainTime
        };
    }
    /**
     *
     * @param {*} tempOption 大模板
     * @param {*} enumOption 枚举属性
     * @param {*} htmlObj
     */
    handleEnumOption(tempOption, enumOption, htmlObj) {
        for (let everyOption in enumOption) {
            this.handleEveryOption(
                everyOption,
                enumOption[everyOption],
                tempOption,
                enumOption,
                htmlObj
            );
        }
        return tempOption;
    }
    /**
     *
     * @param {*} key  枚举属性键
     * @param {*} value 枚举属性值
     * @param {*} option 大模板
     * @param {*} htmlObj
     * @param {*} enumOption
     */
    handleEveryOption(item, value, option, enumOption, htmlObj) {
        switch (item) {
            case "title":
                //用rich 是因为 要给标题设置背景颜色
                if (!option || !option.title) {
                    return;
                }
                option.title.z = -2;
                option.title.padding = [0, 0, 0, 5];
                option.title.text = `{a|${value}}`;
                option.title.textStyle.rich.a = {
                    lineHeight: 40,
                    fontSize: 16,
                    width: 10000
                };
                break;
            case "titleBackgroundColor":
                option.title.backgroundColor = value || "transparent";
                if (this.cfg.chartDefinition.option.title === "") {
                    option.title.backgroundColor = "transparent";
                }
                break;
            case "titlePosition":
                option.title.left = value;
                break;
            case "isExportData":
                /*  document.querySelector(
                  "#" + this.cfg.id + " .chartCsv"
              ).style.display = value ? "block" : "none"; */
                Dashboard.lib
                    .$("#" + this.cfg.id + " .chartCsv")
                    .css({ display: value ? "block" : "none" });
                break;
            case "example":
                this.handleExample(value, option, htmlObj, enumOption);
                this.adjustGrid(item, value, option, htmlObj, enumOption);
                break;
            case "showLabel":
                option.series.map(i => {
                    i.label.normal.show = value;
                });
                break;
            case "labelPos":
                option.series.map(i => {
                    i.label.normal.position = value;
                });
                break;
            case "axisTick":
                option.singleAxis.axisTick.show = value;
                break;
            case "splitLine":
                option.singleAxis.splitLine.show = value;
                break;
            case "axisTitle":
                option.singleAxis.name = value;
                break;
            case "color":
                if (value.length > 0) {
                    option.color = value;
                }
                break;
            case "backgroundColor":
                value && (htmlObj.style[item] = value);
                if (this.cfg.parentId) {
                    htmlObj.style[item] = "rgba(0, 0, 0, 0)";
                }
                break;
            case "textColor":
                if (value.length > 0) {
                    //设置主要颜色
                    option.title.textStyle.color = value[0];
                    //设置次要颜色
                    //图例颜色
                    value[1] && (option.legend.textStyle.color = value[1]);
                    // 刻度文字、坐标名字
                    value[1] &&
                        ((option.singleAxis.axisLabel.color = value[1]),
                        (option.singleAxis.nameTextStyle.color = value[1]));
                }
                break;
            case "lineColor":
                if (value.length > 0) {
                    value[0] &&
                        (option.singleAxis.axisLine.lineStyle.color = value[0]);
                    value[1] &&
                        (option.singleAxis.splitLine.lineStyle.color =
                            value[1]);
                }
                break;
            default:
                break;
        }
    }
    handleExample(value, option, htmlObj, enumOption) {
        option.legend.top = "auto";
        option.legend.right = "auto";
        option.legend.left = "auto";
        option.legend.bottom = "auto";
        option.legend.orient = "horizontal";
        option.legend.show = true;
        option.legend.type = "scroll";
        switch (value) {
            case "null":
                option.legend.show = false;
                break;
            case "top":
                option.legend.top = enumOption.title.length > 0 ? 40 : "0";
                option.legend.left = "center";
                break;
            case "left":
                option.legend.left = 0;
                option.legend.top = "middle";
                option.legend.orient = "vertical";
                break;
            case "right":
                option.legend.right = 0;
                option.legend.top = "middle";
                option.legend.orient = "vertical";
                break;
            case "bottom":
                option.legend.left = "center";
                option.legend.bottom = "0";
                break;
            default:
                break;
        }
    }
    adjustGrid(item, value, option, htmlObj, enumOption) {
        //如果坐标轴 和  图例 在同一个位置，就需要计算坐标系位置
        const chartMargin = 10; //图表边距
        const titleHeight = 40; //标题高度
        const bottomGap = enumOption.axisTitle.length ? 55 : 45;
        let maxStrObj = this.getLabelMaxLength(option.legend.data);
        let lengthWidth =
            10 + +30 + this.measureTextWidth(maxStrObj.maxValue) + 10;
        if (enumOption.example === "left") {
            option.singleAxis.left = lengthWidth;
            option.singleAxis.right = 20;
            option.singleAxis.top = enumOption.title.length ? titleHeight : 20;
            option.singleAxis.bottom = bottomGap;
        } else if (enumOption.example === "right") {
            option.singleAxis.right = lengthWidth;
            option.singleAxis.left = 20;
            option.singleAxis.top = enumOption.title.length ? titleHeight : 20;
            option.singleAxis.bottom = bottomGap;
        } else if (enumOption.example === "top") {
            option.singleAxis.left = 20;
            option.singleAxis.right = 20;
            option.singleAxis.top = enumOption.title.length
                ? titleHeight + 25
                : 20;
            option.singleAxis.bottom = bottomGap;
        } else if (enumOption.example === "bottom") {
            option.singleAxis.left = 20;
            option.singleAxis.right = 20;
            option.singleAxis.top = enumOption.title.length ? titleHeight : 20;
            option.singleAxis.bottom = 45 + 20;
        } else if (enumOption.example === "null") {
            option.singleAxis.left = 20;
            option.singleAxis.right = 20;
            option.singleAxis.top = enumOption.title.length ? titleHeight : 20;
            option.singleAxis.bottom = bottomGap;
        }
        return option;
    }
    /**
     * 使用canvas 测量字符所占长度
     * @param {*} text
     * @param {*} fontSize
     */
    measureTextWidth(text, fontSize = 12) {
        let ctx = document.createElement("canvas").getContext("2d");
        ctx.font = `${fontSize}px Arial`;
        return ctx.measureText(text).width;
    }
    /**
     * 找出字符最长的一个
     * @param {*} arr
     */
    getLabelMaxLength(arr = []) {
        let maxLength = 0,
            maxIndex = 0;
        let tempArr = arr.map(el => {
            let str = el + "".trim(),
                strLen = 0;
            for (let i = 0, len = str.length; i < len; i++) {
                if (str[i].charCodeAt(i) > 256) {
                    strLen += 3;
                } else {
                    strLen++;
                }
            }
            return strLen;
        });
        //找到最大值 和 对应索引
        maxLength = Math.max.apply(Array, tempArr);
        if (maxLength) {
            maxIndex = tempArr.indexOf(maxLength);
        }
        return {
            maxLength,
            maxIndex,
            maxValue: arr[maxIndex]
        };
    }
    /**
     * 对data 按图例分类
     * 然后对主干河流做信息补全
     * @param {*} data
     * @param {*} tempOption
     */
    sortFull(data, tempOption) {
        let metadata = data.metadata,
            lengendMeta,
            valueMeta,
            formaterData = [],
            legend = [],
            category = [],
            temp = {},
            legendKey = {},
            tempArr = [];
        lengendMeta = metadata
            .slice(1)
            .find(el => el.colType.toLowerCase() === "string");
        valueMeta = metadata
            .slice(1)
            .find(
                el =>
                    el.colType.toLowerCase() === "numeric" ||
                    el.colType.toLowerCase() === "integer"
            );
        //这里处理的主要逻辑是
        //先按图例分类
        //然后最图例数最多的做日期补全
        data.resultset.forEach(el => {
            //按图例分类
            if (!legendKey[el[lengendMeta.colIndex]]) {
                legendKey[el[lengendMeta.colIndex]] = [];
            }
            legendKey[el[lengendMeta.colIndex]].push([
                el[0],
                el[valueMeta.colIndex],
                el[lengendMeta.colIndex]
            ]);
            //保存时间主干
            tempArr.push(el[0]);
        });

        let sameLengend = Object.values(legendKey);
        //获得时间主干
        let mainTime = [...new Set(tempArr)];
        //按图例数量 从小到大排列，找出图例数最多的一个
        let maxLengend = sameLengend
            .map(len => ({
                els: len,
                length: len.length,
                name: len[0][2]
            }))
            .sort((prev, next) => {
                return prev.length - next.length;
            });
        maxLengend = maxLengend[maxLengend.length - 1];
        //按时间主干 对 图例数最多的 进行不全
        let maxLengendTimes = maxLengend.els.map(el => el[0]);
        let newMainTime = mainTime.map(time => {
            let idx = maxLengendTimes.indexOf(time);
            return [
                time,
                idx > -1 ? maxLengend.els[idx][1] : 0,
                maxLengend.name
            ];
        });
        // maxLengend.forEach(lengend => {
        //   let maxLengendTimes = lengend.els.map(el => el[0]);
        //   let newMainTime = mainTime.map(time => {
        //     let idx = maxLengendTimes.indexOf(time);
        //     return [time, idx > -1 ? lengend.els[idx][1] : 0, lengend.name]
        //   });
        //    //重新 放到legendKey中
        //   legendKey[lengend.name] = newMainTime;
        // });

        //重新 放到legendKey中
        legendKey[maxLengend.name] = newMainTime;
        //设置图例
        tempOption.legend.data = [...new Set(Object.keys(legendKey))];
        //先平级话legendkey，然后设置data
        tempOption.series[0].data = Object.values(legendKey).reduce(
            (prev, next) => prev.concat(next),
            []
        );
        return {
            tempOption,
            mainTime
        };
    }
}

export default HandleChart;
