import WidgetBase from "corejs/components/base";
import $ from "jquery";
//扩展多维方法
export default class OlapWidget extends WidgetBase {
    static cname = "多维";
    constructor(htmlObj, cfg) {
        super(htmlObj, cfg);
    }
    widgetWillCreated(cfg) {
        super.widgetWillCreated(cfg);
        this.handleDefinition(cfg.chartDefinition);
        this.htmlObj.style.display = "flex";
        this.htmlObj.style.flexDirection = "column";
        this.htmlObj.style.height = "100%";

        let olapdiv = (this.olapdiv = document.createElement("div"));
        this.olapdiv.style.flex = 1;
        this.olapdiv.style.height = "100%";
        this.olapdiv.style.width = "100%";
        tips();
        olapdiv.className = "workspace_results";
        return (this.rootDom = olapdiv);
    }
    handleDefinition(nextCfg) {
        for (let cname in nextCfg) {
            this.dispatchDefinition(cname, nextCfg[cname]);
        }
    }

    dispatchDefinition(type, value) {
        switch (type) {
            case "data":
                this.cfg.chartDefinition.data = value;
                break;
            case "option":
                this.handleDefinition(value);
                break;
            case "backgroundColor":
                this.htmlObj.style.backgroundColor = value;
                this.cfg.chartDefinition.option[type] = value;
                break;
            case {
                mode: "mode",
                render: "render",
                zoom: "zoom",
                formatter: "formatter",
                title: "title",
                titlePosition: "titlePosition",
                isExportData: "isExportData",
                hideParent: "hideParent"
            }[type]:
                break;
            case "listeners":
                this.cfg.listeners = value;
                break;
            case "file":
                //数据源切换 要 清楚 listeners  olapParametes
                this.cfg.chartDefinition.option[type] = value;
                break;
            case "olapParameters":
                this.cfg.chartDefinition.option[type] = value;
                this.cfg.listeners = value
                    .map(param => param.value)
                    .filter(v => !!v);
                break;
            case "currentOlapStatus":
                this.cfg.chartDefinition.option[type] = value;
                break;
            default:
                break;
        }
    }
    /**参数改变后的钩子，子类继承这个钩子 */
    paramChanged(obj1) {
        this.fetchMustAttach();
    }
    widgetDidCreated(cfg) {
        super.widgetDidCreated(cfg);
        this.htmlObj.appendChild(this.olapdiv);
    }
    preUpdate(nextCfg) {
        super.preUpdate(nextCfg);
        this.handleDefinition(nextCfg);
    }
    postUpdate(nextCfg) {
        super.postUpdate(nextCfg);
    }
    buildOlap(htmlObj, option) {
        let self = this;
        htmlObj.innerHTML = "";
        let paramValue = "";
        let params = option.olapParameters.map(param => {
            paramValue = param.value
                ? this.getParameter(param.value).getValue()
                : "";

            paramValue = Array.isArray(paramValue)
                ? paramValue.join(",")
                : paramValue;

            return { [param.name]: paramValue };
        });
        params = params.reduce(
            (prev, next) => Object.assign({}, prev, next),
            {}
        );
        let myClient = new SaikuClient({
            server: "/xdatainsight",
            path: "/plugin/saiku/api/cde-component"
        });
        //渲染之前  清楚多维提示
        $(".tipsy-nw").remove();
        try {
            myClient.execute({
                htmlObject: htmlObj,
                file: option.file,
                // mode: option.chart,
                // render: option.bar,
                // zoom: option.zoom,
                // formatter: option.flattened，
                formatter: "",
                chartDefinition: {
                    // height: 400,
                    renderAfter: function() {
                        setTimeout(function() {
                            Array.from(
                                document.querySelectorAll(
                                    ".workspace_results text"
                                )
                            ).forEach(text => {
                                text.style.fill = option.textColor[1];
                            });
                        });
                    },
                    colors: option.color,
                    legendLabel_textStyle: option.textColor[1],
                    extensionPoints: {
                        baseAxisTitleLabel_textStyle: option.textColor[0],
                        orthoAxisTitleLabel_textStyle: option.textColor[0],
                        titleFontColor: option.textColor[0],

                        baseAxisLabel_textStyle: option.textColor[1],
                        orthoAxisLabel_textStyle: option.textColor[1],
                        legendLabel_textStyle: option.textColor[1],
                        label_textStyle: option.textColor[1],
                        labelFontColor: option.textColor[1],
                        valueFontColor: option.textColor[1],
                        baseAxisRule_strokeStyle: option.lineColor[0],
                        baseAxisGrid_strokeStyle: option.lineColor[0],

                        orthoAxisRule_strokeStyle: option.lineColor[0],
                        orthoAxisGrid_strokeStyle: option.lineColor[0],

                        linkLine_strokeStyle: option.lineColor[1]
                    }
                },
                //通过 id 获取 param 值， 然后 合成一个 对象
                params,
                loadBefore: function() {
                    self.loader.show();
                },
                loadSuccess: function(data) {
                    self.loader.hide();
                    let _params =
                        self.cfg.chartDefinition.option.olapParameters[0];
                    if (
                        data &&
                        data.query &&
                        Object.keys(data.query.parameters).length
                    ) {
                        self.processParams(
                            !_params
                                ? data.query.parameters
                                : {
                                      [_params.name]: _params.value
                                  }
                        );
                    } else {
                        self.processParams({});
                    }
                },
                loadFail: function() {
                    self.loader.hide();
                }
            });
        } catch (error) {}
    }

    processParams(parameters) {
        /*//包存到实例上  方便 下次 直接使用
        parameters = Object.keys(parameters).map((param, i) => ({
            name: param,
            value: "",
            key: i
        }));
        //返回来的 parameters  的 value  是  值， 而不是参数id ，所以需要转换
        if (this.cfg.chartDefinition.option.olapParameters.length) {
        } else {
            this.cfg.chartDefinition.option.olapParameters = parameters;
            this.dispatch("olapParameters", parameters);
        }*/
        //根据当前多维在更新 还是  切换file
        switch (this.cfg.chartDefinition.option.currentOlapStatus) {
            case "filesouceChange":
                //包存到实例上  方便 下次 直接使用
                parameters = Object.keys(parameters).map((param, i) => ({
                    name: param,
                    value: Dashboard.globalParam.params.has(parameters[param])
                        ? parameters[param]
                        : "",
                    key: i
                }));
                //返回来的 parameters  的 value  是  值， 而不是参数id ，所以需要转换
                this.cfg.chartDefinition.option.olapParameters = parameters;
                this.dispatch("olapParameters", parameters);
                break;
            case "parametersChange":
                //如果是更新 就不 处理parameter

                break;
            default:
        }

        //这里涉及到  一个cfg 对应多个 olap问题，绑定参数后，如果返回参数为空，或者没有数据， 就会导致之前绑定的数据在页面上显示不出来
        //根本问题是  这个函数 ， 在多维 更新， 切换file 都要走这个函数， 导致处理不好
    }
    fetchMustAttach() {
        /*window.Dashboard.queryAction
            .getStyleOnce({
                href:
                    "/xdatainsight/api/repos/%3Apublic%3Acde%3Alib%3Aolap.min.css/content",
                name: "olapstyle"
            })
            .then(() => {
                console.log("多维样式加载完毕");
            });

        window.Dashboard.queryAction
            .getScriptOnce({
                src:
                    "/xdatainsight/api/repos/%3Apublic%3Acde%3Alib%3Aolap.min.js/content",
                name: "olapjs"
            })
            .then(() => {
                console.log("多维js加载完毕");
                this.buildOlap(this.olapdiv, this.cfg.chartDefinition.option);
            });
        // this.buildOlap(this.olapdiv, this.cfg.chartDefinition.option);*/
        window.Dashboard.queryAction
            .getStyleOnce({
                /* "/xdatainsight/api/repos/%3Apublic%3Acde%3Alib%3Aolap.min.css/content" */

                href: "/xdatainsight/content/dashboard-v3/saiku/olap.min.css",
                name: "olapstyle"
            })
            .then(() => {
                console.log("多维样式加载完毕");
            });

        window.Dashboard.queryAction
            .getScriptOnce({
                /* "/xdatainsight/api/repos/%3Apublic%3Acde%3Alib%3Aolap.min.js/content" */

                src: "/xdatainsight/content/dashboard-v3/saiku/olap.min.js",
                // src: "corejs/resource/js/olap.min.js",
                name: "olapjs"
            })
            .then(() => {
                console.log(d3);
                console.log("多维js加载完毕");
                this.buildOlap(this.olapdiv, this.cfg.chartDefinition.option);
            });
    }
    draw() {
        super.draw();
        if (this.cfg.chartDefinition.option.file) {
            this.fetchMustAttach();
        }
    }
    destroy() {
        // this.select.removeEventListener('change',() => {});
        // document.getElementById(this.cfg.id).remove();
        // this.cfg.htmlObj.removeChild(this.select)
    }
}
function tips() {
    !(function($) {
        function fixTitle($ele) {
            var title = $ele.attr("title");
            (title || "string" != typeof $ele.attr("original-title")) &&
                $ele.attr("original-title", title || "").removeAttr("title");
        }
        function Tipsy(element, options) {
            this.$element = $(element);
            this.options = options;
            this.enabled = !0;
            fixTitle(this.$element);
        }
        Tipsy.prototype = {
            enter: function() {
                var tipsy = this,
                    options = this.options;
                if (0 == options.delayIn) {
                    tipsy.hoverState = null;
                    tipsy.show();
                } else {
                    tipsy.hoverState = "in";
                    setTimeout(function() {
                        if ("in" === tipsy.hoverState) {
                            tipsy.hoverState = null;
                            tipsy.show();
                        }
                    }, options.delayIn);
                }
            },
            leave: function() {
                var tipsy = this,
                    options = this.options;
                if (0 == options.delayOut) tipsy.hide();
                else {
                    tipsy.hoverState = "out";
                    setTimeout(function() {
                        "out" === tipsy.hoverState && tipsy.hide();
                    }, options.delayOut);
                }
            },
            visible: function() {
                var parent;
                return (
                    "in" === this.hoverState ||
                    ("out" !== this.hoverState &&
                        !(
                            !this.$tip ||
                            !(parent = this.$tip[0].parentNode) ||
                            11 === parent.nodeType
                        ))
                );
            },
            update: function() {
                this.visible() ? this.show(!0) : this.enter();
            },
            show: function(isUpdate) {
                function calcPosition(gravity) {
                    var tp;
                    switch (gravity.charAt(0)) {
                        case "n":
                            tp = {
                                top: pos.top + pos.height + tipOffset,
                                left: pos.left + pos.width / 2 - actualWidth / 2
                            };
                            break;

                        case "s":
                            tp = {
                                top: pos.top - actualHeight - tipOffset,
                                left: pos.left + pos.width / 2 - actualWidth / 2
                            };
                            break;

                        case "e":
                            tp = {
                                top:
                                    pos.top + pos.height / 2 - actualHeight / 2,
                                left: pos.left - actualWidth - tipOffset
                            };
                            break;

                        case "w":
                            tp = {
                                top:
                                    pos.top + pos.height / 2 - actualHeight / 2,
                                left: pos.left + pos.width + tipOffset
                            };
                    }
                    2 === gravity.length &&
                        (tp.left =
                            "w" == gravity.charAt(1)
                                ? useCorners
                                    ? pos.left + pos.width + tipOffset
                                    : pos.left + pos.width / 2 - 15
                                : useCorners
                                ? pos.left - actualWidth - tipOffset
                                : pos.left + pos.width / 2 - actualWidth + 15);
                    return tp;
                }
                if ("in" !== this.hoverState) {
                    var title = this.getTitle();
                    if (this.enabled && title) {
                        var $tip = this.tip();
                        $tip.find(".tipsy-inner")[
                            this.options.html ? "html" : "text"
                        ](title);
                        $tip[0].className = "tipsy";
                        isUpdate || $tip.remove();
                        var parent = $tip[0].parentNode;
                        (parent && 11 !== parent.nodeType) ||
                            $tip
                                .css({
                                    top: 0,
                                    left: 0,
                                    visibility: "hidden",
                                    display: "block"
                                })
                                .appendTo(document.body);
                        var pos = $.extend({}, this.$element.offset());
                        if (this.$element[0].nearestViewportElement) {
                            var rect = this.$element[0].getBoundingClientRect();
                            pos.width = rect.width;
                            pos.height = rect.height;
                        } else {
                            pos.width = this.$element[0].offsetWidth || 0;
                            pos.height = this.$element[0].offsetHeight || 0;
                        }
                        var tipOffset = this.options.offset,
                            useCorners = this.options.useCorners,
                            showArrow = this.options.arrowVisible,
                            actualWidth = $tip[0].offsetWidth,
                            actualHeight = $tip[0].offsetHeight;
                        showArrow || (tipOffset -= 4);
                        var gravity =
                                "function" == typeof this.options.gravity
                                    ? this.options.gravity.call(
                                          this.$element[0],
                                          {
                                              width: actualWidth,
                                              height: actualHeight
                                          },
                                          calcPosition
                                      )
                                    : this.options.gravity,
                            tp = calcPosition(gravity);
                        $tip.css(tp).addClass(
                            "tipsy-" +
                                gravity +
                                (useCorners && gravity.length > 1
                                    ? gravity.charAt(1)
                                    : "")
                        );
                        if (showArrow) {
                            var hideArrow = useCorners && 2 === gravity.length;
                            $tip.find(".tipsy-arrow")[
                                hideArrow ? "hide" : "show"
                            ]();
                        }
                        var doFadeIn =
                            this.options.fade &&
                            (!isUpdate ||
                                !this._prevGravity ||
                                this._prevGravity !== gravity);
                        doFadeIn
                            ? $tip
                                  .stop()
                                  .css({
                                      opacity: 0,
                                      display: "block",
                                      visibility: "visible"
                                  })
                                  .animate({
                                      opacity: this.options.opacity
                                  })
                            : $tip.css({
                                  visibility: "visible",
                                  opacity: this.options.opacity
                              });
                        this._prevGravity = gravity;
                        this.hoverState = null;
                    } else {
                        this.hoverState = null;
                        this.hide();
                    }
                }
            },
            hide: function() {
                this.options.fade
                    ? this.tip()
                          .stop()
                          .fadeOut(function() {
                              $(this).remove();
                          })
                    : this.$tip && this.tip().remove();
                this.hoverState = null;
            },
            setTitle: function(title) {
                title = null == title ? "" : "" + title;
                this.$element.attr("original-title", title).removeAttr("title");
            },
            getTitle: function() {
                var title,
                    $e = this.$element,
                    o = this.options;
                fixTitle($e);
                "string" == typeof o.title
                    ? (title = $e.attr(
                          "title" == o.title ? "original-title" : o.title
                      ))
                    : "function" == typeof o.title &&
                      (title = o.title.call($e[0]));
                title = ("" + title).replace(/(^\s*|\s*$)/, "");
                return title || o.fallback;
            },
            tip: function() {
                if (!this.$tip) {
                    this.$tip = $('<div class="tipsy"></div>');
                    this.$tip.html(
                        this.options.arrowVisible
                            ? '<div class="tipsy-arrow"></div><div class="tipsy-inner"/></div>'
                            : '<div class="tipsy-inner"/></div>'
                    );
                    this.$tip.remove();
                }
                return this.$tip;
            },
            validate: function() {
                var parent = this.$element[0].parentNode;
                if (!parent || 11 === parent.nodeType) {
                    this.hide();
                    this.$element = null;
                    this.options = null;
                }
            },
            enable: function() {
                this.enabled = !0;
            },
            disable: function() {
                this.enabled = !1;
            },
            toggleEnabled: function() {
                this.enabled = !this.enabled;
            }
        };
        $.fn.tipsy = function(options, arg) {
            function get(ele) {
                var tipsy = $.data(ele, "tipsy");
                if (!tipsy) {
                    tipsy = new Tipsy(
                        ele,
                        $.fn.tipsy.elementOptions(ele, options)
                    );
                    $.data(ele, "tipsy", tipsy);
                }
                return tipsy;
            }
            function enter() {
                get(this).enter();
            }
            function leave() {
                get(this).leave();
            }
            if (options === !0) return this.data("tipsy");
            if ("string" == typeof options)
                return this.data("tipsy")[options](arg);
            options = $.extend({}, $.fn.tipsy.defaults, options);
            null == options.arrowVisible &&
                (options.arrowVisible = !options.useCorners);
            options.live ||
                this.each(function() {
                    get(this);
                });
            if ("manual" != options.trigger) {
                var binder = options.live ? "live" : "bind",
                    eventIn =
                        "hover" == options.trigger ? "mouseenter" : "focus",
                    eventOut =
                        "hover" == options.trigger ? "mouseleave" : "blur";
                this[binder](eventIn, enter)[binder](eventOut, leave);
            }
            return this;
        };
        $.fn.tipsy.defaults = {
            delayIn: 0,
            delayOut: 0,
            fade: !1,
            fallback: "",
            gravity: "n",
            html: !1,
            live: !1,
            offset: 0,
            opacity: 0.8,
            title: "title",
            trigger: "hover",
            useCorners: !1,
            arrowVisible: null
        };
        $.fn.tipsy.elementOptions = function(ele, options) {
            return $.metadata
                ? $.extend({}, options, $(ele).metadata())
                : options;
        };
        $.fn.tipsy.autoNS = function() {
            return $(this).offset().top >
                $(document).scrollTop() + $(window).height() / 2
                ? "s"
                : "n";
        };
        $.fn.tipsy.autoWE = function() {
            return $(this).offset().left >
                $(document).scrollLeft() + $(window).width() / 2
                ? "e"
                : "w";
        };
    })($);
}
