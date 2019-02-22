/**
 *
 */
import compManager from "./compManager/compManager";
import widgetBase from "./components/base";
import dataHandle from "./datahandle/index";
import dataBind from "./databind/index";
import queryAction from "./datasource/queryAction";
import queryLogic from "./datasource/queryLogic";
import queryManager from "./datasource/queryManager";
import globalParam from "./globalParam/globalParam";
import params from "./globalParam/params";
import observe from "./paramListener/observe";
import store from "./util/store";
import util from "./util/util";
import axios from "axios";
import {Modal, message} from 'antd'

import $ from "jquery";
import _ from "underscore";
import echarts from "echarts";

import componentList from "./components/componentList";
import widgetComponent from "componentsUi/widgetComponent";

//组件添加文件
import * as components from "./components/index";

/**
 * 加载css
 * @param {String} url css url
 * @param {Function} cb callback
 */
function loadCss(url, cb) {
    let head = document.getElementsByTagName("head")[0];
    let link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    head.appendChild(link);
    cb &&
        setTimeout(function() {
            cb();
        }, 50);
}

/**
 * 加载js
 * @param {String} url js url
 * @param {Function} cb callback
 */
function loadJs(url, cb) {
    let head = document.getElementsByTagName("head")[0];
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;

    script.onload = e => {
        cb && cb(e);
    };

    script.onerror = e => {
        cb && cb(e);
    };

    head.appendChild(script);
}

/**
 * 加载自定义组件
 * @param {names} Array 自定义组件列表
 */
function loadCustomCom(names = [], cb) {
    let len = names.length;
    let count = 0;
    if (len === 0) {
        cb();
    }
    names.forEach(name => {
        loadCss(
            "/xdatainsight/api/repos/:public:cde:components:" +
                name +
                ":style.css/content"
        );
        loadJs(
            "/xdatainsight/api/repos/:public:cde:components:" +
                name +
                ":" +
                name +
                ".js/content",
            () => {
                count++;
                if (count === len) {
                    cb();
                }
            }
        );
    });
}

class dashboard {
    constructor() {
        this.init();
    }

    init() {
        //版本号
        this.version = "1.0.9";
        this.store = store;
        this.event = new observe();

        this.sysComponent = components;
        this.cfgComponent = {};
        this.reactComponent = {};
        this.classComponent = {};

        this.componentList = componentList;

        //组件基类
        this.widgetBase = widgetBase;

        //组件类集合
        this.classComponent = {};

        //工具函数集合
        this.util = util;

        this.selectedIds = [];

        //组件管理
        this.compManager = new compManager(this);

        this.dataHandle = new dataHandle().handle;
        this.queryAction = new queryAction(this);
        this.queryLogic = new queryLogic(this);
        this.queryManager = new queryManager(this);
        this.dataBind = new dataBind(this);

        this.params = params;

        this.globalParam = new globalParam(this);

        //平台提供的类库
        this.lib = { $, _, echarts };
    }

    /**
     * 启动
     * @param {*} cb
     */
    bootstrap(cb) {
        return $.when(
            //初始化组件cfg
            this.initCfgComponent(),
            //注册自定义组件
            this.registerCustomCom(),
        ).then(
            e => {
                cb && cb();
            },
            e => {
                cb && cb();
            }
        );
    }

    /**
     * 注册自定义组件
     */
    registerCustomCom() {
        let url =
            "/xdatainsight/api/repo/files/:public:cde:components/tree?showHidden=true&filter=*|FOLDERS";
        let def = $.Deferred();
        //查询文件系统自定义组件列表
        $.ajax({
            url,
            dataType: "json"
        })
            .done(data => {
                let children = data.children || [];
                let comNames;
                comNames = children.map(item => item.file.name);
                //加载自定义组件
                loadCustomCom(comNames, () => {
                    def.resolve();
                });
            })
            .fail(e => {
                def.reject(e);
            });
        return def.promise();
    }

    /**
     * 注册组件
     * @param {String} name 组件类型名称
     * @param {Class} options 参数对象 {widgetClass,widgetConfig}
     * @param {Boolean} isCustom 是否自定义组件
     */
    register(name, options, isCustom) {
        let { widgetClass, widgetConfig } = options;

        if (widgetClass) {
            this.classComponent[name] = widgetClass;
        }

        window.Dashboard.cfgComponent[name] = widgetConfig;

        if (isCustom === true) {
            let groupId = widgetConfig.base.group;
            let group = this.componentList.filter(
                item => item.id === groupId
            )[0];
            let iconPath = [
                "/xdatainsight/api/repos/:public:cde:components:",
                widgetConfig.base.type,
                ":icon.png/content"
            ].join("");
            if (group && group.children) {
                group.children.push({
                    type: widgetConfig.base.type,
                    cname: widgetConfig.base.name,
                    $$custom: true,
                    icon: iconPath
                });
                window.Dashboard.event.dispatch(
                    "COM_LIST_CHANGED",
                    widgetConfig
                );
            }
        }
    }

    /**
     * 加载组件类文件
     * @param {String} type 组件类型
     */
    loadComClass(type) {
        return new Promise((resolve, reject) => {
            if (this.classComponent[type]) {
                resolve(this.classComponent[type]);
            } else {
                let sysComponent = this.sysComponent;
                sysComponent[type].classLoader().then(
                    e => {
                        this.classComponent[type] = e.default;
                        resolve(this.classComponent[type]);
                    },
                    e => {
                        resolve(this.widgetBase);
                    }
                );
            }
        });
    }

    /**
     * 初始化cfgComponent属性
     */
    initCfgComponent() {
        let sysComponent = this.sysComponent;
        let types = Object.keys(sysComponent);
        let len = types.length;
        let count = 0;

        return new Promise((resolve, reject) => {
            for (let i = 0; i < len; i++) {
                let type = types[i];
                (type => {
                    sysComponent[type].configLoader().then(
                        e => {
                            this.cfgComponent[type] = e.default;
                            count++;
                            if (count === len) {
                                resolve();
                            }
                        },
                        e => {
                            count++;
                            if (count === len) {
                                resolve();
                            }
                        }
                    );
                })(type);
            }
        });
    }

    /**
     * 添加组件
     * @param {Object} options 参数对象
     * @param {Boolean} options.temporary 是否临时的，如果为true不加入到组件管理中
     * @return {Object|Array} 组件实例对象
     */
    add(options, cb) {
        let { htmlObj, parentId, isEditMode, cfg, temporary } = options;
        let type = cfg.type;
        let instance = null;
        let instanceWidget;
        let initWidget = instanceWidget => {
            instance = new instanceWidget(htmlObj, cfg, parentId, isEditMode);

            instance.init();

            instance && this.compManager.addComponent(instance, temporary);

            cb && cb(instance);

            //广播组件渲染完成
            this.event.dispatch(cfg.id + "_rendered", instance);
            return instance;
        };

        if (type) {
            try {
                let theme = this.globalParam.globalParam.theme;
                cfg = $.extend(
                    true,
                    {},
                    window.Dashboard.cfgComponent[type].cfg(theme),
                    cfg
                );

                return this.loadComClass(type).then(instanceWidget => {
                    return initWidget(instanceWidget);
                });
            } catch (err) {
                console.log("组件添加失败：" + err);
                instance = null;
            }
        }
    }

    /**
     * 移除组件
     * @param {String} id 组件ID
     */
    remove(id) {
        return this.compManager.deleteComponent(id);
    }

    /**
     * 销毁
     */
    destroy() {}

    submit() {}

    loading(statu) {
        let $loading = $("#ds-global-loading");
        if (!$loading.length) {
            $loading = $(
                "<div id='ds-global-loading' class='ds-global-loading__wrap'>\
                    <div class='ds-global-loading'>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                        <div class='ds-global-loading__square'></div>\
                    </div>\
                </div>"
            );
            $loading.appendTo("body");
        }
        $loading[statu ? "show" : "hide"]();
    }
}

export default dashboard;

//实例化corejs
window.Dashboard = new dashboard();

//分发postmessage消息
window.addEventListener(
    "message",
    event => {
        try {
            if (event.data && typeof event.data === "string") {
                let data = JSON.parse(event.data);
                Dashboard.event.dispatch(data.type, data.data);
            }
        } catch (error) {
            console.log(error);
        }
    },
    false
);
