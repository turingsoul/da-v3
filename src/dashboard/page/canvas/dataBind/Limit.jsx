/**
 * 字段框
 * create time: 2018/8/28
 */
import React, { Component } from "react";
import { AutoComplete, message,Menu,Input, Dropdown } from "antd";
import { connect } from "react-redux";

const Option = AutoComplete.Option;
const DEFAULT_PROPS = {
    options: [
        { value: 100, name: "100" },
        { value: 200, name: "200" },
        { value: 300, name: "300" },
        { value: 1000, name: "1000" },
        { value: -1, name: "不限制" }
    ]
};

class Limit extends Component {
    constructor(props) {
        super();
        this.state = {
            value: props.top,
            dropdownShow:false
        };
        //缓存最后一次正确的值，当校验用户输入不正确后，用于还原
        this.lastRightValue = this.state.value;
    }

    valid(v) {
        let result = false;
        if (v === -1) {
            result = true;
        }
        if (v > 0 && !/\./.test(String(v))) {
            result = true;
        }

        if (result) {
            this.lastRightValue = v;
        } else {
            this.setState({
                value: this.lastRightValue
            });
        }

        return result;
    }

    //处理输入值
    handleValue(value){
        let { onSelectChange } = this.props

        value = Number(value || "");

        if (!this.valid(value)) {
            message.error("请输入正整数");
            return;
        } else {
            this.setState({ value });
            onSelectChange(value);
        }
    }

    render() {
        const props = Object.assign({}, DEFAULT_PROPS, this.props);
        let { className, onSelectChange, options } = props;
        let { value, dropdownShow } = this.state;

        return (
            <div className={className}>
                显示前
                <Dropdown 
                visible={dropdownShow}
                overlay={
                    <Menu onClick={(e)=>{
                        this.setState({
                            value:e.key
                        })
                    }}>
                        {
                            options.map(item=><Menu.Item key={item.value}>{item.name}</Menu.Item>)
                        }
                    </Menu>
                }>
                    <Input 
                        ref='input'
                        size='small' 
                        value={ value }
                        style={{ width: "90px", margin: "0 5px" }}
                        onChange={(e)=>{
                            this.setState({
                                value:e.target.value
                            })
                        }}
                        onFocus={(e)=>{
                            this.setState({
                                dropdownShow:true
                            })
                        }}
                        onPressEnter={e=>{
                            this.refs.input.blur();
                        }}
                        onBlur={(e)=>{
                            this.handleValue( this.state.value );

                            //直接关闭弹出下拉，会导致menu item click不会被响应，此处加个延时
                            setTimeout(()=>{
                                this.setState({
                                    dropdownShow:false
                                })
                            },100)
                        }}
                    />
                </Dropdown>
                行数据
            </div>
        );
    }
}

// Map Redux state to component props
function mapStateToProps(state) {
    return {
        top: state.databind.limit.top
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onSelectChange: value => {
            dispatch({
                type: "CHANGE_TOPN",
                topN: value
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Limit);
