/**
 * 可切换组件集合
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Icon, Button } from "antd";
import widgetComponent from "componentsUi/widgetComponent";
import $ from "jquery";
const DEFAULT_PROPS = {
    components: []
};

function ComponentItem(props) {
    let { component, actived, onClick, isMore } = props;
    return (
        <li
            className={
                (component.type === actived ? "actived" : "") +
                " databind-components-item"
            }
            onClick={() => {
                onClick(component);
            }}
            title={component.name}
        >
            <i className={"side-icon " + component.iconClass} />
            {isMore ? <label>{component.name}</label> : ""}
        </li>
    );
}

class ComponentList extends Component {
    constructor() {
        super();
        this.state = {
            morePopShow: false
        };
    }

    componentDidMount() {
        $(document)
            .off("click.DATABIND_COM_LIST")
            .on("click.DATABIND_COM_LIST", e => {
                let $target = $(e.target);
                if (
                    $target.closest(".databind-component-more-btn").length === 0
                ) {
                    this.closeMore();
                }
            });

        $(window)
            .off("resize.DATABIND_COM_LIST")
            .on("resize.DATABIND_COM_LIST", () => {
                this.closeMore();
                this.props.updateComponentShowMax();
            });
    }

    componentWillUnmount(){
        $(document).off("click.DATABIND_COM_LIST");
        $(window).off("resize.DATABIND_COM_LIST");
    }

    /**
     * 异步加载组件UI
     * @param {String} type 组件类型
     */
    promiseComponent(type) {
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

    /**
     * 关闭显示更多组件弹窗
     */
    closeMore() {
        this.setState({
            morePopShow: false
        });
    }

    /**
     * 当个组件图标点击事件
     * @param {Object} component 当前组件对应信息对象
     * @param {String} actived 当前选中组件类型
     */
    itemClick(component, actived) {
        let { onSwitchCom } = this.props;
        if (component.type !== actived) {
            this.closeMore();
            this.promiseComponent(component.type).then(() => {
                onSwitchCom(component.type);
            });
        }
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { className, actived, components, componentShowMax } = props;
        
        components = components.filter(item=>item!==false);

        let { morePopShow } = this.state;
        let showList = true;
        let activedComponent = components.filter(
            component => component.type === actived
        )[0];
        let visibleComponents = components.filter(item => item.show !== false);
        let visibleComponentsLen = visibleComponents.length;
        let showMore = false;
        let moreList = [];

        //componentShowMax为计算出的当前能摆放组件图标最多的个数
        if (componentShowMax && visibleComponentsLen > componentShowMax) {
            showMore = true;
            moreList = visibleComponents.slice(
                componentShowMax,
                visibleComponentsLen
            );
            visibleComponents = visibleComponents.slice(0, componentShowMax);
        }

        //如果当前类型组件是不能切换至其他组件，则不展示组件图标列表
        if (activedComponent && activedComponent.switch === false) {
            showList = false;
        }

        return (
            <div className={props.className}>
                {showList && (
                    <ul className="databind-component-visible">
                        {visibleComponents.map(component => (
                            <ComponentItem
                                key={component.name}
                                component={component}
                                actived={actived}
                                onClick={() => {
                                    this.itemClick(component, actived);
                                }}
                            />
                        ))}
                    </ul>
                )}
                {showList &&
                    showMore && (
                        <div className="databind-component-more-btn">
                            <Button
                                icon="double-right"
                                style={{
                                    border: 0,
                                    padding: 0,
                                    height: "100%",
                                    width:"auto"
                                }}
                                onClick={() => {
                                    this.setState({
                                        morePopShow: !morePopShow
                                    });
                                }}
                            />
                            {morePopShow && (
                                <ul className="databind-component-more">
                                    {moreList.map(component => (
                                        <ComponentItem
                                            key={component.name}
                                            component={component}
                                            actived={actived}
                                            isMore={true}
                                            onClick={() => {
                                                this.itemClick(
                                                    component,
                                                    actived
                                                );
                                            }}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        components: state.databind.components,
        componentShowMax: state.databind.componentShowMax,
        actived: state.databind.component.type
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onSwitchCom: comType => {
            dispatch({
                type: "SWITCH_COMPONENT_TYPE",
                comType: comType
            });
        },
        updateComponentShowMax: () => {
            dispatch({
                type: "UPDATE_COM_SHOW_MAX"
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComponentList);
