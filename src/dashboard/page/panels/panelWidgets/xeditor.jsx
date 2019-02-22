import React, { Component } from "react";
import _ from "lodash";
import E from "wangeditor";
import {
    Input,
    Select,
    Row,
    Col,
    Icon,
    Radio,
    Popconfirm,
    message,
    Collapse,
    Button,
    Popover
} from "antd";
import { ColorPicker } from "../panelComponents/index";
import $ from "jquery";
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Panel = Collapse.Panel;

const fontStyle = [
    "宋体",
    "黑体",
    "仿宋",
    "楷体",
    "隶书",
    "微软雅黑",
    "幼圆",
    "Arial",
    "Calibri",
    ,
    "Cambria",
    "Helvetica",
    ,
    "Tahoma",
    "Times New Roman"
];
const fontSize = [
    "1号字",
    "2号字",
    "3号字",
    "4号字",
    "5号字",
    "6号字",
    "7号字"
];
const iconConfig = [
    {
        name: "学校",
        icons: [
            ["学生", "icon-xuesheng"],
            ["学生", "icon-nansheng"],
            ["短信", "icon-icon116"],
            ["书籍", "icon-shuji"],
            ["羽毛", "icon-feather-blur-light-b"],
            ["苹果", "icon-pingguo"],
            ["奖牌", "icon-tubiaozhizuomoban-copy"],
            ["化学研究", "icon-huaxueyanjiu"]
        ]
    },
    {
        name: "人物",
        icons: [
            ["护士", "icon-hushi"],
            ["女", "icon-nv"],
            ["男", "icon-msnui-male"],
            ["听音乐", "icon-kefu"],
            ["学生", "icon-student"],
            ["医生", "icon-yisheng"],
            ["打电话", "icon-dadianhua"],
            ["男", "icon-nan"]
        ]
    },
    {
        name: "社交",
        icons: [
            ["in", "icon-in"],
            ["qq空间", "icon-qqkongjian-copy"],
            ["百度 [转换]", "icon-baiduzhuanhuan"],
            ["开心网-阴", "icon-kaixinwangyin"],
            ["56", "icon-56"],
            ["地球", "icon-diqiu"]
        ]
    },
    {
        name: "交通运输",
        icons: [
            ["摩托车", "icon-ft-motorcycle"],
            ["汽车", "icon-ic_directions_car_px"],
            ["船", "icon-chuan"],
            ["汽车", "icon-qiche"],
            ["火车", "icon-huoche"],
            ["飞机", "icon-feiji"]
        ]
    },
    {
        name: "货币",
        icons: [
            ["人民币", "icon-renminbi"],
            ["美元", "icon-font34"],
            ["英镑", "icon-anonymous-iconfont"],
            ["欧元", "icon-anonymous-iconfont1"]
        ]
    }
];
const iconConfig2 = [
    {
        name: "数据",
        icons: [
            ["玫瑰图", "&#xe616;"],
            ["趋势图", "&#xe610;"],
            ["数据", "&#xe603;"],
            ["数据", "&#xe619;"],
            ["地图", "&#xe617;"]
        ]
    },
    {
        name: "学校",
        icons: [
            ["学生", "&#xe61f;"],
            ["学生", "&#xe622;"],
            ["短信", "&#xe627;"],
            ["书籍", "&#xe60c;"],
            ["羽毛", "&#xe6f7;"],
            ["苹果", "&#xe7a2;"],
            ["奖牌", "&#xe60d;"],
            ["化学研究", "&#xe656;"]
        ]
    },
    {
        name: "人物",
        icons: [
            ["护士", "&#xe61b;"],
            ["女", "&#xe60e;"],
            ["男", "&#xe6a0;"],
            ["听音乐", "&#xe65e;"],
            ["学生", "&#xe64b;"],
            ["医生", "&#xe688;"],
            ["打电话", "&#xe607;"],
            ["男", "&#xe614;"]
        ]
    },
    {
        name: "社交",
        icons: [
            ["in", "&#xe63d;"],
            ["qq空间", "&#xe608;"],
            ["百度 [转换]", "&#xe601;"],
            ["开心网-阴", "&#xe7e4;"],
            ["56", "&#xe602;"],
            ["地球", "&#xe620;"]
        ]
    },
    {
        name: "交通运输",
        icons: [
            ["摩托车", "&#xe736;"],
            ["汽车", "&#xe77d;"],
            ["船", "&#xe7cb;"],
            ["汽车", "&#xe708;"],
            ["火车", "&#xe600;"],
            ["飞机", "&#xe60f;"]
        ]
    },
    {
        name: "货币",
        icons: [
            ["人民币", "&#xe611;"],
            ["美元", "&#xe646;"],
            ["英镑", "&#xe605;"],
            ["欧元", "&#xe606;"]
        ]
    }
];

// name,value, onChange
class XEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            iconVisible: false,
            colorVisible: false,
            linkVisible: false
        };
        this.contentValue = props.value;
        this.text = "";
        this.link = "";
        this.linkType = "_blank";
    }

    componentDidMount() {
        const editor = (this.editor = new E(this.editorDom));
        editor.customConfig.menus = ["link"];
        editor.customConfig.zIndex = 500;
        editor.customConfig.onchange = html => {
            this.contentValue = html;
            this.props.onChange && this.props.onChange(html);
        };
        editor.create();
        editor.txt.html(this.props.value);
        //缓存选中的字段
        var _this = this;
        var _createPanel = this.editor.menus.menus.link._createPanel;
        this.editor.menus.menus.link._createPanel = function(text, link) {
            _this.text = text; //缓存选中值
            _this.link = link; //缓存链接
            _createPanel.call(this, text, link);
        };
        this.editor.menus.menus.link._insertLink = function _insertLink(
            text,
            e
        ) {
            var link = e.Val;
            var editor = this.editor;
            var config = editor.config;
            var linkCheck = config.linkCheck;
            var checkResult = true; // 默认为 true
            if (linkCheck && typeof linkCheck === "function") {
                checkResult = linkCheck(text, link);
            }
            if (checkResult === true) {
                editor.cmd.do(
                    "insertHTML",
                    '<a href="' +
                        link +
                        '" target="' +
                        e.btnVal +
                        '">' +
                        text +
                        "</a>"
                );
            } else {
                alert(checkResult);
            }
        };
    }
    //初始化link点击
    linkClick() {
        this.editor.menus.menus.link.onClick();
    }
    handleEditerChange(type, e) {
        const config = {
            textAlign: e => this.editor.cmd.do(e),
            icon: e =>
                this.editor.cmd.do(
                    "insertHTML",
                    `<i class="iconfont" title=${e.title}>${e.icon}</i>`
                ),
            color: e => this.editor.cmd.do("foreColor", e),
            //  param: e => this.editor.cmd.do('insertText', ),
            param: e => this.editor.cmd.do("insertHTML", "<i>${" + e + "}</i>"),
            fontStyle: e => this.editor.cmd.do("fontName", e),
            fontSize: e => this.editor.cmd.do("fontSize", e),
            link: e => {
                this.editor.menus.menus.link._insertLink(this.text, e);
            },
            deleteLink: e => this.editor.menus.menus.link._delLink()
        };
        config[type](e);
    }
    handleVisibleChange(type, e) {
        this.setState({
            [type]: !this.state[type]
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.value != this.contentValue) {
            this.editor.txt.html(nextProps.value);
            this.contentValue = nextProps.value;
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (
            nextProps.value == this.contentValue &&
            _.isEqual(this.state, nextState)
        ) {
            return false;
        }
        return true;
    }

    render() {
        return (
            <div className="hqEditer" style={{ marginBottom: 15 }}>
                <Row
                    type="flex"
                    align="middle"
                    gutter={2}
                    style={{ padding: 6, marginBottom: 0 }}
                >
                    <Col span={8}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="插入参数"
                            onChange={e => this.handleEditerChange("param", e)}
                        >
                            {this.props.options.map((para, i) => (
                                <Option key={i} value={para.name}>
                                    {para.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="字体"
                            onChange={e =>
                                this.handleEditerChange("fontStyle", e)
                            }
                        >
                            {fontStyle.map((font, i) => (
                                <Option value={font} key={i}>
                                    {font}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="字号"
                            onChange={e =>
                                this.handleEditerChange("fontSize", e)
                            }
                        >
                            {fontSize.map((size, i) => (
                                <Option
                                    value={size.replace("号字", "")}
                                    key={i}
                                >
                                    {size}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row
                    type="flex"
                    align="middle"
                    style={{ padding: "6px 6px 10px 8px", marginBottom: 0 }}
                >
                    <Col span={7} style={{ cursor: "pointer" }}>
                        <span
                            style={{ paddingRight: 16 }}
                            onClick={e =>
                                this.handleEditerChange(
                                    "textAlign",
                                    "justifyLeft"
                                )
                            }
                        >
                            <i className="w-e-icon-paragraph-left" />
                        </span>
                        <span
                            style={{ paddingRight: 16 }}
                            onClick={e =>
                                this.handleEditerChange(
                                    "textAlign",
                                    "justifyCenter"
                                )
                            }
                        >
                            <i className="w-e-icon-paragraph-center" />
                        </span>
                        <span
                            style={{ paddingRight: 16 }}
                            onClick={e =>
                                this.handleEditerChange(
                                    "textAlign",
                                    "justifyRight"
                                )
                            }
                        >
                            <i className="w-e-icon-paragraph-right" />
                        </span>
                    </Col>
                    <Col
                        span={2}
                        style={{
                            fontWeight: "bolder",
                            fontSize: "16px",
                            cursor: "pointer",
                            margin: "0 1px 0 5px"
                        }}
                    >
                        <Popover
                            placement="topRight"
                            content={
                                <IconCollapse
                                    onChange={e =>
                                        this.handleEditerChange("icon", e)
                                    }
                                />
                            }
                            trigger="click"
                            visible={this.state.iconVisible}
                            onVisibleChange={e => {
                                this.handleVisibleChange("iconVisible", e);
                            }}
                        >
                            Ω
                        </Popover>
                    </Col>
                    <Col
                        span={2}
                        className="editer-color"
                        style={{ cursor: "pointer" }}
                    >
                        <ColorPicker
                            type="normal"
                            color={"red"}
                            position={["tr", "bl"]}
                            onChange={e =>
                                this.handleEditerChange("color", e.hex)
                            }
                            pickerContent={
                                <span
                                    style={{
                                        display: "block",
                                        width: 16,
                                        height: 16,
                                        backgroundColor: "#E9EFF2",
                                        textAlign: "center",
                                        lineHeight: "16px",
                                        fontWeight: "bolder"
                                    }}
                                >
                                    A
                                </span>
                            }
                        />
                    </Col>
                    <Col span={2} style={{ cursor: "pointer" }}>
                        <Popover
                            placement="topRight"
                            content={
                                <LinkPop
                                    Val={this.link}
                                    btnVal={this.linkType}
                                    delete={e => {
                                        this.handleVisibleChange(
                                            "linkVisible",
                                            e
                                        );
                                        this.handleEditerChange(
                                            "deleteLink",
                                            e
                                        );
                                    }}
                                    linkClick={e => this.linkClick()}
                                    onSave={e => {
                                        this.handleVisibleChange(
                                            "linkVisible",
                                            e
                                        );
                                        this.handleEditerChange("link", e);
                                    }}
                                />
                            }
                            trigger="click"
                            visible={this.state.linkVisible}
                            onVisibleChange={e => {
                                var ss = this.editor.selection.getSelectionText();
                                var link = this.editor.selection.getSelectionContainerElem();
                                if (
                                    !ss &&
                                    (!link ||
                                        (link && link.getNodeName() !== "A")) &&
                                    e
                                ) {
                                    message.error(
                                        "未选择文本，无法设置链接跳转"
                                    );
                                    return false;
                                }
                                var attr = this.editor.selection.getSelectionContainerElem();
                                var target = attr.attr("target");
                                this.linkType = target ? target : "_blank";
                                e && this.linkClick();
                                this.handleVisibleChange("linkVisible", e);
                            }}
                        >
                            <div className="editer-link" />
                        </Popover>
                    </Col>
                </Row>
                <div className="editerEara">
                    <div ref={editorDom => (this.editorDom = editorDom)} />
                </div>
            </div>
        );
    }
}
//图标弹窗
class IconCollapse extends Component {
    constructor(props) {
        super(props);
    }
    iconSelect(e) {
        const target = e.target;
        this.props.onChange &&
            this.props.onChange({
                title: target.getAttribute("title"),
                icon: target.getAttribute("data")
            });
    }
    render() {
        return (
            <Collapse accordion style={{ width: 240 }}>
                {iconConfig2.map((iconCat, i) => {
                    return (
                        <Panel header={iconCat.name} key={i}>
                            <p
                                style={{
                                    wordBreak: "break-all",
                                    wordWrap: "break-word"
                                }}
                                onClick={e => this.iconSelect(e)}
                            >
                                {iconCat.icons.map((icon, ii) => (
                                    <i
                                        key={ii}
                                        title={icon[0]}
                                        data={icon[1]}
                                        className="iconfont"
                                        dangerouslySetInnerHTML={{
                                            __html: icon[1]
                                        }}
                                    />
                                ))}
                            </p>
                        </Panel>
                    );
                })}
            </Collapse>
        );
    }
}
//link弹窗
class LinkPop extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Val: props.Val || "",
            btnVal: props.btnVal || "_blank"
        };
    }
    onChange(e, type) {
        this.setState({
            [type]: e.target.value
        });
    }
    delete() {
        this.props.delete();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            Val: nextProps.Val,
            btnVal: nextProps.btnVal
        });
    }
    save() {
        this.props.onSave(this.state);
    }
    render() {
        return (
            <div style={{ width: 302, paddingTop: 15 }}>
                <Row type="flex" align="middle" style={{ marginBottom: 15 }}>
                    <Col span={6}>URL</Col>
                    <Col span={18}>
                        <Input
                            placeholder="请输入URL连接"
                            value={this.state.Val}
                            onChange={e => this.onChange(e, "Val")}
                        />
                    </Col>
                </Row>
                <Row type="flex" align="middle" style={{ marginBottom: 15 }}>
                    <Col span={6}>打开位置</Col>
                    <Col span={18}>
                        <Radio.Group
                            defaultValue="a"
                            value={this.state.btnVal}
                            onChange={e => this.onChange(e, "btnVal")}
                        >
                            <Radio.Button value="_self">当前窗口</Radio.Button>
                            <Radio.Button value="_blank">新窗口</Radio.Button>
                        </Radio.Group>
                    </Col>
                </Row>
                <Row
                    type="flex"
                    align="middle"
                    justify="end"
                    style={{ marginBottom: 15 }}
                >
                    <Col span={8}>
                        <Button
                            onClick={e => this.delete()}
                            style={{ width: 80, textAlign: "center" }}
                        >
                            删除
                        </Button>
                    </Col>
                    <Col span={7}>
                        <Button
                            onClick={e => this.save()}
                            type="primary"
                            style={{ width: 80, textAlign: "center" }}
                        >
                            确定
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}
export default XEditor;
