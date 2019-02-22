import React, { Component } from "react";
import { Map, is } from "immutable";
import { Scrollbars } from "react-custom-scrollbars";
import $ from "jquery";
import { connect } from "react-redux";
import databindM from "dashboard/modules/business/databind";

/**
 * UI组件基类
 * 挂载组件UI层的基本操作方法，提供组件的最外层边框
 */
class Widget extends Component {
    constructor(props) {
        super(props);
    }

    //组件加载完成时把数据加载进入corejs渲染生成组件
    componentDidMount() {
        const { data, parentId, serialNum, temporary } = this.props;
        parentId && (data.parentId = parentId);
        parentId &&
            (serialNum || serialNum === 0) &&
            (data.serialNum = serialNum);
        this._btnBorderShow();
        window.Dashboard.add({
            isEditMode: !this.props.editeMode,
            htmlObj: this.doom,
            cfg: data,
            temporary
        }).then(ins => {
            this.cmpIntance = ins;
        });
    }

    //组件更新完成时调用resize方法  重新渲染
    componentDidUpdate() {
        this.resize();
    }

    //隐藏拉动按钮
    hideBtn() {
        this.rootDom.nextSibling &&
            (this.rootDom.nextSibling.style.display = "none");
    }

    //显示拉动按钮
    showBtn() {
        this.rootDom.nextSibling &&
            (this.rootDom.nextSibling.style.display = "block");
    }

    //重新渲染
    resize() {
        if (!this.cmpIntance || $(this.rootDom).is(":hidden")) {
            return;
        }
        this.cmpIntance.resize();
    }

    //导出csv
    chartCsv(e) {
        this.cmpIntance._bindCsv && this.cmpIntance._bindCsv();
    }

    //导出图片
    chartDownPng(e) {
        if (!this.cmpIntance) {
            return;
        }
        this.cmpIntance._chartDownPng && this.cmpIntance._chartDownPng();
    }

    //组件边框和操作按钮显示隐藏
    _btnBorderShow() {
        if (!this.props.editeMode) {
            $(".com-btns").hide();
            $(this.btns).show();
            $(".component_container").css("borderColor", "transparent");
            $(this.rootDom).css("border", "1px solid #1890ff");
            // [...document.querySelectorAll(".com-btns")].forEach(
            //     e => (e.style.display = "none")
            // );
            // this.btns.style.display = "block";
            // [...document.querySelectorAll(".component_container")].forEach(
            //     e => (e.style.borderColor = "transparent")
            // );
            // this.rootDom && (this.rootDom.style.border = "1px solid #1890ff");
        } else {
            this.hideBtn();
        }
    }

    //组件的点击事件  可切换面板和显示操作按钮
    componentClick(e) {
        let $target = $(e.target);
        e.stopPropagation();
        let { data, select } = this.props;
        let name = data.type;
        let id = data.id;

        if ($target.closest(".component_container").length > 0) {
            //清除点击按钮
            this._btnBorderShow();
            // this.isClick = true;

            if (!this.props.editeMode) {
                Dashboard.selectedIds = [id];
                window.Dashboard.event.dispatch("panelChange", {
                    name,
                    data: {
                        id
                    }
                });
            }
        }
    }

    //编辑组件数据源
    onEditBtnClick(e) {
        if (this.props.onEditBtnClick) {
            this.props.onEditBtnClick(e);
        }
    }
    //处理多维编辑事件
    handleEdit(e) {
        let file = this.cmpIntance.cfg.chartDefinition.option.file;
        if (!file) return;
        //获取它的名字
        let sl = file.substring(0, file.lastIndexOf(".")).split("/");
        let name = sl[sl.length - 1];
        if (name) {
            name = name[1];
        } else {
            return;
        }
        let data = {
            path: file,
            file: {
                name: name,
                path: file
            }
        };
        window.parent.postMessage(JSON.stringify(data), "*");
    }
    //移除当前组件
    remove(e) {
        e.stopPropagation();
        let { data } = this.props;

        Dashboard.selectedIds = [];
        window.Dashboard.event.dispatch("removeComponent", data.id);
    }

    //组件卸载时  清楚实例 同时面板切换回canvas
    componentWillUnmount() {
        const { data } = this.props;
        if (Dashboard.selectedIds.length === 0) {
            window.Dashboard.event.dispatch("panelChange", {
                name: "canvas",
                data: {}
            });
        }
        window.Dashboard.compManager.deleteComponent(data.id);
        this.cmpIntance = null;
    }

    //显示echarts按钮
    showChartBtns(e) {
        /*  if (!this.props.data.chartBtns) {
            return false;
        } */
        this.chartBtns && (this.chartBtns.style.display = "block");
    }

    //隐藏echarts按钮
    hideChartBtns(e) {
        /* if (!this.props.data.chartBtns) {
            return false;
        } */
        this.chartBtns && (this.chartBtns.style.display = "none");
    }

    //放大
    chartsBigAndSmall(e) {
        if (!this.cmpIntance) {
            return;
        }
        window.Dashboard.event.dispatch("showbigchart", {
            show: true,
            data: this.cmpIntance.cfg
        });
    }

    /**
     * 是否能弹出数据板顶弹框
     * @param {String} type  组件类型
     */
    canPopDatabind(type) {
        let _components = databindM.getDatasetComponents();
        return _components.map(e => e.type).find(e => e === type);
    }

    /**
     * 刷新操作
     * @param {Object} e event
     */
    refresh(e) {
        let comId = this.props.data.id;
        let comIns = Dashboard.compManager.getComponent(comId);
        if (comIns && this.props.data.chartBtns) {
            let { query, option } = comIns.cfg.chartDefinition;
            let queryType = query.type;
            /* if (
                queryType === "dataset" &&
                comIns.drillData &&
                option.clickEvent === "drill"
            ) {
                comIns.doQuery();
                return;
            } else  */ if (
                (queryType === "sql" || queryType === "dataset") &&
                option.clickEvent === "drill"
            ) {
                comIns.handleDefinition(comIns.cfg.chartDefinition);
                comIns.draw();
                return;
            }
        }
        this.resize(e);
    }

    //render函数   提供相关外框dom
    render() {
        let chartBtns = this.props.data.chartBtns;
        let nochartData = this.props.data.nochartData;
        let chartArr = window.Dashboard.componentList.find(e => e.id == 101)
            .children;
        let isChart = chartArr.find(e => e.type === this.props.data.type);
        return (
            <div
                ref={e => (this.rootDom = e)}
                className="component_container"
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    border: "1px solid transparent"
                }}
                onMouseEnter={this.showChartBtns.bind(this)}
                onMouseLeave={this.hideChartBtns.bind(this)}
                onClick={this.componentClick.bind(this)}
            >
                {this.props.editeMode ? null : (
                    <div
                        ref={e => (this.btns = e)}
                        className="com-btns"
                        style={{ display: "block" }}
                    >
                        {this.canPopDatabind(this.props.data.type) && (
                            <i
                                className="btn-edit"
                                onClick={this.onEditBtnClick.bind(this)}
                            />
                        )}
                        {this.props.data.type === "olap" ? (
                            <i
                                className="btn-edit"
                                onClick={e => this.handleEdit(e)}
                            />
                        ) : null}
                        <i className="btn-border" />
                        <i
                            className="btn-delete"
                            onClick={this.remove.bind(this)}
                        />
                    </div>
                )}
                <ul
                    ref={e => (this.chartBtns = e)}
                    className="chartBtns"
                    style={{ display: "none" }}
                >
                    {chartBtns ? (
                        <li
                            className="chartResize"
                            title="刷新"
                            onClick={e => {
                                this.refresh(e);
                            }}
                        />
                    ) : null}
                    {chartBtns && !nochartData ? (
                        <li
                            className="chartCsv"
                            title="导出数据"
                            style={{ display: "none" }}
                            onClick={e => this.chartCsv(e)}
                        />
                    ) : null}
                    {chartBtns ? (
                        <li
                            className="chartDownPng"
                            title="导出图片"
                            onClick={e => this.chartDownPng(e)}
                        />
                    ) : null}
                    {this.props.editeMode && this.props.data.bigandsmall ? (
                        <li
                            className="chartsBigAndSmall"
                            title="放大"
                            onClick={e => this.chartsBigAndSmall(e)}
                        />
                    ) : null}
                </ul>
                {isChart ? (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "auto",
                            position: "relative"
                        }}
                        ref={e => (this.doom = e)}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            overflow: "auto",
                            position: "relative"
                        }}
                    >
                        <Scrollbars
                            autoHide
                            ref={e => {
                                if (!e) {
                                    return;
                                }
                                this.doom = $(">div", e.container).get(0);
                            }}
                        >
                            {this.props.children}
                        </Scrollbars>
                    </div>
                )}
            </div>
        );
    }
}

export default Widget;
