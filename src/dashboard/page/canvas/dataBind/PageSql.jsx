/**
 * 自定义SQL绑定
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Icon, Row, Col, Select, message, Popover, Menu } from "antd";
import ComponentList from "./ComponentList";
import Limit from "./Limit";
import Stage from "./Stage";
import axios from "axios";
import CodeMirror from "../../panels/panelComponents/codeMirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import databindM from "dashboard/modules/business/databind";
const Option = Select.Option;
const DEFAULT_PROPS = {};

class PageSql extends Component {
    constructor(props) {
        super(props);
        const { sqlCfg } = props;
        let params = databindM.getGlobalParams();
        this.state = {
            datasetFold: false,
            codeValue: sqlCfg.query,
            sqlOptions: [],
            select: sqlCfg.jndi,
            params,
            isVis: false
        };
    }
    onChange(codeValue, val) {
        this.setState({
            [val]: codeValue
        });
    }
    componentWillMount() {
        if (!this.state.sqlOptions.length) {
            this.fetchData();
        }
    }
    /**
     * 初始化发送请求
     */
    fetchData() {
        axios({
            method: "get",
            url: "/xdatainsight/plugin/xdf/api/connection/list",
            responseType: "json"
        }).then(response => {
            if (response.status == 200) {
                this.handleData(response.data.databaseConnections);
            }
        });
    }
    /**
     * 获取最后配置
     */
    getSqlCfg() {
        var sqlCfg = {
            query: this.state.codeValue,
            jndi: this.state.select
        };
        var { params } = this.state;
        let param = {},
            rawParamsIds = [];
        if (params.length) {
            params.forEach(el => {
                if (sqlCfg.query.indexOf("${" + el.name + "}") > -1) {
                    param[`param${el.name}`] = el.getValue();
                    param[`type${el.name}`] = el.type || "String";

                    //做记录用
                    rawParamsIds.push(el.id);
                }
            });
        }
        Object.assign(sqlCfg, { param, rawParamsIds });
        return sqlCfg;
    }
    /**
     * 插入参数
     * param当前选中参数
     */
    insertParam(param) {
        let codeMirror = this.code.codeMirror;
        let str;
        str = "${" + param.name + "}";
        //插入内容
        codeMirror.replaceSelection(str);
        //获取焦点
        codeMirror.focus();
    }
    /**
     * 处理接口返回数据
     * @param {Object} data 数据
     */
    handleData(data) {
        let options = data.map((el, i) => el.name);
        this.setState({
            select: this.state.select || options[0] || '',
            sqlOptions: options
        });
    }
    sqlEdit() {
        if (!this.state.select) {
            message.error("没有选择的数据源，请选择！");
        } else {
            window.parent.postMessage(
                // `{"sqlEdit": "${this.state.select}"}`,
                `{"type": "SQL_EDIT","data": "${this.state.select}"}`,
                "*"
            );
        }
    }
    sqlAdd() {
        window.parent.postMessage(
            `{"type": "SQL_ADD","data": "${this.state.select}"}`,
            "*"
        );
    }
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { switchMode, editSql } = props;
        let { params, isVis } = this.state;
        return (
            <div className="databind-pop-sql">
                <div
                    className="databind-pop-sql-left"
                    style={{ padding: "19px 21px 0 31px" }}
                >
                    <Row type="flex" justify="center" align="middle">
                        <Col span={5}>
                            <span>数据库连接</span>
                        </Col>
                        <Col span={16}>
                            <Select
                                value={this.state.select}
                                onChange={e => this.onChange(e, "select")}
                                style={{ width: "100%" }}
                            >
                                {this.state.sqlOptions.map((el, i) => (
                                    <Option value={el} key={i}>
                                        {el}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={2}>
                            <div
                                className="page-sql-edit"
                                onClick={e => this.sqlEdit(e)}
                            />
                        </Col>
                        <Col span={1}>
                            <div
                                className="page-sql-add"
                                onClick={e => this.sqlAdd(e)}
                            />
                        </Col>
                    </Row>
                    <Row
                        type="flex"
                        justify="space-between"
                        align="middle"
                        style={{ margin: "20px 0 5px" }}
                    >
                        <Col span={5}>
                            <span>SQL查询</span>
                        </Col>
                        <Col span={5}>
                            <Popover
                                placement="rightTop"
                                title=""
                                visible={isVis}
                                className="databind-filter-params-pop"
                                content={
                                    <Menu className="sql-cell-pop">
                                        {params.map(param => (
                                            <Menu.Item
                                                key={param.id}
                                                style={{
                                                    height: 35,
                                                    lineHeight: "35px",
                                                    margin: 0
                                                }}
                                                onClick={() =>
                                                    this.insertParam(param)
                                                }
                                            >
                                                <span style={{ fontSize: 12 }}>
                                                    {param.name}
                                                </span>
                                            </Menu.Item>
                                        ))}
                                    </Menu>
                                }
                            >
                                <div
                                    className="flex-align-center"
                                    style={{
                                        cursor: "pointer",
                                        height: "31px",
                                        padding: "0 5px",
                                        position: "relative"
                                    }}
                                    onClick={() => {
                                        if (!params.length) {
                                            message.error(
                                                "没有参数，请检查配置！"
                                            );
                                            return;
                                        }
                                        this.setState({
                                            isVis: !isVis
                                        });
                                    }}
                                >
                                    <Icon
                                        type="plus"
                                        style={{
                                            marginRight: "3px"
                                        }}
                                    />
                                    插入参数
                                </div>
                            </Popover>
                        </Col>
                    </Row>
                    <Row type="flex" style={{ height: "calc(100% - 200px)" }}>
                        <CodeMirror
                            style={{ width: "100%" }}
                            ref={code => (this.code = code)}
                            onChange={val => this.onChange(val, "codeValue")}
                            value={this.state.codeValue}
                            options={{
                                mode: "formula",
                                lineNumbers: true, //行号
                                lineWrapping: true //自动换行
                            }}
                        />
                    </Row>
                    <Row
                        type="flex"
                        align="middle"
                        style={{ margin: "20px 0 0" }}
                    >
                        <Col span={5} offset={19}>
                            <Button
                                type="primary"
                                onClick={e => {
                                    editSql(this.getSqlCfg(), "check");
                                }}
                            >
                                获取数据
                            </Button>
                        </Col>
                    </Row>
                </div>
                <div className="databind-pop-sql-right">
                    <ComponentList className="databind-components" />
                    <Stage className="databind-stage" />
                </div>
                <div
                    className="databind-pop-switch"
                    onClick={() => {
                        switchMode("dataset");
                        editSql(this.getSqlCfg());
                    }}
                >
                    &#60; 业务数据集模式
                </div>
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        mode: state.databind.mode,
        databind: state.databind,
        sqlCfg: state.databind.sqlCfg
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        setState: newState => {
            dispatch({
                type: "SET_STATE",
                newState
            });
        },
        switchMode: mode => {
            dispatch({
                type: "SWITCH_MODE",
                mode
            });
        },
        editSql: (sqlcfg, check) => {
            dispatch({
                type: "EDIT_SQL_CFG",
                sqlcfg: sqlcfg,
                check
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PageSql);
