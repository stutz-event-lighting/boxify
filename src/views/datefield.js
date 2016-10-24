var react = require("react");
var DatePicker = require("react-widgets").DateTimePicker;

module.exports = class Component extends react.Component{
	render(){
		return react.createElement(DatePicker,Object.assign({},this.props,{
			value:this.toDate(this.props.value),
			onChange:this.onChange.bind(this),
			time:false,
			onFocus:this.onFocus.bind(this),
			ref:"field"
		}));
	}
	onChange(date){
		this.props.onChange(this.toDays(date));
	}
	onFocus(e){
		if(this.refs.field._values.open,e.target.tagName == "INPUT"){
			this.refs.field._values.open = "calendar";
			this.refs.field.forceUpdate();
		}
	}
	toDate(days){
		if(days == null) return null;
		var date = new Date(days * 24*60*60*1000);
		return new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate());
	}
	toDays(date){
		return date==null?null:Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/(24*60*60*1000));
	}
}
