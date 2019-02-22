import WidgetBase from "corejs/components/base";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Select } from "antd";
const Option = Select.Option;
import Util from "corejs/util/util";
import $ from "jquery";

export default class MultiselectWidget extends WidgetBase {
    static cname = "多选下拉框";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        //添加style
        this._mySelectStyle =
            $("#_mySelectStyle").length > 0
                ? $("#_mySelectStyle")
                : $('<style id="_mySelectStyle">').appendTo(document.head);
        window.aa_bb = $;
        this.div = $("<div>");
        this.div.css({
            width: "100%",
            // height: "100%",
            "box-sizing": "border-box",
            padding: "5px"
        });
        this.div.addClass("verticalCenter");
        this.handleDefinition(cfg.chartDefinition);
        return (this.rootDom = this.div[0]);
    }

    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
    }

    setItem() {
        let self = this;
        let $container = self.div;
        self.handleData();
        let children = self._options || [];

        if(children.length === 0){
            //没数据时，不显示多选按钮，用缺省图
            return
        }

        class MyMultiSelect extends React.Component {
            constructor(props) {
                super(props);
            }
            componentWillMount() {
                this.mounted = true;
            }
            componentWillUnmount() {
                this.mounted = false;
            }
            state = {
                value: []
            };
            handleChange = value => {
                this.state.value = value;
                this.setState({ value: value }, () => {
                    self.setParameter(value);
                });
                this.resizeBox();
            };
            handleSearch = value => {
                this.resizeBox();
            };
            resizeBox = () => {
                let _mySelectStyle = self._mySelectStyle;
                //获取弹出下拉框
                let aa = $("." + self.cfg.id + "_select");
                //添加样式
                _mySelectStyle.text(
                    `.${self.cfg.id +
                        "_select"}{top: ${$container[0].getBoundingClientRect()
                        .top +
                        $container.outerHeight() +
                        "px!important"}}`
                );
                if (
                    $("#background-container").height() <
                    parseFloat(aa.css("top")) + aa.height()
                ) {
                    _mySelectStyle.text(
                        `.${self.cfg.id + "_select"}{
                            top:auto!important;
                            bottom:-${$container[0].getBoundingClientRect()
                                .top + "px!important"}
                    }}`
                    );
                }
            };

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
                        if (d.value !== "" && this.mounted && final.length) {
                            thisSelf.setState({ value: final });
                        }
                    }
                });
            };

            render() {
                return (
                    <Select
                        mode="tags"
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                        placeholder="Tags Mode"
                        onChange={this.handleChange}
                        onSearch={this.handleSearch}
                        value={this.state.value}
                    >
                        {children}
                    </Select>
                );
            }
        }
        ReactDOM.render(<MyMultiSelect />, $container[0]);
        this.setSelected(self.cfg.parameter);
    }

    _handleData() {
        let children = [];
        let value = this.cfg.chartDefinition.data;
        if (value && value.resultset) {
            value.resultset.map((e, i) => {
                let _key = i.toString(36) + i;
                children.push(
                    <Option key={_key} value={e[0] + ''}>
                        {e[0] + ''}
                    </Option>
                );
            });
        }

        this._options = children;
    }

    _handleDataSetData() {
        const { data, query } = this.cfg.chartDefinition;
        let _data = this._grupDataSet();
        //找出该字段的格式化规则
        let valueFields = query.datasetSetting.cellsConfig.value.fields[0];
        let dataHandle = valueFields.config || {};
        dataHandle.formatMask = valueFields.field.formatMask || "";

        let children = [];

        if (JSON.stringify(_data) === "{}") {
            return;
        }
        for (let i in _data.value) {
            let _value = _data.value[i][0];
            let _key = _value + i;
            //格式化数据
            let formatData = Util.formatData2Num(_value, dataHandle);
            formatData = Util.formatData2Str(formatData, dataHandle) + "";
            children.push(
                <Option key={_key} value={formatData}>
                    {formatData}
                </Option>
            );
        }

        this._options = children;
    }

    setSelected(parameter) {
        if (!parameter || !this.getParameter(parameter)) return false;
        let value = this.getParameter(parameter).getValue();
        this.dispatch("parameterChange", { value: value });
    }

    dispatchDefinition(type, value) {
        let _option = this.cfg.chartDefinition.option;
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
                _option[type] = value;
                break;
            case "textColor":
                this.htmlObj.style.color = value[0];
                _option[type] = value;
                if (this.cfg.parentId) {
                    this.htmlObj.style.backgroundColor = "rgba(0, 0, 0, 0)";
                    _option[type] = "rgba(0, 0, 0, 0)";
                }
                break;
            case "value":
                _option.value = value;
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
        this.htmlObj.appendChild(this.rootDom);
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
