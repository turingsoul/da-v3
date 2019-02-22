/**
 * 维度指标字段
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import util from "corejs/components/table/js/util";
import {
    Icon,
    Row,
    Col,
    Select,
    InputNumber,
    Input,
    Checkbox,
    Button,
    message
} from "antd";
import { connect } from "react-redux";

const Option = Select.Option;

let copyReference = window.Dashboard.util.copyReference;
const defaultCfg = {
    auto: { example: "2000", model: "auto" },
    number: {
        ltnumlen: 2,
        numwieghe: "无",
        unit: "",
        split: "true",
        example: "2,000.00",
        model: "number"
    },
    percent: {
        ltnumlen: 2,
        example: "100.00%",
        model: "percent"
    }
};
const style = {
    left: {
        textAlign: "left",
        paddingRight: 10,
        paddingLeft: 40
    }
};

class DataPop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataHandle: props.dataHandle || defaultCfg.auto
        };
    }
    /**
     * 创建多列操作
     */
    creatMap(e) {
        let { dataHandle } = this.state;
        return e.map((item, i) => {
            let Item = item.type;
            return (
                <Row
                    type="flex"
                    align="middle"
                    key={i}
                    style={{ marginTop: 20 }}
                >
                    <Col span={6}>
                        <div style={style.left}>{item.name}</div>
                    </Col>
                    <Col span={16}>
                        {item.option ? (
                            <Item
                                style={{ width: "100%" }}
                                value={dataHandle[item.model]}
                                onChange={e => this.onChangeRow(item.model, e)}
                            >
                                {item.option.map((ee, ii) => {
                                    return (
                                        <Option key={ii} value={ee}>
                                            {ee}
                                        </Option>
                                    );
                                })}
                            </Item>
                        ) : (
                            <Item
                                style={{ width: "100%" }}
                                value={dataHandle[item.model]}
                                max={6}
                                min={0}
                                onChange={e => this.onChangeRow(item.model, e)}
                            />
                        )}
                    </Col>
                </Row>
            );
        });
    }
    /**
     * 复选组
     */
    creatRadio() {
        return (
            <div style={{ marginTop: 15, paddingLeft: 115 }}>
                <Checkbox
                    checked={this.state.dataHandle.split === "true"}
                    onChange={e => this.onChangeRow("split", e)}
                >
                    千分符
                </Checkbox>
            </div>
        );
    }
    onChangeRow(key, value) {
        let dataHandle = copyReference(this.state.dataHandle);
        if (key === "split") {
            dataHandle[key] = dataHandle[key] === "true" ? "false" : "true";
        } else {
            dataHandle[key] = key === "unit" ? value.target.value : value;
        }
        if (key === "ltnumlen" && !/^[0-6]{1}$/.test(value + "")) {
            message.warning("请输入0-6的数字");
            dataHandle[key] = "2";
        }
        this.setState({
            dataHandle
        });
    }
    onChangeModel(value) {
        this.setState({
            dataHandle: defaultCfg[value]
        });
    }
    render() {
        let { dataHandle } = this.state;
        let _item = this.props.item;
        let type = dataHandle.model;
        let item = config.find(e => e.model === type);
        return (
            <div
                style={{
                    width: "100%",
                    height: 388,
                    backgroundColor: "#fff",
                    position: "relative"
                }}
            >
                <div className="cell-data-pop">
                    <span>
                        数据格式[
                        {_item.config.editeName
                            ? _item.config.editeName
                            : _item.field.name}
                        ]
                    </span>
                </div>
                <Row type="flex" align="middle">
                    <Col span={6}>
                        <div style={style.left}>格式</div>
                    </Col>
                    <Col span={16}>
                        <Select
                            defaultValue={item.model}
                            style={{ width: "100%" }}
                            onChange={e => this.onChangeModel(e)}
                        >
                            {config.map(e => (
                                <Option key={e.model} value={e.model}>
                                    {e.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                {item.row ? this.creatMap(item.row) : null}
                {item.split ? this.creatRadio() : null}
                <div style={{ marginTop: 15, paddingLeft: 115 }}>
                    <span>
                        示例：
                        {type === "auto"
                            ? item.reExample(
                                  dataHandle,
                                  this.props.dafaultFormat
                              )
                            : item.reExample(dataHandle)}
                    </span>
                </div>
                <div
                    style={{
                        bottom: 14,
                        right: 20,
                        display: "flex",
                        position: "absolute"
                    }}
                >
                    <Button
                        style={{ width: 80, height: 32, marginRight: 12 }}
                        onClick={e => this.props.handleCancel()}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        style={{ width: 80, height: 32 }}
                        onClick={e =>
                            this.props.handleOk(this.state.dataHandle)
                        }
                    >
                        确定
                    </Button>
                </div>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {};
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataPop);
//初始化配置
var config = [
    {
        name: "自动",
        model: "auto",
        example: "2000",
        reExample(dataHandle, dafaultFormat) {
            let formatMask = dafaultFormat.formatMask;
            if (formatMask && formatMask.indexOf(";") !== -1) {
                formatMask = formatMask.split(";")[0];
            }
            let test = util.formatNumber(
                Number(dataHandle.example),
                formatMask
            );
            return test;
        }
    },
    {
        name: "数字",
        model: "number",
        row: [
            {
                name: "小数位数",
                model: "ltnumlen",
                value: 2,
                type: InputNumber
            },
            {
                name: "数量级",
                model: "numwieghe",
                value: "无",
                option: ["无", "千", "万", "百万", "亿"],
                type: Select
            },
            {
                name: "单位",
                model: "unit",
                value: "",
                type: Input
            }
        ],
        split: "true",
        example: "1,000,000.00",
        reExample(dataHandle) {
            const { ltnumlen, numwieghe, unit, split } = dataHandle;
            let num = "1000000";
            let numToStr = {
                无: num,
                千: num / 1000,
                万: num / 10000,
                百万: num / 10000 / 100,
                亿: num / 10000 / 10000
            };
            let xiao = new Array(parseInt(ltnumlen)).fill(0);
            let wieghenum =
                split === "true"
                    ? (numToStr[numwieghe] + "").replace(
                          /\B(?=(?:\d{3})+(?!\d))/g,
                          ","
                      )
                    : numToStr[numwieghe] + "";
            let numxiao = wieghenum.split(".")[1]
                ? wieghenum.split(".")[1].split("")
                : [];
            xiao = Object.assign(xiao, numxiao).slice(0, ltnumlen);
            return (
                wieghenum.split(".")[0] +
                (xiao.length ? "." + xiao.join("") : "") +
                (numwieghe === "无" ? "" : numwieghe) +
                unit
            );
        }
    },
    {
        name: "百分数",
        model: "percent",
        row: [
            { name: "小数位数", model: "ltnumlen", value: 2, type: InputNumber }
        ],
        example: "100.00%",
        reExample(dataHandle) {
            let xiao = new Array(parseInt(dataHandle.ltnumlen)).fill(0);
            return "100" + (xiao.length ? "." + xiao.join("") : "") + "%";
        }
    }
];
