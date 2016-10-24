var react = require("react");
var money = require("./money");
var Input = require("./input");

module.exports = class Component extends react.Component{
	constructor(props,context){
		super(props,context);
		this.componentWillReceiveProps(props);
	}
	componentWillReceiveProps(props){
		this.value = props.value===null?"":money.format(props.value);
	}
	render(){
		return react.createElement(Input,Object.assign({},this.props,{
			type:"text",
			value:this.value,
			onChange:this.onChange.bind(this),
			onBlur:this.onBlur.bind(this),
			selectOnFocus:true
		}))
	}
	onChange(value){
		this.value = value;
		this.forceUpdate();
	}
	onBlur(){
		var value = parseFloat(this.value);
		if(isNaN(value)){
			value = null;
		}else{
			value = Math.round(value*100);
		}
		this.props.onChange(value);
	}
}
