var react = require("react");
var Select = require("./select");
var client = require("../client");

module.exports = class EquipmentTypeBox extends Select{
    async getLabel(type){
        type = await client.getEquipmentType(type);
        return type.name;
    }

    async getOptions(input){
        if(typeof input == "object") return [];
        var query = {search:input||""};

        var types = await client.findEquipmentTypes(query);
        return types.map(type=>({value:type._id,label:type.name}));
    }
}
