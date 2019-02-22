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
    message,
    Popover
} from "antd";
import { connect } from "react-redux";

const Option = Select.Option;

let copyReference = window.Dashboard.util.copyReference;

const defaultCfg = {
    auto: {
        model: "auto",
        value: 5,
        values: [
            { name: "1-80", start: 200, startF: "<", endF: "<=", end: 8000 }
        ]
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
        let dataGroup = props.dataGroup || defaultCfg.auto;
        let _state = this.initState(dataGroup);

        this.state = copyReference(_state);
    }
    initState(dataGroup) {
        let { model, value, values, max, min, length, restGrop } = dataGroup;
        let state = {
            max: max || 20000,
            min: min || 0,
            model,
            length,
            restGrop: restGrop || { check: false, groupName: "其他" }
        };
        !model && (state.model = "auto");
        if (length <= 100) {
            state.model = "none";
        }
        state.value = value || 5;
        state.values = this.initValues(values, state.max, state.min);
        return state;
    }
    //初始化根据最大最小值进行分组
    initValues(values, max, min) {
        let _values = values;
        let len = max - min,
            arr = [],
            count = Math.ceil(len / 5);
        if (!_values) {
            for (let i = 1; i <= 5; i++) {
                arr.push({
                    name: min + count * (i - 1) + "-" + (min + count * i),
                    start: min + count * (i - 1),
                    startF: "<",
                    endF: "<=",
                    end: min + count * i
                });
            }
            _values = arr;
        }
        return _values;
    }
    /**
     * 复选组
     */
    onChangeRow(key, value) {}
    onChangeModel(model) {
        this.setState({
            model
        });
    }
    //勾选
    setCheck(e) {
        let restGrop = { ...this.state.restGrop };
        restGrop.check = e.target.checked;
        this.setState({ restGrop });
    }
    //输入
    setRest(e) {
        let restGrop = { ...this.state.restGrop };
        restGrop.groupName = e.target.value;
        this.setState({ restGrop });
    }
    //删除
    deleteData(ind) {
        var values = [...this.state.values];
        if (values.length === 1) {
            return false;
        }
        values.splice(ind, 1);
        this.setState({ values });
    }
    //分组个数
    onChangeInputNumber(value) {
        this.setState({
            value: ["0", "", undefined].includes(value) ? 5 : value
        });
    }
    //输入提示
    onBlurInputNumber(e) {
        if (!/^([1-9]|1\d|20)$/.test(e.target.value)) {
            message.error("请输入1 – 20范围内的整数");
        }
    }
    //点击添加分组
    addCondition() {
        let values = [...this.state.values],
            lastvalue = values[values.length - 1],
            start = lastvalue.end,
            end = start + 100;

        values.push({
            name: start + "-" + end,
            start: start,
            startF: "<",
            endF: "<=",
            end: end
        });
        this.setState({
            values
        });
    }
    //输入框更改
    /**
     *
     * @param {输入参数} ev
     * @param {下标} ind
     * @param {类型} type [name start startF endF end]
     */
    changeInput(ev, ind, type) {
        var values = copyReference(this.state.values),
            _values = values[ind],
            value = typeof ev === "object" ? ev.target.value : value;
        switch (type) {
            case "name":
                _values[type] = value;
            default:
                break;
        }
        this.setState({ values });
    }
    checkF(type, ind, value) {
        var values = copyReference(this.state.values),
            _values = values[ind];
        _values[type] = value;
        this.setState({ values });
    }
    onChangeNum(e, ind, type) {
        var values = copyReference(this.state.values),
            _values = values[ind];
        _values[type + "zs"] = e.target.value;
        this.setState({ values });
    }
    onBlurNum(e, ind, type) {
        var values = copyReference(this.state.values),
            value = e.target.value,
            len = values.length,
            startNum,
            endNum,
            _values = values[ind];
        type === "start"
            ? ((startNum = value), (endNum = _values["end"]))
            : ((startNum = _values["start"]), (endNum = value));
        if (/^-?((0|[1-9]\d*(\.?\d+)?)|(0\.\d+))$/.test(value)) {
            startNum = Number(startNum);
            endNum = Number(endNum);
            if (startNum > endNum) {
                message.error("起始值必须小于或等于终止值");
            } else if (
                startNum === endNum &&
                (_values.startF !== "<=" || _values.endF !== "<=")
            ) {
                message.error("分组无效，请重新设置");
            } else if (ind > 0) {
                if (type === "start" && startNum < values[ind - 1]["end"]) {
                    message.error("分组区间重合，请重新设置");
                } else if (
                    type === "end" &&
                    ind < len - 1 &&
                    endNum < values[ind + 1]["start"]
                ) {
                    message.error("分组区间重合，请重新设置");
                } else {
                    _values[type] = value;
                }
            } else {
                _values[type] = value;
            }
        } else {
            message.error("请输入数值");
        }
        _values[type + "zs"] = null;
        this.setState({ values });
    }
    setSvg(prop) {
        return (
            <Tooltip placement="topLeft" title="Prompt Text" trigger="click">
                <svg style={{ width: "100%", height: "100%" }}>
                    <path
                        fill="none"
                        d="M19,7 7,14 19,19"
                        stroke={prop.color}
                        strokeWidth="1"
                    />
                    {prop.type === "<=" ? (
                        <path
                            fill="none"
                            d="M6,17 19,23"
                            stroke={prop.color}
                            strokeWidth="1"
                        />
                    ) : null}
                    {prop.dd ? (
                        <path
                            fill={prop.color}
                            d="M27,22 21,22 24,26"
                            stroke="none"
                            strokeWidth="1"
                        />
                    ) : null}
                </svg>
            </Tooltip>
        );
    }
    render() {
        let { model, value, values, max, min, restGrop } = this.state;
        let _item = this.props.item;
        let item = config.find(e => e.model === model);
        return (
            <div
                style={{
                    width: "100%",
                    maxHeight: 650,
                    backgroundColor: "#fff",
                    position: "relative"
                }}
            >
                <div className="cell-data-pop">
                    <span>
                        数据分组[
                        {_item.config.editeName
                            ? _item.config.editeName
                            : _item.field.name}
                        ]
                    </span>
                </div>
                <Row type="flex" align="middle" style={{ marginBottom: 15 }}>
                    <Col span={5}>
                        <div style={style.left}>分组方式</div>
                    </Col>
                    <Col span={7}>
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
                {model !== "none" &&
                    (model === "auto" ? (
                        <Row
                            type="flex"
                            align="middle"
                            style={{ marginBottom: 15 }}
                        >
                            <Col span={5}>
                                <div style={style.left}>分组数量</div>
                            </Col>
                            <Col span={7}>
                                <InputNumber
                                    value={value}
                                    min={1}
                                    max={20}
                                    onBlur={e => this.onBlurInputNumber(e)}
                                    onChange={e => this.onChangeInputNumber(e)}
                                />
                            </Col>
                        </Row>
                    ) : (
                        <div style={{ position: "relative" }}>
                            <div
                                style={{
                                    margin: "0 36px",
                                    border: "1px solid #D9D9D9",
                                    borderRadius: "4px"
                                }}
                            >
                                <Row
                                    type="flex"
                                    align="middle"
                                    style={{
                                        marginBottom: 15,
                                        height: 40,
                                        background: "#F4F4F4",
                                        borderBottom: "1px solid #D9D9D9"
                                    }}
                                >
                                    <Col span={1} />
                                    <Col span={7}>
                                        <div style={style.left}>分组名称</div>
                                    </Col>
                                    <Col span={7}>
                                        <div style={style.left}>起始值</div>
                                    </Col>
                                    <Col span={1} />
                                    <Col span={7}>
                                        <div style={style.left}>终止值</div>
                                    </Col>
                                    <Col span={1} />
                                </Row>
                                <div
                                    style={{
                                        maxHeight: 320,
                                        overflowY: "scroll"
                                    }}
                                >
                                    {values.map((e, i) => {
                                        return (
                                            <Row
                                                type="flex"
                                                align="middle"
                                                style={{ marginBottom: 15 }}
                                                key={i + "_" + i}
                                            >
                                                <Col
                                                    span={1}
                                                    style={{
                                                        textAlign: "center"
                                                    }}
                                                >
                                                    {i + 1}
                                                </Col>
                                                <Col
                                                    span={7}
                                                    style={{ paddingRight: 15 }}
                                                >
                                                    <Input
                                                        value={e.name}
                                                        onChange={ev =>
                                                            this.changeInput(
                                                                ev,
                                                                i,
                                                                "name"
                                                            )
                                                        }
                                                    />
                                                </Col>
                                                <Col
                                                    span={7}
                                                    style={{ paddingRight: 10 }}
                                                >
                                                    <Row
                                                        type="flex"
                                                        align="middle"
                                                    >
                                                        <Col span={20}>
                                                            <Input
                                                                value={
                                                                    e[
                                                                        "start" +
                                                                            "zs"
                                                                    ] || e.start
                                                                }
                                                                onChange={e =>
                                                                    this.onChangeNum(
                                                                        e,
                                                                        i,
                                                                        "start"
                                                                    )
                                                                }
                                                                onBlur={e =>
                                                                    this.onBlurNum(
                                                                        e,
                                                                        i,
                                                                        "start"
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                        <Col
                                                            span={4}
                                                            style={{
                                                                height: 28,
                                                                cursor:
                                                                    "pointer"
                                                            }}
                                                        >
                                                            <Svgf
                                                                {...{
                                                                    type:
                                                                        e.startF,
                                                                    dd: "true",
                                                                    checkF: this.checkF.bind(
                                                                        this,
                                                                        "startF",
                                                                        i
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col span={1}>值</Col>
                                                <Col
                                                    span={7}
                                                    style={{ paddingRight: 10 }}
                                                >
                                                    <Row
                                                        type="flex"
                                                        align="middle"
                                                    >
                                                        <Col
                                                            span={4}
                                                            style={{
                                                                height: 28,
                                                                cursor:
                                                                    "pointer"
                                                            }}
                                                        >
                                                            <Svgf
                                                                {...{
                                                                    type:
                                                                        e.endF,
                                                                    dd: "true",
                                                                    checkF: this.checkF.bind(
                                                                        this,
                                                                        "endF",
                                                                        i
                                                                    )
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col span={20}>
                                                            <Input
                                                                value={
                                                                    e[
                                                                        "end" +
                                                                            "zs"
                                                                    ] || e.end
                                                                }
                                                                onChange={e =>
                                                                    this.onChangeNum(
                                                                        e,
                                                                        i,
                                                                        "end"
                                                                    )
                                                                }
                                                                onBlur={e =>
                                                                    this.onBlurNum(
                                                                        e,
                                                                        i,
                                                                        "end"
                                                                    )
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col span={1}>
                                                    <div
                                                        onClick={e =>
                                                            this.deleteData(i)
                                                        }
                                                        className="cell-data-group-row"
                                                    />
                                                </Col>
                                            </Row>
                                        );
                                    })}
                                </div>
                            </div>
                            <div
                                style={{
                                    border: 0,
                                    color: "#1d92ff",
                                    cursor: "pointer",
                                    paddingLeft: 0,
                                    fontWeight: "bold",
                                    display: "block",
                                    margin: "0 auto",
                                    width: 82,
                                    height: 40,
                                    lineHeight: "40px",
                                    userSelect: "none"
                                }}
                                onClick={this.addCondition.bind(this)}
                            >
                                <Icon type="plus-circle" />
                                <span style={{ marginLeft: 5 }}>新增条件</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 15
                                }}
                            >
                                <Checkbox
                                    checked={this.state.restGrop.check}
                                    onChange={e => this.setCheck(e)}
                                    style={{ marginLeft: 36 }}
                                />
                                <span>剩余值分段为</span>
                                <Input
                                    value={this.state.restGrop.groupName}
                                    onChange={e => this.setRest(e)}
                                    style={{ width: 100 }}
                                />
                            </div>
                            <div style={{ paddingLeft: 36 }}>
                                注：该字段最小值{min}，最大值{max}
                            </div>
                        </div>
                    ))}
                <div
                    style={{
                        height: 47,
                        paddingLeft: 510
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
                            this.props.handleOk({
                                model,
                                value,
                                values,
                                max,
                                min,
                                restGrop
                            })
                        }
                    >
                        确定
                    </Button>
                </div>
            </div>
        );
    }
}
class Svgf extends Component {
    constructor(props) {
        super(props);
        this.state = {
            color: props.color || "#666",
            dd: props.dd,
            type: props.type,
            visible: false
        };
    }
    onVisibleChange(e) {
        this.setState({
            color: e ? "#1890FF" : this.props.color,
            visible: e
        });
    }
    onVisible(value) {
        this.setState({
            visible: !this.state.visible,
            color: this.state.visible ? this.props.color : "#1890FF"
        });
        this.props.checkF(value);
    }
    setSvg(prop) {
        prop = prop || this.state;
        return (
            <svg style={{ width: 28, height: 28 }}>
                <path
                    fill="none"
                    d={
                        prop.type === "<="
                            ? "M19,7 7,14 19,19"
                            : "M19,9 7,16 19,21"
                    }
                    stroke="currentColor"
                    strokeWidth="1"
                />
                {prop.type === "<=" ? (
                    <path
                        fill="none"
                        d="M6,17 19,23"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                ) : null}
                {prop.dd ? (
                    <path
                        fill="currentColor"
                        d="M27,22 21,22 24,26"
                        stroke="none"
                        strokeWidth="1"
                    />
                ) : null}
            </svg>
        );
    }
    componentWillReceiveProps(necxP) {
        this.setState({
            type: necxP.type
        });
    }
    render() {
        let prop = this.state;
        return (
            <div style={{ width: "100%", height: "100%", color: prop.color }}>
                <Popover
                    placement="topLeft"
                    onVisibleChange={e => this.onVisibleChange(e)}
                    visible={this.state.visible}
                    content={
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}
                                onClick={e => this.onVisible("<")}
                                className="cell-data-group-svgf"
                            >
                                {this.setSvg({
                                    type: "<"
                                })}
                                <span>(小于)</span>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer"
                                }}
                                onClick={e => this.onVisible("<=")}
                                className="cell-data-group-svgf"
                            >
                                {this.setSvg({
                                    type: "<="
                                })}
                                <span>(小于等于)</span>
                            </div>
                        </div>
                    }
                    trigger="click"
                >
                    {this.setSvg()}
                </Popover>
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
const config = [
    {
        name: "无",
        model: "none"
    },
    {
        name: "自动",
        model: "auto",
        value: 5
    },
    {
        name: "自定义",
        model: "custom"
    }
];
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DataPop);
