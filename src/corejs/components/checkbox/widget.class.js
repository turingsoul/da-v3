import WidgetBase from "corejs/components/base";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Checkbox } from "antd";
const CheckboxGroup = Checkbox.Group;
import Util from "corejs/util/util";
import $ from "jquery";
export default class CheckBoxWidget extends WidgetBase {
    static cname = "复选框";
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
        let self = this;
        class MyCheckbox extends React.Component {
            constructor(props) {
                super(props);
            }

            componentWillMount() {
                this.mounted = true;
            }
            componentWillUnmount() {
                this.mounted = false;
            }

            componentDidMount = () => {
                let thisSelf = this;
                self.subscribe("parameterChange", d => {
                    var pattern = new RegExp(
                        "[`~!@#$^&*()=|{}':;'\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
                    );
                    if (pattern.test(d.value)) {
                        console.log("包含特殊字符，不符合规范");
                    } else {
                        let final = d.value;
                        final = String(final).split(",");
                        thisSelf.state.value = final;
                        if (this.mounted) {
                            thisSelf.setState({ value: final });
                        }
                    }
                });
            };

            state = {
                value: []
            };

            onChange(checkedValues) {
                this.state.value = checkedValues;
                this.setState({ value: checkedValues }, () => {
                    self.setParameter(checkedValues.filter(e => e !== ""));
                });
            }

            render() {
                self.handleData(this);
                return (
                    <CheckboxGroup
                        options={self._options}
                        value={this.state.value}
                        onChange={e => this.onChange(e)}
                    />
                );
            }
        }

        ReactDOM.render(<MyCheckbox />, container);
        this.setSelected(self.cfg.parameter);
    }

    setSelected(parameter) {
        if (!parameter || !this.getParameter(parameter)) return false;
        let value = this.getParameter(parameter).getValue();
        this.dispatch("parameterChange", { value: value });
    }

    _handleData() {
        let options = [];
        let value = this.cfg.chartDefinition.data;
        if (value && value.resultset) {
            for (var i = 0; i < value.resultset.length; i++) {
                let _value = value.resultset[i][0] + "";
                options.push(_value);
            }
        }
        this._options = options;
    }

    _handleDataSetData() {
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        //找出该字段的格式化规则
        let valueFields = query.datasetSetting.cellsConfig.value.fields[0];
        let dataHandle = valueFields.config || {};
        dataHandle.formatMask = valueFields.field.formatMask;

        let options = [];

        if (JSON.stringify(_data) === "{}") {
            return;
        }
        for (let i in _data.value) {
            let _value = _data.value[i][0];
            //格式化数据
            let formatData = Util.formatData2Num(_value, dataHandle);
            formatData = Util.formatData2Str(formatData, dataHandle);
            options.push(formatData + "");
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
                $(this.htmlObj).css("backgroundColor", value);
                this.cfg.chartDefinition.option[type] = value;
                if (this.cfg.parentId) {
                    $(this.htmlObj).css("backgroundColor", "rgba(0, 0, 0, 0)");
                    this.cfg.chartDefinition.option[type] = "rgba(0, 0, 0, 0)";
                }
                break;
            case "textColor":
                let color = typeof value === "string" ? value : value[0];
                $(this.htmlObj).css("color", color);
                this.cfg.chartDefinition.option[type] = color;
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
