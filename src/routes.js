var _require = require;
require = function(path){
	try{
		window;
		return _require(path);
	}catch(e){}
}
module.exports = {
	"/":require("./views/main"),
	"/equipment":require("./views/equipment"),
	"/equipment/categories":require("./views/equipmentcategories"),
	"/equipment/:type":require("./views/equipmenttype"),
	"/equipment/:type/:id":require("./views/equipmentitem"),
	"/contacts/:contact":require("./views/contact"),
	"/users":require("./views/users"),
	"/users/:user":require("./views/user"),
	"/customers":require("./views/customers"),
	"/customers/:customer":require("./views/customer"),
	"/suppliers":require("./views/suppliers"),
	"/suppliers/:supplier":require("./views/supplier"),
	"/projects":require("./views/projects"),
	"/projects/:id":require("./views/project"),
	"/projects/:project/reservations/:reservation":require("./views/reservation"),
	"/projects/:project/checkouts/:checkout":require("./views/checkout"),
	"/projects/:project/checkins/:checkin":require("./views/checkin"),
	"/rentals":require("./views/rentals"),
	"/rentals/:rental":require("./views/rental"),
	"/profile":require("./views/profile")
};
