import React ,{ Component } from 'react';
import {Row, Col, Switch,Select} from 'antd';
import { connect } from "react-redux";
const Option = Select.Option;
import _ from 'lodash';
import axios from "axios";

const defaultMapStyleArr = {
    "online" : {
        name : "在线地图",
        value : "online",
        option : [
            {
                name:'标准',
                value:'Normal'
            },
            {
                name:'午夜蓝',
                value:'PurplishBlue'
            },
            {
                name:'灰色',
                value:'Gray'
            },
            {
                name:'暖色',
                value:'Warm'
            },
            {
                name:'精简',
                value:'Light'
            },
            {
                name:'卫星',
                value:'Satellite'
            }
        ]
    }
};
//从后台来的数据格式如下
// let test = {
//     "online" : {
//         name : "在线地图",
//         value : "online",
//         option : [
//             {
//                 name:'标准',
//                 value:'Normal'
//             }
//         ]
//     },
//     "offline" : {
//         name : "离线地图",
//         value : "offline",
//         url : "http://172.27.9.24:8080/geowebcache/service/wms" ,     
//         option : [
//             {
//                 name:'路网地图',
//                 value:'GoogleRoad'
//             },
//             {
//                 name:'卫星地图',
//                 value:'GoogleImage'
//             }
//         ]
//     }
// }

class XSwitchMap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }

    componentWillMount(){
        this.props.mapcfg || this.fetchData();
    }
    
    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
        }); 
    }

    shouldComponentUpdate(nextProps,nextState) {
        if( _.isEqual(nextState, this.state) &&
                            (nextProps.value === this.state.value) && 
                            (nextProps.name === this.props.name) && _.isEqual(defaultMapStyleArr, this.props.mapcfg)
                            ) {
            return false;
        }
        return true;
    }

    onChangeSource(e) {
        let next = Object.assign({}, this.state.value);
        let options = this.props.mapcfg || defaultMapStyleArr;
        next[0] = e;
        next[1] = options[e].option[0].value;
        next[2] = options[next[0]].url
        this.setState({
            value: next
        },()=>{
            this.props.onChange && this.props.onChange(next);
        })
    }

    onChangeStyle(e) {
        let next = Object.assign({}, this.state.value);
        let options = this.props.mapcfg || defaultMapStyleArr;
        next[1] = e;
        next[2] = options[next[0]].url
        this.setState({
            value: next
        },()=>{
            this.props.onChange && this.props.onChange(next);
        })
    }

    fetchData() {
        const {addmapcfg} = this.props;
        axios({
            method: "get",
            url: "/xdatainsight/api/user-settings/getMapConfig",
            responseType: "json"
        }).then(response => {
            if (response.status == 200) {
                addmapcfg(response.data);
            }
        });
    }

    render() {
        let options = this.props.mapcfg || defaultMapStyleArr;
        let optionsKey = Object.keys(options);

        let subOption = null;
        if(options[this.state.value[0]]){
            subOption = options[this.state.value[0]]
        }else{
            subOption = options['online']
        }
        
        return( 
            <div>
                <Row type="flex" align="middle" >
                    <Col span={6}>地图来源</Col>
                    <Col span={18}>
                        <Select value={this.state.value[0]} onChange={e => this.onChangeSource(e)} style={{width: '100%'}}>
                            {
                                optionsKey.map((option,i) => <Option key={i} value={options[option].value}>{options[option].name}</Option>)
                            }
                        </Select>
                    </Col>
                </Row>
                <Row type="flex" align="middle" >
                    <Col span={6}>地图风格</Col>
                    <Col span={18}>
                        <Select value={this.state.value[1]} onChange={e => this.onChangeStyle(e)} style={{width: '100%'}}>
                            {   
                                subOption.option.map((option,i) => <Option key={i} value={option.value}>{option.name}</Option>)
                            }
                        </Select>
                    </Col>
                </Row>
            </div>
        )
    }
}
// Map Redux state to component props
function mapStateToProps(state) {
    return {
        mapcfg: state.canvas.mapcfg
    };
}

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        addmapcfg: mapcfg => {
            dispatch({
                type: "ADD_MAP_CFG",
                mapcfg
            });
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(XSwitchMap);

// export default XSwitchMap;