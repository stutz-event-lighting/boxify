var react = require("react");
var Select = require("./select");
var client = require("../client");

module.exports = class EquipmentItemBox extends Select{
    async getLabel(value){
        var type = await client.getEquipmentType(this.props.type);
        return type.name+" "+value;
    }

    async getOptions(input){
        if(typeof input == "object") return [];
		var [type,items] = await Promise.all([
			client.getEquipmentType(this.props.type),
			client.getEquipmentTypeItems(this.props.type)
		]);
        return items.map(item=>({value:item.id,label:type.name+" "+item.id}));
    }
}
