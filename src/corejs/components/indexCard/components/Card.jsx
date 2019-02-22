/**
 * 指标卡组件
 * props:
 * title                   [String]  指标卡主标题
 * direction               [String]  指标排列方式 portrait-纵向 transverse-横向
 * list                    [Array]
 * list[n]                 [Object]  子指标卡
 * list[n].name            [String]  子指标卡名称           
 * 
 * list[n].mIndex          [Object]  主指标           
 * list[n].mIndex.title    [String]  主指标标题          
 * list[n].mIndex.value    [Nunber]  主指标值       
 * 
 * list[n].sIndex          [Object]  副指标   
 * list[n].sIndex.title    [String]  副指标标题         
 * list[n].sIndex.value    [Nunber]  副指标值    
 */
import React, { Component } from "react";
import $ from "jquery";
import _ from 'underscore';
import IndexCard from "../widget.class";

function ICard(props){
    let { item,itemW,style,direction } = props;
    let hasSindex = true;

    if(_.isUndefined(item.sIndex.value) && _.isUndefined(item.sIndex.title)){
        hasSindex = false;
    }
    
    return (
        <div
            className={"icard"}
            style={{
                width: itemW
            }}
        >
            {
                item.name && (
                    <div className="icard-name no-wrap" style={style.name}>
                        {item.name}
                    </div>
                )
            }
            <div className="icard-split" style={style.split}/>
            {
                direction === "portrait" ? (
                    <div className="icard-portrait">
                        <div className="icard-row">
                            <div className="icard-title__m no-wrap"  style={{
                                ...style.mIndexTitle,
                                textAlign:'center'
                            }}>
                                <span title={item.mIndex.title}>{item.mIndex.title}</span>
                            </div>
                        </div>
                        <div className="icard-row">
                            <div className="icard-value__m"  style={{
                                ...style.mIndexValue,
                                textAlign:'center'
                            }}>
                                {item.mIndex.value}
                            </div>
                        </div>
                        {
                            hasSindex && (
                                <div className="icard-row">
                                    <div className="icard-title__s no-wrap"  style={{
                                        ...style.sIndexTitle,
                                        maxWidth:'60%',
                                        paddingRight: '3px'
                                    }}>
                                        <span title={item.sIndex.title}>{item.sIndex.title}</span>
                                    </div>
                                    <div className="icard-value__s  no-wrap"  style={{
                                        ...style.sIndexValue,
                                        maxWidth:'40%',
                                        paddingLeft: '3px'
                                    }}>
                                        {item.sIndex.value}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                ):(
                    <div className="icard-transverse">
                        <div className="icard-row">
                            <div className="icard-value__m"  style={{
                                ...style.mIndexValue,
                                textAlign:'center',
                                width: hasSindex?'60%':'100%'
                            }}>
                                {item.mIndex.value}
                            </div>
                            <div className="icard-value__s"  style={{
                                ...style.sIndexValue,
                                textAlign:'center',
                                width: hasSindex?'40%':'0'
                            }}>
                                {item.sIndex.value}
                            </div>
                        </div>
                        <div className="icard-row">
                            <div className="icard-title__m no-wrap"  style={{
                                ...style.mIndexTitle,
                                textAlign:'center',
                                width: hasSindex?'60%':'100%'
                            }}>
                                <span title={item.mIndex.title}>{item.mIndex.title}</span>
                            </div>
                            <div className="icard-title__s no-wrap"  style={{
                                ...style.sIndexTitle,
                                textAlign:'center',
                                width: hasSindex?'40%':'0'
                            }}>
                                <span title={item.sIndex.title}>{item.sIndex.title}</span>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default class Card extends Component {
    constructor(props) {
        super(props);
        let state = {
            title: "指标卡",
            direction: "portrait",
            list: [],
            style:{
                indexcard:{},
                title:{},
                name:{},
                mIndexValue:{},
                mIndexTitle:{},
                sIndexValue:{},
                sIndexTitle:{},
                split:{}
            }
        };
        this.state = $.extend(state, props.options || {});
    }
    render() {
        let { title, list, direction,style } = this.state;
        let itemW;
        let listLen;
        
        listLen = list.length;

        itemW = listLen > 0 ? (1 * 100) / listLen + "%" : 0;

        if(direction === 'transverse'){
            if(style.mIndexTitle.display === 'none'){
                style.sIndexTitle.marginLeft = '60%';
            }
        }

        return (
            <div className="indexcard" style={style.indexcard}>
                {
                    title && <div className="indexcard-title no-wrap" style={style.title}>{title}</div>
                }
                <div className="indexcard-list">
                    {listLen>0?
                    list.map((item, index) => (
                        <ICard key={index} {...{item,itemW,style,direction}}/>
                    ))
                    :(<div className="no-data"></div>)
                }
                </div>
            </div>
        );
    }
}
