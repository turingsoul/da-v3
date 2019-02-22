/**
 * 维度指标字段
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { Popover, Icon, Menu, Modal } from "antd";
import { connect } from "react-redux";
import colTypeCfg from "dashboard/modules/common/colTypeCfg";
import CellDataHandle from "./CellDataHandle";
import CellDataGroupPop from "./cellDataGroupPop";
import Util from "dashboard/modules/common/Util";
const util = new Util();
const DEFAULT_PROPS = {};
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

function getFieldType(type) {
    return util.getRelFieldType(type);
}
class CellSetSelectPop extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    /**
     * 节点展示
     */
    selectEle() {
        let _element = this.props.element.find(
            e => e.valueKey === this.props.valueKey
        );
        let type = this.props.item.field.type;
        let selectArr = [];
        if (_element) {
            let collectTypeval = _element.collectType.selectValue;
            this._collectTypeval = collectTypeval;
            collectTypeval !== 0 && (this.collectTypeval = "1");
            selectArr =
                colTypeCfg[collectTypeval][
                    collectTypeval == 0
                        ? "string"
                        : getFieldType(type) === "number"
                        ? "number"
                        : "string"
                ];
            collectTypeval == 0 &&
                getFieldType(type) !== "number" &&
                (selectArr = selectArr.filter(e => e[0].value !== "dataGroup"));
        }
        return selectArr;
    }
    /**
     *
     * @param {当前选择对象} item
     * @param {上一层级对象} e
     */
    ifShowdidi(item, e) {
        //还原state
        item.children || this.props.hide();
        item.value === "editeName" && this.props.ifnameEditer();
        ["dataType"].includes(item.value) && this.setState({ visible: true });
        ["dataGroup"].includes(item.value) &&
            this.setState({ dataGroupVisible: true });
        let valSp = item.value.split("-");
        if (valSp.length > 1) {
            this.props.editeItem(
                valSp[0],
                valSp[1] !== "more" ? valSp[1] : e.value,
                item.name
            );
        } else {
            ["dataType", "editeName", "dataGroup"].find(
                e => item.value === e
            ) ||
                this.props.editeItem(
                    e.value.split("-")[0],
                    item.value,
                    item.name
                );
        }
    }
    //数据格式事件
    handleOk(dataHandle) {
        this.setState({
            visible: false
        });
        this.props.editeItem("dataHandle", dataHandle);
    }
    //数据分组
    handleOkDataGroup(dataGroup) {
        this.setState({
            dataGroupVisible: false
        });
        this.props.editeItem("dataGroup", dataGroup);
    }
    //
    handleCancel() {
        this.setState({
            visible: false,
            dataGroupVisible: false
        });
    }
    mapSelectEle(selectEle, ind) {
        const { collect, noShowJh, dataGroup } = this.props.item.config;
        let thb = collect === "NONE",
            menuClassName = "";
        return selectEle.map((e, i) => {
            let isSelect = {};
            noShowJh &&
                (/^collect-/.test(e.value) && (isSelect = { disabled: true }));
            e.name === "无" && (isSelect = { disabled: false });
            if (!e.children) {
                e.name === "默认排序" && (menuClassName = "moren");
                e.value === "dataGroup" &&
                    (dataGroup.model === "none" || !dataGroup.model) &&
                    (menuClassName = "moren");
                return (
                    <Menu.Item
                        key={e.value}
                        {...isSelect}
                        onClick={ei => this.ifShowdidi(e)}
                        className={menuClassName}
                    >
                        <Icon type="check" style={{ color: "transparent" }} />
                        <span style={{ fontSize: 12 }}>{e.name}</span>
                    </Menu.Item>
                );
            }
            return (
                <SubMenu
                    key={e.value}
                    {...isSelect}
                    title={
                        <span>
                            <Icon
                                type="mail"
                                style={{ color: "transparent" }}
                            />
                            <span style={{ fontSize: 12 }}>{e.name}</span>
                        </span>
                    }
                >
                    {e.children.map(ee => (
                        <Menu.Item
                            key={ee.value}
                            disabled={
                                e.value === "higsum" &&
                                thb &&
                                /YearOnYear|RingRatio/.test(ee.value)
                            }
                            onClick={ei => this.ifShowdidi(ee, e)}
                        >
                            <Icon
                                type="check"
                                style={{ color: "transparent" }}
                            />
                            <span style={{ fontSize: 12 }}>{ee.name}</span>
                        </Menu.Item>
                    ))}
                </SubMenu>
            );
        });
    }
    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let selectEle = this.selectEle();
        let _item = this.props.item.config;
        return (
            <div
                style={{ width: 126, margin: "-12px -16px" }}
                mode="vertical"
                className="cellPop"
            >
                {selectEle.map((item, i) => {
                    let defaultSelectedKeys = [];
                    let key = item[0].value.replace(/-.*/, "");
                    let value = _item[key];
                    let selfItem;
                    if (value !== undefined && item.length > 1) {
                        selfItem = item.find(e =>
                            new RegExp(value).test(e.value)
                        );
                        selfItem = selfItem ? selfItem.value : value;
                        defaultSelectedKeys.push(selfItem);
                    } else if (
                        value !== undefined &&
                        item.length == 1 &&
                        !item[0].children
                    ) {
                        defaultSelectedKeys.push(key);
                    } else if (
                        value !== undefined &&
                        item.length == 1 &&
                        item[0].children
                    ) {
                        defaultSelectedKeys.push(value);
                    }
                    let className = "";
                    if (
                        i === 1 &&
                        (this._collectTypeval == "1" ||
                            this._collectTypeval == "2" ||
                            (this._collectTypeval == "0" &&
                                selectEle.length > 2))
                    ) {
                        className = "cells-border-top";
                    }
                    className += /^(nonee|none)$/.test(value) ? " morens" : "";
                    return (
                        <Menu
                            key={i}
                            className={className}
                            defaultSelectedKeys={defaultSelectedKeys}
                            selectedKeys={defaultSelectedKeys}
                        >
                            {this.mapSelectEle(item, i)}
                        </Menu>
                    );
                })}
                {this.state.visible ? (
                    <Modal
                        width={445}
                        visible={this.state.visible}
                        footer={null}
                        wrapClassName="CellDataHandle"
                        onCancel={e => this.handleCancel()}
                    >
                        <CellDataHandle
                            {...{
                                editeItem: this.props.editeItem,
                                dataHandle: this.props.item.config.dataHandle,
                                dafaultFormat: this.props.item.field,
                                item: this.props.item,
                                handleOk: this.handleOk.bind(this),
                                handleCancel: this.handleCancel.bind(this)
                            }}
                        />
                    </Modal>
                ) : null}
                {this.state.dataGroupVisible ? (
                    <Modal
                        width={700}
                        visible={this.state.dataGroupVisible}
                        footer={null}
                        wrapClassName="CellDataHandle"
                        onCancel={e => this.handleCancel()}
                    >
                        <CellDataGroupPop
                            {...{
                                editeItem: this.props.editeItem,
                                dataGroup: this.props.item.config.dataGroup,
                                dafaultFormat: this.props.item.field,
                                item: this.props.item,
                                handleOk: this.handleOkDataGroup.bind(this),
                                handleCancel: this.handleCancel.bind(this)
                            }}
                        />
                    </Modal>
                ) : null}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        element: state.databind.cells
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CellSetSelectPop);
