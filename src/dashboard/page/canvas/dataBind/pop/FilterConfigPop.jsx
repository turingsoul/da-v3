/**
 * 维度指标字段
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import {
    Radio,
    Tabs,
    Select,
    Input,
    InputNumber,
    Checkbox,
    Row,
    Col,
    Icon,
    message,
    DatePicker,
    Button,
    Popover
} from "antd";
import { connect } from "react-redux";
import _ from "underscore";
import Util from "dashboard/modules/common/Util";
import databindM from "dashboard/modules/business/databind";
import moment from "moment";
import $ from "jquery";
import DivLoading from "dashboard/components/common/DivLoading";

const util = new Util();
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const OPERATOR = {
    //等于
    EQUAL: "EQUAL",
    //不等于
    NOT_EQUAL: "NOT_EQUAL",
    //开头是
    BEGINS_WITH: "BEGINS_WITH",
    //开头不是
    BEGIN_NOT: "BEGIN_NOT",
    //结尾是
    ENDS_WITH: "ENDS_WITH",
    //--结尾不是
    END_NOT: "END_NOT",
    //包含
    LIKE: "LIKE",
    //不包含
    DOES_NOT_LIKE: "DOES_NOT_LIKE",
    //为空
    IS_NULL: "IS_NULL",
    //不为空
    IS_NOT_NULL: "IS_NOT_NULL",
    //大于
    GREATER_THAN: "GREATER_THAN",
    //小于
    LESS_THAN: "LESS_THAN",
    //大于等于
    GREATOR_OR_EQUAL: "GREATOR_OR_EQUAL",
    //小于等于
    LESS_OR_EQUAL: "LESS_OR_EQUAL",
    //区间
    RANGE: "RANGE"
};
const operatorConfig = {
    string: [
        {
            title: "等于",
            value: OPERATOR.EQUAL
        },
        {
            title: "不等于",
            value: OPERATOR.NOT_EQUAL
        },
        {
            title: "开头是",
            value: OPERATOR.BEGINS_WITH
        },
        {
            title: "开头不是",
            value: OPERATOR.BEGIN_NOT
        },
        {
            title: "结尾是",
            value: OPERATOR.ENDS_WITH
        },
        {
            title: "结尾不是",
            value: OPERATOR.END_NOT
        },
        {
            title: "包含",
            value: OPERATOR.LIKE
        },
        {
            title: "不包含",
            value: OPERATOR.DOES_NOT_LIKE
        },
        {
            title: "为空",
            value: OPERATOR.IS_NULL,
            noNeedInput: true
        },
        {
            title: "不为空",
            value: OPERATOR.IS_NOT_NULL,
            noNeedInput: true
        }
    ],
    number: [
        {
            title: "等于",
            value: OPERATOR.EQUAL
        },
        {
            title: "不等于",
            value: OPERATOR.NOT_EQUAL
        },
        {
            title: "大于",
            value: OPERATOR.GREATER_THAN
        },
        {
            title: "小于",
            value: OPERATOR.LESS_THAN
        },
        {
            title: "大于等于",
            value: OPERATOR.GREATOR_OR_EQUAL
        },
        {
            title: "小于等于",
            value: OPERATOR.LESS_OR_EQUAL
        },
        {
            title: "区间",
            value: OPERATOR.RANGE
        },
        {
            title: "为空",
            value: OPERATOR.IS_NULL,
            noNeedInput: true
        },
        {
            title: "不为空",
            value: OPERATOR.IS_NOT_NULL,
            noNeedInput: true
        }
    ],
    date: [
        {
            title: "等于",
            value: OPERATOR.EQUAL
        },
        {
            title: "不等于",
            value: OPERATOR.NOT_EQUAL
        },
        {
            title: "区间",
            value: OPERATOR.RANGE
        },
        {
            title: "开始于",
            value: OPERATOR.GREATOR_OR_EQUAL
        },
        {
            title: "结束于",
            value: OPERATOR.LESS_OR_EQUAL
        },
        {
            title: "为空",
            value: OPERATOR.IS_NULL,
            noNeedInput: true
        },
        {
            title: "不为空",
            value: OPERATOR.IS_NOT_NULL,
            noNeedInput: true
        }
    ]
};
const DEFAULT_PROPS = {
    options: {}
};

const DEFAULT_STATE = {
    //字段类型
    fieldType: "",
    //字段的所有值集合
    values: [],
    //查询字段值状态 0-查询中 1-成功 2-失败
    queryValuesState: "",
    //筛选类型 0-基本筛选 1-条件筛选
    filterType: 0,
    //基本筛选- 搜索关键字
    keyword: "",
    //基本筛选- 已选择值列表
    checked: [],
    //基本筛选- 排除
    exclude: false,
    //条件筛选- 条件
    condition: {
        relation: "AND",
        children: [{}]
    },
    //全局参数列表
    params: [],
    //可见的参数选择pop行idx
    paramsPopVisibleIdx: null,
    //加载条数，每次滚动加载20
    loadNum: 20
};

const Range = props => {
    let { fieldType, value, onChange } = props;
    if (!util._.isArray(value)) {
        value = [];
    }
    return (
        <Row>
            <Col span="11">
                {fieldType === "date" ? (
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={value[0] ? moment(value[0]) : null}
                        style={{
                            width: "100%"
                        }}
                        onChange={(time, timeString) => {
                            value[0] = timeString;
                            onChange(value);
                        }}
                    />
                ) : (
                    <InputNumber
                        style={{
                            width: "100%"
                        }}
                        value={value[0]}
                        onChange={val => {
                            value[0] = val;
                            onChange(value);
                        }}
                    />
                )}
            </Col>
            <Col
                span="2"
                style={{
                    textAlign: "center"
                }}
            >
                ~
            </Col>
            <Col span="11">
                {fieldType === "date" ? (
                    <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        value={value[1] ? moment(value[1]) : null}
                        style={{
                            width: "100%"
                        }}
                        onChange={(time, timeString) => {
                            value[1] = timeString;
                            onChange(value);
                        }}
                    />
                ) : (
                    <InputNumber
                        style={{
                            width: "100%"
                        }}
                        value={value[1]}
                        onChange={val => {
                            value[1] = val;
                            onChange(value);
                        }}
                    />
                )}
            </Col>
        </Row>
    );
};

class FilterConfigPop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
        //系统参数
        let params = databindM.getGlobalParams();
        //默认state
        let defaultState = $.extend(true, {}, DEFAULT_STATE);
        defaultState.params = params;
        this.state = defaultState;
    }

    componentDidMount() {
        let { dataset, modelId } = this.props;
        let { field, config } = this.props.options;
        let fieldType = util.getRelFieldType(field.type);

        //深拷贝
        config = util.deepClone(config);

        this.setState({
            loading: true,
            queryValuesState: 0
        });
        databindM.getFieldValues(field, dataset, modelId).then(
            rep => {
                if (!rep || !rep.resultset) {
                    this.setState({
                        queryValuesState: 2
                    });
                    return;
                }
                let values = [];
                rep.resultset.forEach(v => {
                    let value = v[0];
                    if (value === null) {
                        return;
                    }
                    if (fieldType === "number" || typeof value === "number") {
                        value = String(value);
                    }
                    if (_.isArray(value)) {
                        value = value.join(",");
                    }
                    if (value !== "") {
                        values.push(value);
                    }
                });
                //如果是数字类型，需要将values所有值转换成字符串类型[Checkbox Group不支持 number[],不支持null ]
                if (fieldType === "number" && config.checked) {
                    config.checked = config.checked.map(v => String(v));
                }
                this.setState({
                    queryValuesState: 1,
                    values,
                    loading: false
                });
            },
            () => {
                this.setState({
                    queryValuesState: 2,
                    loading: false
                });
            }
        );

        if (fieldType === "number" && config.checked) {
            config.checked = config.checked.map(v => String(v));
        }

        if (this.props.onChangeFilterType) {
            this.props.onChangeFilterType(config.filterType);
        }

        this.setState({
            fieldType,
            ...config
        });
    }

    /**
     * 用户配置校验
     * @param {Object} config
     */
    valid(config) {
        if (config.filterType === 0 && config.checked.length === 0) {
            message.error("请选择需要筛选的成员。");
            return false;
        }
        if (config.filterType === 1) {
            let { fieldType } = this.state;
            let condition = config.condition;
            let conds = condition.children;
            let operators = operatorConfig[fieldType] || [];
            let noNeedInputValues = [];

            operators.map(item => {
                if (item.noNeedInput === true) {
                    noNeedInputValues.push(item.value);
                }
            });

            for (let i = 0, len = conds.length; i < len; i++) {
                let { operator, value } = conds[i];
                if (!operator) {
                    message.error("请填写筛选条件。");
                    return false;
                }
                if (noNeedInputValues.indexOf(operator) === -1) {
                    if (_.isArray(value)) {
                        if ( _.isUndefined(value[0]) || _.isUndefined(value[1]) || value[0] === "" || value[1] === "" ) {
                            message.error("请填写筛选条件。");
                            return false;
                        }

                        if (fieldType === "number" && value[1] <= value[0]) {
                            message.error("最大值必须大于最小值。");
                            return false;
                        }

                        if ( fieldType === "date" && moment(value[1]).valueOf() <= moment(value[0]).valueOf() ) {
                            message.error("结束时间必须大于开始时间。");
                            return false;
                        }
                    } else if ( value === null || _.isUndefined(value) || value === "" ) {
                        message.error("请填写筛选条件。");
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * 提取当前配置对象
     */
    getConfig() {
        let config = {};
        let { filterType } = this.state;
        let result;

        ["filterType", "checked", "exclude", "condition"].forEach(item => {
            //如果字段类型是数字，需要将选中值再转换成数字类型
            if (this.state.fieldType === "number" && item === "checked") {
                config[item] = this.state[item].map(v => Number(v));
            } else {
                config[item] = this.state[item];
            }
        });

        result = this.valid(config);

        return result === false ? false : config;
    }

    /**
     * 向arr中追加value
     * @param {Array} arr 集合
     * @param {Any} value 值
     */
    appendItem(arr, value) {
        if (_.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                this.appendItem(arr, value[i]);
            }
            return;
        }

        let idx = arr.indexOf(value);

        if (idx === -1) {
            arr.push(value);
        }
    }

    /**
     * 移除arr中为value的选项
     * @param {Array} arr 集合
     * @param {Any} value 值
     */
    removeItem(arr, value) {
        if (_.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                this.removeItem(arr, value[i]);
            }
            return;
        }

        let idx = arr.indexOf(value);
        
        if (idx > -1) {
            arr.splice(idx, 1);
        }
    }

    /**
     * 基本筛选-全选
     * @param {Object} e event
     * @param {Array} resultValues 当前结果集
     */
    onCheckAllChange(e, resultValues) {
        let isChecked = e.target.checked;
        let { checked } = this.state;
        let len = resultValues.length;

        checked = [...checked];

        //如果是全选，将当前结果集全部移入已选中列表中，如果是取消全选，将可见选项全部从已选中列表中移除
        if (isChecked) {
            this.appendItem(checked, resultValues);
        } else {
            this.removeItem(checked, resultValues);
        }

        this.setState({ checked });
    }

    /**
     * 基本筛选-选中选项发生变化
     * @param {Array} checkedList 选中项
     * @param {Array} resultValues 当前结果集
     */
    onCheckedChange(checkedList, resultValues) {
        let { checked } = this.state;

        resultValues.forEach(item => {
            if (checkedList.indexOf(item) > -1) {
                this.appendItem(checked, item);
            } else {
                this.removeItem(checked, item);
            }
        });

        checked = [...checked];

        this.setState({ checked });
    }

    /**
     * 筛选条件 条件之间关系变化
     * @param {String} value 变化后关系
     */
    onChangeCondRelation(value) {
        let cond = this.state.condition;
        cond.relation = value;
        this.setState({ condition: cond });
    }

    /**
     * 条件筛选-添加条件
     */
    addCondition(e) {
        this.setState({
            condition: {
                ...this.state.condition,
                children: [...this.state.condition.children, {}]
            }
        });
    }

    /**
     * 修改单个条件
     * @param {Number} idx index
     * @param {String} key key
     * @param {Any} value value
     */
    editCond(idx, key, value) {
        let conds = [...this.state.condition.children];
        let item = conds[idx];
        let cond;
        item.value = null;
        cond = {
            ...item,
            [key]: value
        };
        conds.splice(idx, 1, cond);
        this.setState({
            condition: {
                ...this.state.condition,
                children: conds
            }
        });
    }

    /**
     * 插入参数
     * @param {Number} idx
     */
    insertParam(idx, param) {
        this.editCond(idx, "value", "${" + param.name + "}");
        this.setState({
            paramsPopVisibleIdx: null
        });
    }

    /**
     * 条件筛选-删除条件
     * @param {Number} idx 要删除条件index
     */
    delCondition(idx) {
        let condition = this.state.condition;
        let conds;
        if (condition.children.length <= 1) {
            message.error("至少包含一个条件");
            return;
        }
        conds = [...condition.children];
        conds.splice(idx, 1);
        this.setState({
            condition: {
                ...condition,
                children: conds
            }
        });
    }

    /**
     * 滚动到底部加载更多
     */
    loadMore() {
        this.setState({
            loadNum: this.state.loadNum + 20
        });
    }

    /**
     * 对当前结果集中选中的选项状态 all-全部 none-全部没有 indeterminate-部分
     * @param {Array} resultValues 当前结果集
     * @param {Array} checked 选中值
     */
    visibleCheckedState(resultValues, checked) {
        let existCount = 0;
        let notExistCount = 0;
        let len = resultValues.length;
        if (checked.length === 0) {
            return "none";
        }
        for (let i = 0; i < len; i++) {
            let value = resultValues[i];
            let idx = checked.indexOf(value);

            //如果结果集中元素存在选中值existCount+1,不存在则notExistCount+1。如果提前能知道状态直接返回。
            if (idx > -1) {
                existCount++;
                if (notExistCount > 0) {
                    return "indeterminate";
                }
            } else {
                notExistCount++;
                if (existCount > 0) {
                    return "indeterminate";
                }
            }
        }

        if (existCount > 0 && notExistCount === 0) {
            return "all";
        } else if (existCount > 0 && notExistCount > 0) {
            return "indeterminate";
        } else {
            return "none";
        }
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { fieldType, values, keyword, filterType, checked, exclude, condition } = this.state;
        let { queryValuesState, paramsPopVisibleIdx, params, loadNum, loading } = this.state;
        let operators = operatorConfig[fieldType] || [];
        let noNeedInputValues = [];
        //用户可见结果集
        let visibleValues;
        //当前关键字下结果集
        let resultValues = values.filter(item => {
            let reg = new RegExp(keyword, "i");
            return reg.test(item);
        });
        let InputCom = fieldType === "number" ? InputNumber : Input;
        let allCheckedStatu;

        operators.map(item => {
            if (item.noNeedInput === true) {
                noNeedInputValues.push(item.value);
            }
        });

        allCheckedStatu = this.visibleCheckedState(resultValues, checked);

        visibleValues = resultValues.slice(0, loadNum);

        return (
            <div style={{ padding: "22px 18px 0" }}>
                <Tabs activeKey={filterType === 0 ? "0" : "1"}>
                    <TabPane
                        className="databind-filter-config__base"
                        tab={
                            <Radio
                                checked={filterType === 0}
                                onChange={e => {
                                    this.setState({
                                        filterType: 0,
                                        paramsPopVisibleIdx: null
                                    });
                                    if (this.props.onChangeFilterType) {
                                        this.props.onChangeFilterType(0);
                                    }
                                }}
                            >
                                基本筛选
                            </Radio>
                        }
                        key="0"
                    >
                        <Search
                            placeholder="输入搜索关键字"
                            value={keyword}
                            onChange={e => {
                                this.setState({
                                    keyword: e.target.value,
                                    loadNum: 20
                                });
                            }}
                            onSearch={value => {
                                this.setState({
                                    keyword: value
                                });
                            }}
                            style={{ marginBottom: "5px" }}
                        />
                        <div
                            style={{
                                border: "1px #d8d8d8 solid",
                                borderRadius: "5px",
                                marginBottom: "5px",
                                position: "relative"
                            }}
                        >
                            <Checkbox
                                onChange={e => {
                                    this.onCheckAllChange(e, resultValues);
                                }}
                                indeterminate={
                                    allCheckedStatu === "indeterminate"
                                }
                                checked={allCheckedStatu === "all"}
                                style={{
                                    padding: "5px 15px",
                                    display: "block"
                                }}
                            >
                                全选
                            </Checkbox>
                            <div
                                onScroll={e => {
                                    let { scrollHeight, scrollTop, clientHeight } = e.target;
                                    //滚动到底部,加载更多
                                    if (
                                        scrollTop + clientHeight >=
                                        scrollHeight
                                    ) {
                                        this.loadMore();
                                    }
                                }}
                                className="field-value-list"
                            >
                                {queryValuesState === 0 ? (
                                    <span>字段值加载中...</span>
                                ) : queryValuesState === 2 ? (
                                    <span>字段值查询失败。</span>
                                ) : keyword !== "" && visibleValues.length === 0 ? (
                                    <span>没有符合的搜索结果。</span>
                                ) : keyword === "" && visibleValues.length === 0 ? (
                                    <span>结果为空。</span>
                                ): (
                                    <CheckboxGroup
                                        options={visibleValues}
                                        value={checked}
                                        onChange={checkedList => {
                                            this.onCheckedChange(
                                                checkedList,
                                                resultValues
                                            );
                                        }}
                                        style={{ display: "block" }}
                                    />
                                )}
                            </div>
                            <DivLoading show={loading} />
                        </div>
                        <Checkbox
                            onChange={e => {
                                this.setState({
                                    exclude: !exclude
                                });
                            }}
                            checked={exclude}
                        >
                            排除
                        </Checkbox>
                        <span style={{ marginLdft: "20px" }}>
                            共{values.length}个成员，已选择{checked.length}个成员
                        </span>
                        <div
                            className="warning"
                            style={{
                                visibility: checked && checked.length > 200 ? "visible" : "hidden"
                            }}
                        >
                            <Icon
                                type="exclamation"
                                style={{
                                    color: "#fff",
                                    backgroundColor: "#faad14",
                                    borderRadius: "50%",
                                    margin: "0 5px 0 8px",
                                    fontWeight: "bold",
                                    padding: "2px"
                                }}
                            />
                            当前选中成员数量较大，建议使用条件筛选。
                        </div>
                    </TabPane>
                    <TabPane
                        className="databind-filter-config__condition"
                        tab={
                            <Radio
                                checked={filterType === 1}
                                onChange={e => {
                                    this.setState({
                                        filterType: 1
                                    });
                                    if (this.props.onChangeFilterType) {
                                        this.props.onChangeFilterType(1);
                                    }
                                }}
                            >
                                条件筛选
                            </Radio>
                        }
                        key="1"
                    >
                        <Select
                            value={condition.relation}
                            onChange={this.onChangeCondRelation.bind(this)}
                            defaultValue={"AND"}
                            style={{
                                display: "block",
                                width: "240px",
                                marginBottom: "18px"
                            }}
                        >
                            <Option value="AND">满足所有条件</Option>
                            <Option value="OR">满足任一条件</Option>
                        </Select>
                        <div style={{ overflow: "auto", maxHeight: "301px" }}>
                            {condition.children.map((item, idx) => {
                                let isAllowedParam = !(
                                    noNeedInputValues.indexOf(item.operator) >
                                        -1 || item.operator === OPERATOR.RANGE
                                );
                                return (
                                    <Row
                                        key={idx}
                                        style={{
                                            marginBottom: "10px"
                                        }}
                                    >
                                        <Col span="7">
                                            <Select
                                                value={item.operator}
                                                onChange={value => {
                                                    this.editCond(idx,"operator",value);
                                                }}
                                                style={{ width: "90%" }}
                                            >
                                                {operators.map(operator => (
                                                    <Option
                                                        key={operator.value}
                                                        value={operator.value}
                                                    >
                                                        {operator.title}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span="11">
                                            {//区间用Range，日期的开始于结束于用DatePicker，其他的如果是字符串用Input，数字用InputNumber
                                            item.operator === OPERATOR.RANGE ? (
                                                <Range
                                                    fieldType={fieldType}
                                                    value={item.value}
                                                    onChange={value => {
                                                        this.editCond(idx,"value",value);
                                                    }}
                                                />
                                            ) : fieldType === "date" &&
                                            ["GREATOR_OR_EQUAL","LESS_OR_EQUAL"].indexOf(item.operator) > -1 ? (
                                                <DatePicker
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm:ss"
                                                    style={{
                                                        width:"100%"
                                                    }}
                                                    value={item.value? moment(item.value) : null}
                                                    onChange={(time,timeString) => {
                                                        this.editCond(idx,"value",timeString);
                                                    }}
                                                />
                                            ) : (
                                                <InputCom
                                                    value={item.value}
                                                    style={{
                                                        width: "100%"
                                                    }}
                                                    disabled={
                                                        noNeedInputValues.indexOf(
                                                            item.operator
                                                        ) > -1
                                                    }
                                                    onChange={e => {
                                                        if(!e){
                                                            return;
                                                        }
                                                        this.editCond(idx,"value",e.target ? e.target.value : e);
                                                    }}
                                                />
                                            )}
                                        </Col>
                                        <Col
                                            span="4"
                                            style={{
                                                padding: "0 3px"
                                            }}
                                        >
                                            <Popover
                                                placement="rightTop"
                                                title=""
                                                visible={
                                                    paramsPopVisibleIdx ===
                                                        idx && isAllowedParam
                                                }
                                                className="databind-filter-params-pop"
                                                content={
                                                    <ul className="databind-fliter-params__list">
                                                        {params.map(param => (
                                                            <li
                                                                className="text-ellipsis"
                                                                title={
                                                                    param.name
                                                                }
                                                                key={param.id}
                                                                onClick={() => {
                                                                    this.insertParam(
                                                                        idx,
                                                                        param
                                                                    );
                                                                }}
                                                            >
                                                                {param.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                }
                                            >
                                                <div
                                                    className={
                                                        "flex-align-center databind-filter-insertParam " +
                                                        (isAllowedParam
                                                            ? ""
                                                            : "not-allowed")
                                                    }
                                                    onClick={() => {
                                                        if (!isAllowedParam) {
                                                            return;
                                                        }
                                                        if (!params.length) {
                                                            message.error(
                                                                "没有参数，请检查配置！"
                                                            );
                                                            return;
                                                        }
                                                        this.setState({
                                                            paramsPopVisibleIdx:
                                                                paramsPopVisibleIdx ===
                                                                idx
                                                                    ? null
                                                                    : idx
                                                        });
                                                    }}
                                                >
                                                    插入参数
                                                    <Icon
                                                        type="down"
                                                        style={{
                                                            marginLeft: "4px",
                                                            fontSize: "12px"
                                                        }}
                                                    />
                                                </div>
                                            </Popover>
                                        </Col>
                                        <Col span="2">
                                            {condition.children.length !==
                                                1 && (
                                                <i
                                                    className="ds-icon ds-icon-delete"
                                                    title="删除"
                                                    style={{
                                                        marginTop: "7px",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={e => {
                                                        this.delCondition(idx);
                                                    }}
                                                />
                                            )}
                                        </Col>
                                    </Row>
                                );
                            })}
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
                                lineHeight: "40px"
                            }}
                            onClick={this.addCondition.bind(this)}
                        >
                            <Icon type="plus-circle" />
                            <span style={{ marginLeft: 5 }}>新增条件</span>
                        </div>
                    </TabPane>
                </Tabs>
                <div
                    className="ant-modal-footer"
                    style={{
                        border: 0,
                        marginTop: "10px"
                    }}
                >
                    <div>
                        <Button
                            onClick={e => {
                                this.props.closePop();
                            }}
                        >
                            取消
                        </Button>
                        <Button
                            onClick={e => {
                                let config = this.getConfig();
                                if (config !== false) {
                                    this.props.onSave(config);
                                }
                            }}
                            type="primary"
                        >
                            确定
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        dataset: state.databind.dataset,
        modelId: state.databind.modelId
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FilterConfigPop);
