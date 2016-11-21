var ReactSelect = require("react-select").Async;
var react = require("react");
module.exports = class Select extends react.Component{
	constructor(props,context){
		super(props,context);
	}
	componentDidMount(){
		this.componentWillReceiveProps(this.props);
		this.mounted = true;
	}
	componentWillUnmount(){
		delete this.mounted;
	}
	componentWillReceiveProps(props){
		this.updateValue(props.value);
	}

	async getLabel(){
		return "";
	}

	async getOptions(){
		return [];
	}

	async updateValue(value,label){
		this.value = value;
		this.label = label;
		this.forceUpdate();
		if(value && !label){
			this.label = await this.getLabel(value);
			if(!this.mounted) return;
			this.forceUpdate();
		}
	}
	render(){
		return react.createElement(ReactSelect,{
			value:this.value?{value:this.value,label:this.label}:null,
			loadOptions:async function(term){
				return {options:await this.getOptions(term)}
			}.bind(this),
			cache:false,
			onChange:this.onChange.bind(this),
			disabled:this.props.disabled,
			ref:"select",
			placeholder:this.props.placeholder
		})
	}
	onChange(val){
		if(val){
			this.updateValue(val.value,val.label);
			this.props.onChange(val.value);
		}else{
			this.updateValue(null);
			this.props.onChange(null);
		}
	}
	focus(){
		this.refs.select.focus();
	}
}
