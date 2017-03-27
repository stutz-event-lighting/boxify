var NumberField = require("./NumberField");
var react = require("react");

module.exports = class IntegerField extends react.Component{
	render(){
		return react.createElement(NumberField,Object.assign({},this.props,{ref:"input",value:typeof this.props.value=="number"?Math.floor(this.props.value):null,onChange:this.onChange.bind(this)}))
	}

	onChange(value){
		this.props.onChange(typeof value =="number"?Math.floor(value):null)
	}

	focus(){
		this.refs.input.focus();
	}

	blur(){
		this.refs.input.blur();
	}
}
