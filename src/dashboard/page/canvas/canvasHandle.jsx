import React, { Component } from "react";
import Immutable from "immutable";
import { dispatch } from "xdux";
import Util from "dashboard/modules/common/Util";
import databindM from "dashboard/modules/business/databind";
import widgetComponent from "componentsUi/widgetComponent";

const util = new Util();

class CanvasHandle extends Component {
    //组件构造方法
    constructor(props) {
        super(props);

        this.init();
        this.hasListenered = false;
        this.reEditerArr = [];
    }

    //添加组件的删除监听事件，重新编辑事件
    init() {
        this.removeListener();
        this.addReEditeListener();
    }

    //重新编辑  按需加载
    reEditerPromise(components) {
        let promise = components.map(cmp => {
            window.dashboardType = cmp.type;
            return this.promiseComponent(null);
        });
        return Promise.all(promise);
    }
    //resize
    appResize() {
        this.setState({
            _time: "" + +new Date()
        });
    }
    //添加重新编辑事件监听
    addReEditeListener() {
        if (!this.hasListenered) {
            window.Dashboard.event.subscribe(
                "reEditeComponents",
                components => {
                    //清除component里面的children
                    components.forEach(item => {
                        if (item.type === "carousel") {
                            /^carousel\_/.test(item.id) && (item.children = []);
                            for (
                                let i = 0;
                                i < item.chartDefinition.option.pageNumber;
                                i++
                            ) {
                                item.children.push([]);
                            }
                        } else {
                            /^container\_/.test(item.id) &&
                                (item.children = []);
                        }
                    });
                    //处理components   划分类别
                    if (components && components.length > 0) {
                        let selefComponents = this.handleReEditerComponents(
                            components
                        );
                        this.reEditerPromise(components).then(() => {
                            this.setState({
                                components: selefComponents
                            });
                        });
                    }
                }
            );
            this.hasListenered = true;
        }
        window.Dashboard.event.subscribe("appResize", () => this.appResize());
    }

    //处理重新编辑的实例数据   进行归类处理
    handleReEditerComponents(components) {
        let selfComponents = Immutable.fromJS(components).toJS();
        let ComponentNoParent = [],
            ComponentHasParent = [];

        ComponentNoParent = selfComponents.filter(e => !e.parentId);
        ComponentHasParent = selfComponents.filter(e => e.parentId);
        ComponentHasParent.forEach(e => {
            let component = ComponentNoParent.find(
                item => item.id === e.parentId
            );
            if (e.serialNum || e.serialNum === 0) {
                component.children[e.serialNum].push(e);
            } else {
                component.children.push(e);
            }
        });

        return ComponentNoParent;
    }

    //移除组件 重新渲染
    removeListener() {
        window.Dashboard.event.subscribe("removeComponent", id => {
            var ind;
            let components = Immutable.fromJS(this.state.components).toJS();
            this.state.components.find((e, k) => e.id === id && (ind = k));
            if (ind !== undefined) {
                components.splice(ind, 1);
            } else {
                for (let i = 0; i < components.length; i++) {
                    if (Array.isArray(components[i])) {
                        for (let j = 0; j < components[i].length; j++) {
                            this.state.components[i].find(
                                (e, k) => e.id === id && (ind = k)
                            );
                            if (ind !== undefined) {
                                components[i].splice(ind, 1);
                                break;
                            }
                        }
                    }
                    if (ind !== undefined) {
                        break;
                    }
                }
            }
            this.setState({
                components
            });
        });
    }

    //组件的放置
    menuDroper(e, isIncontainer, serialNum) {
        e && e.preventDefault();
        this.promiseComponent().then(type => {
            this.setDroper(type, isIncontainer, serialNum);
        });
    }

    //按需加载组件配置和实例   缓存进window中
    promiseComponent(type) {
        type = type || window.dashboardType;
        window.dashboardType = null;

        if (window.Dashboard.reactComponent[type]) {
            return Promise.resolve(type);
        } else {
            return import("componentsUi/" + type + "/" + type).then(
                e => {
                    window.Dashboard.reactComponent[type] = e.default;
                    return Promise.resolve(type);
                },
                e => {
                    window.Dashboard.reactComponent[type] = widgetComponent;
                    return Promise.resolve(type);
                }
            );
        }
    }

    //面板切换  根据id和name
    recordActiveGridItem(id, name) {
        this.activeGridItemId = id;
        this.setPanel(name, {
            id
        });
    }

    //面板切换事件触发
    setPanel(name, data) {
        return window.Dashboard.event.dispatch("panelChange", {
            name,
            data
        });
    }
    /**
     * 更新组件
     */
    updateComponent(cfg) {}

    //拖拽放置新组件  并计算其y值
    setDroper(type, isIncontainer, serialNum) {
        let component, components;
        components = Immutable.fromJS(this.state.components).toJS();
        //生成配置同时，设置主题数据到里面
        let theme = window.Dashboard.globalParam.globalParam.theme;
        //如果组件在容器中，将其背景颜色设置为透明
        if (isIncontainer === "widgetIncontainer") {
            theme = window.Dashboard.util.copyReference(theme);
            theme.chart.backgroundColor = "transparent";
        }

        if (!window.Dashboard.cfgComponent[type]) {
            return;
        }

        component = window.Dashboard.cfgComponent[type].cfg(theme);
        //在容器中重新计算layout
        if (isIncontainer === "widgetIncontainer") {
            component.layout.h =
                3 * component.layout.h + component.layout.h - 1;
        }
        let id = type + "_" + +new Date();
        component.id = id;
        component.layout.i = id;
        //如果在轮播组件中，components是嵌套数组的格式
        if (serialNum || serialNum === 0) {
            component.layout.y = this.layoutYCount(components[serialNum]);
            components[serialNum].push(component);
        } else {
            component.layout.y = this.layoutYCount(components);
            components.push(component);
        }

        this.setState(
            {
                components
            },
            () => {
                let _components = databindM.getDatasetComponents();
                let isAutoPop;

                isAutoPop =
                    _components.map(e => e.type).findIndex(e => e === type) !==
                    -1;

                Dashboard.event.one(id + "_rendered", ins => {
                    this.recordActiveGridItem(component.id, component.type);
                    //自动弹窗
                    isAutoPop && this.openDataBindPop(id);
                    Dashboard.selectedIds = [id];
                });
            }
        );
        return component;
    }

    //y值计算
    layoutYCount(components = []) {
        let count = 0,
            layout;
        if (components.length > 0) {
            layout = components.sort((a, b) => b.layout.y - a.layout.y)[0];
            count = layout.layout.y + layout.layout.h;
        }

        return count;
    }

    /**
     * 打开组件数据源弹框
     * @param {Object} component
     */
    openDataBindPop(widgetId) {
        //组件上才是最新的cfg，state.components中只是初始化的状态。
        let cfg = Dashboard.compManager.getComponent(widgetId).cfg;
        cfg.chartDefinition.query.isNoQuery = true;
        let _cfg = util.deepClone(cfg);

        //优化，先取消选中，关闭绑定数据弹窗后选中组件
        Dashboard.selectedIds = [];
        window.Dashboard.event.dispatch("panelChange", {
            name: "canvas",
            data: {}
        });

        this.setState({
            dataBind: {
                visible: true,
                component: _cfg
            }
        });
    }

    //关闭组件数据源弹框
    closeDataBindPop(data) {
        this.setState({
            dataBind: {
                visible: false,
                component: null
            }
        });
    }

    /**
     * 保存数据绑定页配置信息
     */
    saveDatabind(data, serialNum) {
        let ind;
        let components = [...this.state.components];
        if (serialNum || serialNum === 0) {
            components[serialNum].map((e, i) => {
                e.id === data.id && (ind = i);
            });
            components[serialNum][ind] = data;
            components[serialNum][ind].hash = "__" + +new Date();
            data.layout.i = data.id + components[serialNum][ind].hash;
        } else {
            components.map((e, i) => {
                e.id === data.id && (ind = i);
            });
            components[ind] = data;
            components[ind].hash = "__" + +new Date();
            data.layout.i = data.id + components[ind].hash;
        }
        this.setState({
            dataBind: {
                visible: false,
                layout: true
            },
            components
        });
    }

    //设置新的layout
    setActionState(layouts, serialNum) {
        let components = Immutable.fromJS(this.state.components).toJS();
        let layout = Immutable.fromJS(layouts).toJS();

        if (serialNum || serialNum === 0) {
            components[serialNum].forEach(e => {
                this.state.dataBind.layout ||
                    (e.layout = layout.find(item =>
                        new RegExp(e.id).test(item.i)
                    ));
                if (this.state.dataBind.layout && e.hash) {
                    e.layout.id = layout.find(item =>
                        new RegExp(e.id).test(item.i)
                    ).id;
                }
            });
            this.setState(
                {
                    components,
                    dataBind: { layout: false }
                },
                () => {
                    layouts.forEach(e => {
                        dispatch({
                            type: "updateLayout",
                            value: {
                                ids: e.i.replace(/__.*/g, ""),
                                data:
                                    (this.state.dataBind.layout &&
                                        components[serialNum].find(ee =>
                                            new RegExp(ee.id).test(e.i)
                                        ).layout) ||
                                    e
                            }
                        });
                    });
                }
            );
        } else {
            components.forEach(e => {
                this.state.dataBind.layout ||
                    (e.layout = layout.find(item =>
                        new RegExp(e.id).test(item.i)
                    ));
                if (this.state.dataBind.layout && e.hash) {
                    e.layout.id = layout.find(item =>
                        new RegExp(e.id).test(item.i)
                    ).id;
                }
            });
            this.setState(
                {
                    components,
                    dataBind: { layout: false }
                },
                () => {
                    layouts.forEach(e => {
                        dispatch({
                            type: "updateLayout",
                            value: {
                                ids: e.i.replace(/__.*/g, ""),
                                data:
                                    (this.state.dataBind.layout &&
                                        components.find(ee =>
                                            new RegExp(ee.id).test(e.i)
                                        ).layout) ||
                                    e
                            }
                        });
                    });
                }
            );
        }
    }
}

export default CanvasHandle;
