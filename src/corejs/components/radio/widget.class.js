import WidgetBase from "corejs/components/base";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Radio } from "antd";
import Util from "corejs/util/util";

export default class RadioWidget extends WidgetBase {
    static cname = "单选款";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this.div = document.createElement("div");
        this.div.setAttribute("id", cfg.id);
        this.div.setAttribute("class","verticalCenter");
        this.handleDefinition(cfg.chartDefinition);
        return (this.rootDom = this.div);
    }
    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
    }
    setItem() {
        let container = this.div;
        var self = this;
        class MyRadio extends React.Component {
            constructor(props) {
                super(props);
            }

            componentWillMount(){
                this.mounted = true;
            }
            componentWillUnmount() {
                this.mounted = false;
            }

            componentDidMount = () => {
                self.subscribe("parameterChange", d => {
                    var pattern = new RegExp("[`~!@#$^&*()=|{}':;'\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
                    if(pattern.test(d.value)){
                        console.log("包含特殊字符，不符合规范");
                    }else{
                        let final = d.value;
                        final = String(final).split(",");
                        if(this.mounted){
                            this.setState({ value: final[0].toString()});
                        }
                    } 
                });
            };

            state = {
                value: null
            };

            onChange = e => {
                let value = e.target.value;
                this.setState({ value: value},()=>{
                    self.setParameter(value);
                });
            };

            render() {
                self.handleData(this);
                return <div>{self._options}</div>;
            }
        }
        ReactDOM.render(<MyRadio />, container);
        this.setSelected(self.cfg.parameter);
    }

    setSelected(parameter) {
        if (!parameter || !this.getParameter(parameter)) return false;
        let value = this.getParameter(parameter).getValue();
        //设置parameter对应值 到radio
        this.dispatch("parameterChange", { value: value });
    }

    _handleData(self) {
        let options = [];
        let value = this.cfg.chartDefinition.data;

        if (value && value.resultset) {
            for (var i = 0; i < value.resultset.length; i++) {
                let _value = value.resultset[i][0];
                let _key = _value + i;
                let _checked = self.state.value === _value.toString();
                
                options.push(
                    <Radio
                        onClick={self.onChange}
                        value={_value}
                        key={_key}
                        checked={_checked}
                    >
                        {_value}
                    </Radio>
                );
            }
        }
        this._options = options;
    }

    _handleDataSetData(self) {
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        //找出该字段的格式化规则
        let valueFields = query.datasetSetting.cellsConfig.value.fields[0];
        if (!valueFields) {
            return;
        }
        let dataHandle = valueFields.config.dataHandle || { model: "auto" };
        dataHandle.formatMask = valueFields.field.formatMask;

        let options = [];

        if (JSON.stringify(_data) === "{}") {
            return;
        }
        for (let i in _data.value) {
            let _value = _data.value[i][0];
            let _key = _value + i;
            //格式化数据
            let formatData = Util.formatData2Num(_value, dataHandle);
            formatData = Util.formatData2Str(formatData, dataHandle);

            let _checked = self.state.value === formatData;
            options.push(
                <Radio
                    onClick={self.onChange}
                    value={formatData}
                    key={_key}
                    checked={_checked}
                >
                    {formatData}
                </Radio>
            );
        }

        this._options = options;
    }

    dispatchDefinition(type, value) {
        switch (type) {
            case "data":
                this.cfg.chartDefinition.data = value;
                this.setItem();
                break;
            case "option":
                this.handleDefinition(value);
                break;
            case "backgroundColor":
                this.htmlObj.style.backgroundColor = value;
                this.cfg.chartDefinition.option[type] = value;
                if (this.cfg.parentId) {
                    this.htmlObj.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    this.cfg.chartDefinition.option[type] = "rgba(0, 0, 0, 0)";
                }
                break;
            case "textColor":
                this.htmlObj.style.color =
                    typeof value === "string" ? value : value[0];
                this.cfg.chartDefinition.option[type] =
                    typeof value === "string" ? value : value[0];
                break;
            case "value":
                this.cfg.chartDefinition.option.value = value;
                this.cfg.parameter = value;
                //修改了parameter值之后，应该把parameter对应的值 放入 到select中
                this.setSelected(value);
                break;
            default:
                break;
        }
    }
    widgetDidCreated(cfg) {
        super.widgetDidCreated(cfg);
        this.htmlObj.appendChild(this.div);
    }
    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        this.handleDefinition(nextCfg);
    }
    postUpdate(nextCfg) {
        super.postUpdate(nextCfg);
    }
    draw() {
        super.draw();
    }
    destroy() {}
}
