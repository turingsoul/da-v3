/**
 * 表格预警配置
 * author:twy
 * 2018/5/15
 */
import React, { Component } from "react";
import { Row, Col, Switch, Table, Input, Select, Button, Message,Icon } from "antd";
import { ColorPicker } from "../../panelComponents/index";
import $ from "jquery";

const Option = Select.Option;

export default class CardCond extends Component {
    constructor(props) {
        super(props);
        let state = Object.assign(
            {
                conds: [
                    { key: ">", value: ">", text: ">" },
                    { key: ">=", value: ">=", text: ">=" },
                    { key: "<", value: "<", text: "<" },
                    { key: "<=", value: "<=", text: "<=" },
                    { key: "==", value: "==", text: "==" },
                    { key: "!=", value: "!=", text: "!=" }
                ],
                icons:[
                    { key: "0", value: "0", text: "无" },
                    { key: "1", value: "caret-down", text: <Icon size="mini" type="caret-down"/> },
                    { key: "2", value: "caret-up", text: <Icon size="mini" type="caret-up"/> },
                    { key: "3", value: "minus", text: <Icon size="mini" type="minus"/> },
                    { key: "4", value: "check", text: <Icon size="mini" type="check"/> },
                    { key: "5", value: "close", text: <Icon size="mini" type="close"/> },
                    { key: "6", value: "exclamation", text: <Icon size="mini" type="exclamation"/> }
                ],
                open: false,
                config: []
            },
            props.value || {}
        );

        this.count = 0;
        this.state = state;
        this.cardIns = props.inst;
        this.measures = this.getMeasures();

        this.handelOpenChange = this.handelOpenChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.addRow = this.addRow.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
    }

    getMeasures() {
        let numberTypes = ['Integer','Numeric'];
        let metadata = this.cardIns.cfg.chartDefinition.data.metadata || [];

        return metadata.filter(item => numberTypes.indexOf(item.colType) !== -1).map(item => {
            return {
                name: item.colName,
                value: item.colIndex
            };
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            open: nextProps.value.open,
            config: nextProps.value.config
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    addRow() {
        let config = this.state.config;
        config.push({
            key: this.count,
            measure: "",
            cond: "",
            icon:"",
            color: ""
        });
        this.count++;
        this.setState({
            config: config
        });
        this.triggerOnchange({
            open: this.state.open,
            config: config
        });
    }

    deleteRow(index) {
        let config = $.extend(true, [], this.state.config);
        if(config.length === 1){
            Message.error('至少保留一个条件方案');
            return;
        }
        config.splice(index, 1);
        this.setState({
            config: config
        });
        this.triggerOnchange({
            open: this.state.open,
            config: config
        });
    }

    //总体开关
    handelOpenChange(e) {
        this.setState({
            open: e
        });
        this.triggerOnchange({
            open: e,
            config: this.state.config
        });
    }

    handleChange(index, key, value) {
        let config = $.extend(true, [], this.state.config);

        config[index][key] = value;

        this.setState({
            config: config
        });

        this.triggerOnchange({
            open: this.state.open,
            config: config
        });
    }

    //触发配置改变
    triggerOnchange(wraningConfig) {
        this.props.onChange && this.props.onChange(wraningConfig);
    }

    render() {
        const that = this;
        return (
            <div>
                <Row type="flex" align="middle">
                    <Col span={6}>条件方案</Col>
                    <Col span={18}>
                        <Switch
                            checked={this.state.open}
                            onChange={e => this.handelOpenChange(e)}
                        />
                    </Col>
                </Row>
                {this.state.open && (
                    <div>
                        {this.state.config.map((item, index) => (
                            <div
                                key={item.key}
                                style={{
                                    border: "1px #ccc solid",
                                    margin: "3px 0",
                                    padding: "2px",
                                    position: "relative"
                                }}
                            >
                                <Button
                                    size="small"
                                    icon="minus"
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: "-19px"
                                    }}
                                    onClick={() => {
                                        that.deleteRow(index);
                                    }}
                                />
                                <Row type="flex" align="middle" key={item.key} style={{ marginTop: '3px',marginBottom: '8px' }}>
                                    <Col span={24}>
                                        <Select
                                            size="small"
                                            value={item.measure}
                                            style={{ width: "160px" }}
                                            onChange={e => {
                                                that.handleChange(
                                                    index,
                                                    "measure",
                                                    e
                                                );
                                            }}
                                        >
                                            {this.measures.map(v => (
                                                <Option
                                                    key={v.value}
                                                    value={v.value}
                                                >
                                                    {v.name}
                                                </Option>
                                            ))}
                                        </Select>
                                        <Select
                                            size="small"
                                            value={item.cond}
                                            style={{
                                                width: "60px",
                                                marginLeft: "3px"
                                            }}
                                            onChange={e => {
                                                that.handleChange(
                                                    index,
                                                    "cond",
                                                    e
                                                );
                                            }}
                                        >
                                            {that.state.conds.map(v => (
                                                <Option
                                                    key={v.key}
                                                    value={v.value}
                                                >
                                                    {v.text}
                                                </Option>
                                            ))}
                                        </Select>
                                        <Input
                                            size="small"
                                            value={item.value}
                                            style={{
                                                width: "95px",
                                                marginLeft: "3px"
                                            }}
                                            onChange={e => {
                                                that.handleChange(
                                                    index,
                                                    "value",
                                                    e.target.value
                                                );
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row
                                    type="flex"
                                    align="middle"
                                    style={{ marginBottom: '8px' }}
                                >
                                    <Col span={6} style={{textAlign:'center'}}>图标</Col>
                                    <Col span={18}>
                                        <Select 
                                        size="small"
                                        value={item.icon}
                                        style={{
                                            width: "100px",
                                        }}
                                        onChange={e => {
                                            that.handleChange(
                                                index,
                                                "icon",
                                                e
                                            );
                                        }}
                                        >
                                            {that.state.icons.map(v => (
                                                <Option
                                                    key={v.key}
                                                    value={v.value}
                                                >
                                                    {v.text}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row
                                    type="flex"
                                    align="middle"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Col span={6} style={{textAlign:'center'}}>颜色</Col>
                                    <Col span={18}>
                                        <ColorPicker
                                            type="normal"
                                            color={item.color}
                                            onChange={e => {
                                                that.handleChange(
                                                    index,
                                                    "color",
                                                    e.hex
                                                );
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Button
                            size="small"
                            icon="plus"
                            onClick={this.addRow}
                        />
                    </div>
                )}
            </div>
        );
    }
}
