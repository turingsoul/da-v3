import WidgetBase from "corejs/components/base";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Select } from "antd";
import Util from "corejs/util/util";
const Option = Select.Option;

export default class SelectWidget extends WidgetBase {
    static cname = "单选下拉框";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this.select = document.createElement("div");
        this.select.setAttribute("id", cfg.id);
        this.select.setAttribute("class","verticalCenter");
        this.select.style.padding = "5px";
        this.handleDefinition(cfg.chartDefinition);
        return (this.rootDom = this.select);
    }
    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
    }

    _handleData() {
        let data = this.cfg.chartDefinition.data;
        let result = {
            children: []
        };
        if (data && data.resultset) {
            for (let i = 0; i < data.resultset.length; i++) {
                let item = data.resultset[i];
                let _value = item[0];
                let _key = _value + "-" + i;
                result.children.push(
                    <Option value={_value} key={_key}>
                        {_value}
                    </Option>
                );
            }
        }
        this.setSelectOption(result);
    }

    _handleDataSetData() {
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        let valueFields = query.datasetSetting.cellsConfig.value.fields[0];
        if (!valueFields) {
            return;
        }
        let dataHandle = valueFields.config || {};
        dataHandle.formatMask = valueFields.field.formatMask;

        let result = {
            children: []
        };

        if (JSON.stringify(_data) === "{}") {
            return;
        }

        for (let i in _data.value) {
            let _value = _data.value[i][0];
            let _key = _value + "-" + i;
            let formatData = Util.formatData2Num(_value, dataHandle);
            formatData = Util.formatData2Str(formatData, dataHandle).toString();
            result.children.push(
                <Option value={formatData} key={_key}>
                    {formatData}
                </Option>
            );
        }

        this.setSelectOption(result);
    }

    setSelectOption(value) {
        let self = this;
        let result = value;
        class MySelect extends React.Component {
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
                self.subscribe("parameterChange", d => {
                    var pattern = new RegExp(
                        "[`~!@#$^&*()=|{}':;'\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"
                    );
                    if (pattern.test(d.value)) {
                        console.log("包含特殊字符，不符合规范");
                    } else {
                        let final = d.value;
                        final = String(final).split(",");
                        if (this.mounted) {
                            this.setState({ value: final[0].toString() });
                        }
                    }
                });
            };
            state = {
                value: ""
            };
            onChange = value => {
                this.setState({ value: value },()=>{
                    self.setParameter(value);
                });
            };
            render() {
                const tProps = {
                    value: this.state.value,
                    onChange: this.onChange,
                    style: {
                        width: "100%",
                        height: "100%"
                    }
                };
                return <Select {...tProps}>{result.children}</Select>;
            }
        }
        ReactDOM.render(<MySelect />, this.select);

        this.setSelected(self.cfg.parameter);
    }

    setSelected(parameter) {
        if (!parameter || !this.getParameter(parameter)) return false;
        let value = this.getParameter(parameter).getValue();
        this.dispatch("parameterChange", { value: value });
    }

    dispatchDefinition(type, value) {
        switch (type) {
            case "data":
                this.cfg.chartDefinition.data = value;
                this.handleData();
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
        this.htmlObj.appendChild(this.select);
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
