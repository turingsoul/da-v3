import  React,{Component} from 'react';
import App from './App';
import axios from 'axios'
import {Modal, Input,message} from 'antd';
export default class Shot extends Component{
  constructor(props){
      super(props);
      this.state={
        messager:'',
        isRenderApp: null,
        inputPassWord:''
      }
  }
  //判断是否是快照的处理
  _snapShot() {
    let urlParse = window.Dashboard.util.urlParse;
    let path = urlParse("path");
    axios({
      method: "get",
      url: `/xdatainsight/api/repo/files/snapshoot/status?snapshotPath=${path}`,
      responseType: "json",
      headers: {
        "content-type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json"
      }
    }).then((res)=>{
      const data = res.data;
      //快照正常
      if(data.status==200) {
          this.setState({
            isRenderApp: data.private
          })
      }else {
        this.setState({
          messager: data.msg,
          isRenderApp: null
        })
      }
    }).catch((err)=>{

    });
  }
  componentWillMount() {
    this._snapShot();
  }
  componentDidMount(){
    setTimeout(()=>{
      const mask = document.getElementsByClassName("ant-modal-mask")[0];
      if(mask) {
        mask.style.backgroundColor = '#edf1f5';
      }
    },100);
  }
  onChange(inputPassWord){
    this.setState({
      inputPassWord
    })
  }
  handleOk() {
    const {inputPassWord} = this.state;
    let urlParse = window.Dashboard.util.urlParse;
    let path = urlParse("path");
    const _this = this;
    axios({
      method: "get",
      url: `/xdatainsight/api/repo/files/snapshoot/data${path}?code=${inputPassWord}`,
      responseType: "json",
      headers: {
        "content-type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/json"
      }
    })
      .then(response => {
        if (response.status == 200) {
          if(response.data.status )  {
            message.error("密码错误，请重新输入");
          }else {
            sessionStorage.setItem(path, JSON.stringify(response.data));
            _this.setState({
              isRenderApp: false
            });
          }

        }
      })
      .catch(error => {
        message.error("密码错误，请重新输入");
      });

  }
  render(){
    let { isRenderApp,messager,inputPassWord} = this.state;
    return isRenderApp === null ? <div className="snap-error"><div className="content">
      <div className="icon"></div>
      <p className="error-text">{messager}</p>
    </div></div> : isRenderApp === false ? <App/> : <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Modal className="snapModel"
             width={360}
             title="私密分享"
             closable={false}
             visible={true}
             onOk={e=>this.handleOk()}
      >
        <div className="snap-tip">此页面为私密分享，请输入密码</div>
        <div className="snap-content">
          <span>密码:</span>
          <div className="snap-input">
            <Input type="password"
                   width={260}
                   onPressEnter = {e=>this.handleOk()}
                   onChange = {e=>this.onChange(e.target.value)}
                   value={inputPassWord}
            />
          </div>
        </div>
      </Modal>
    </div>
  }
}
