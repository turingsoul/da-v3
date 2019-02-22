/**
 * 异步组件
 * let ComA = asyncCom(()=>import('XXX/XXX'));
 * 
 * <ComA/>
 * 
 */
import React, {Component} from 'react';

const asyncComponent = (importComponent) => {
	return class extends Component {
		state = {
			component: null
		}
		
		componentDidMount() {
			importComponent() //我们传进来的函数返回我们想要的组件B
				.then(cmp => {
					this.setState({component: cmp.default}); //把组件B存起来
				});
		}
		
		render() {
			const Com = this.state.component; //渲染的时候把组件B拿出来
			return Com ? <Com {...this.props}/> : null; //返回的其实就是组件B，并且把传给A的属性也转移到B上
		}
	}
};

export default asyncComponent;