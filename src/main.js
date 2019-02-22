import React, { Component } from "react";
import App from './App';
import SnapShot from './snapShot';
export default class Main extends  Component{
  constructor(props){
    super(props);
    this.state = {
      isSnap: this.judgeSnopShot()
    }
  }
  judgeSnopShot(){
    let urlParse = window.Dashboard.util.urlParse;
    let path = urlParse("path");
    return /\.xds$/.test(path);
  }
  render(){
    return this.state.isSnap ? <SnapShot></SnapShot> : <App></App>
  }
}