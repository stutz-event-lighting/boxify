var react = require("react");
module.exports = class FormGroup extends react.Component{
	render(){
		return react.createElement("div",{className:"form-group"+(this.props.errors.length?" has-error":"")},
			react.createElement("label",{className:"control-label "+(this.props.labelClass||"")},this.props.label),
			react.createElement("div",{className:this.props.wrapperClass},
				react.cloneElement(this.props.children,{errors:this.props.errors,onChange:this.props.onChange,value:this.props.value})
			)
		)
	}
}
