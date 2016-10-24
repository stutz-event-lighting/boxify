var react = require("react");
var Textarea = require("react-autosize-textarea");
module.exports = class Input extends react.Component{
	render(){
		var component = ["select","textarea"].indexOf(this.props.type)>=0?this.props.type:"input";
		if(component == "textarea") component = Textarea;
		var isCheckbox = this.props.type=="checkbox"||this.props.type=="radio";
		var props = Object.assign({},this.props,{
			value:!isCheckbox?this.props.value:undefined,
			checked:isCheckbox?this.props.value:undefined,
			onChange:this.onChange.bind(this),
			onFocus:this.onFocus.bind(this),
			className:(isCheckbox?"":"form-control")+(this.props.errors.length?" has-error":"")+(this.props.className?(" "+this.props.className):""),
		});
		delete props.errors;
		return react.createElement(component,props,this.props.children);
	}
	onChange(e){
		this.props.onChange(this.props.type=="checkbox"||this.props.type=="radio"?e.target.checked:e.target.value);
	}
	onFocus(e){
        if(this.props.selectOnFocus){
            e.target.select();
        }
        if(this.props.onFocus) this.props.onFocus(e);
    }
}
