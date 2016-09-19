var cookie = require("cookies-js");
var events = require("events");

class Client extends events.EventEmitter{
    constructor(){
        super();
        this.session = null;
    }

    async getResponse(url,opts){
		opts = opts||{};
        opts.headers = opts.headers||{};
		opts.credentials = "same-origin";
        if(!opts.body && opts.jsonBody){
            opts.body = JSON.stringify(opts.jsonBody);
            opts.headers["Content-Type"] = "application/json";
        }
		var response = await fetch(url,opts);
		if(response.status != 200) {
			var err = new Error(response.statusText);
			err.code = response.status;
			err.message = await response.text();
			throw err;
		};
		return response;
	}
	async getText(url,opts){
		var res = await this.getResponse(url,opts);
		return await res.text();
	}
	async getJson(url,opts){
		var data = await this.getText(url,opts);
		try{
			data = JSON.parse(data);
		}catch(e){
			throw new Error("Response was not valid JSON");
		}
		return data;
	}
	async execute(url,opts){
		await this.getResponse(url,opts);
	}

    async createSession(data){
        var session = await this.getJson("/api/session/create",{methdo:"POST",jsonBody:(data)});
        this.session = session;
        cookie.set("session",this.session._id,{expires:60*60*24*365*100});
    }

    async getSession(){
        this.session = await this.getJson("/api/session")||null;
        if(!this.session) cookie.expire("session");
        this.emit("sessionChange");
    }

    async deleteSession(){
        if(!this.session) throw new Error("Not logged in");
        await this.execute("/api/session/delete");
        delete this.session;
        cookie.expire("session");
    }

    hasPermission(permission){
        if(!this.session) return false;
        return this.session.permissions.indexOf(permission) >= 0;
    }

    hasPermissions(permissions){
        if(!(permissions instanceof Array)) return true;
        for(var i = 0; i < permissions.length; i++){
            if(!this.hasPermission(permissions[i])) return false;
        }
        return true;
    }

    async getEquipmentCategories(){
        return await this.getJson("/api/equipment/categories");
    }

    async createEquipmentCategory(name){
        return await this.getText("/api/equipment/categories/create",{method:"POST",jsonBody:({name:name})});
    }

    async updateEquipmentCategory(id,name){
        await this.execute("/api/equipment/categories/"+id,{method:"POST",jsonBody:({name:name})});
    }

    async deleteEquipmentCategory(id){
        await this.execute("/api/equipment/categories/"+id+"/delete");
    }

    async findEquipmentTags(name){
        return await this.getJson("/api/equipment/tags/find",{method:"POST",jsonBody:({tag:name})});
    }
    async renameEquipmentTag(oldname,newname){
        return await this.getJson("/api/equipment/tags/"+oldname,{method:"POST",jsonBody:({tag:newname})});
    }

    async findEquipmentTypes(opts){
        return await this.getJson("/api/equipment",{method:"POST",jsonBody:(opts)});
    }

    async createEquipmentType(opts){
        return await this.getText("/api/equipment/create",{method:"POST",jsonBody:(opts)});
    }

    async getEquipmentType(id){
        return await this.getJson("/api/equipment/"+id);
    }

    async getEquipmentTypeName(type){
        return await this.getText("/api/equipment/"+type+"/name");
    }

    async saveEquipmentType(id,data){
        await this.execute("/api/equipment/"+id,{method:"POST",jsonBody:(data)});
    }

    async increaseEquipmentCount(id,data){
        await this.execute("/api/equipment/"+id+"/count",{method:"POST",jsonBody:(data)});
    }

    async getEquipmentTypeStock(id,loose){
        return await this.getJson("/api/equipment/"+id+"/stock",{method:"POST",jsonBody:({loose:loose})});
    }

    async getEquipmentTypeItems(id){
        return await this.getJson("/api/equipment/"+id+"/items");
    }

    async getEquipmentTypeGraph(id,from,to){
        return await this.getJson("/api/equipment/"+id+"/graph/"+from+"-"+to);
    }

    async createEquipment(type,opts){
        return await this.getText("/api/equipment/"+type+"/create",{method:"POST",jsonBody:(opts)});
    }

    async getEquipment(type,id){
        return await this.getJson("/api/equipment/"+type+"/"+id);
    }

    async saveEquipment(type,id,data){
        await this.execute("/api/equipment/"+type+"/"+id,{method:"POST",jsonBody:(data)});
    }

    async getEquipmentContainer(type,id){
        return await this.getJson("/api/equipment/"+type+"/"+id+"/container");
    }

    async deleteEquipment(type,id){
        await this.execute("/api/equipment/"+type+"/"+id+"/delete");
    }

    async deleteEquipmentType(id){
        await this.execute("/api/equipment/"+id+"/delete");
    }

    async createContact(opts){
        return await this.getText("/api/contacts/create",{method:"POST",jsonBody:(opts)});
    }

    async findContacts(opts){
        return await this.getJson("/api/contacts/find",{method:"POST",jsonBody:(opts)});
    }

    async getContact(id){
        return await this.getJson("/api/contacts/"+id);
    }

    async updateContact(id,data){
        await this.execute("/api/contacts/"+id,{method:"POST",jsonBody:(data)});
    }

    async updateContactImage(id,image){
        await this.execute("/api/contacts/"+id+"/image",{method:"POST",jsonBody:(image)});
    }

    async createUser(contact){
        return await this.getText("/api/users/create",{method:"POST",jsonBody:({contact:contact})});
    }

    async findUsers(opts){
        return await this.getJson("/api/users/find",{method:"POST",jsonBody:(opts)});
    }

    async getUser(id){
        return await this.getJson("/api/users/"+id);
    }

    async saveUser(id,data){
        await this.execute("/api/users/"+id+"/save",{method:"POST",jsonBody:(data)});
    }

    async setPin(id,pin){
        return await this.execute("/api/users/"+id+"/pin",{method:"POST",jsonBody:({pin:pin})});
    }

    async setPassword(id,password){
        await this.execute("/api/users/"+id+"/password",{method:"POST",jsonBody:({password:password})});
    }

    async deleteUser(id){
        await this.execute("/api/users/"+id+"/delete");
    }

    async createCustomer(contact){
        return await this.getJson("/api/customers/create",{method:"POST",jsonBody:({contact:contact})});
    }

    async findCustomers(opts){
        return await this.getJson("/api/customers/find",{method:"POST",jsonBody:(opts)});
    }

    async deleteCustomer(id){
        await this.execute("/api/customers/"+id+"/delete");
    }

    async findProjects(opts){
        return await this.getJson("/api/projects",{method:"POST",jsonBody:(opts)});
    }

    async createProject(opts){
        return await this.getText("/api/projects/create",{method:"POST",jsonBody:(opts)});
    }

    async getProject(id){
        return await this.getJson("/api/projects/"+id);
    }

    async updateProject(id,opts){
        await this.execute("/api/projects/"+id,{method:"POST",jsonBody:(opts)});
    }

    async finishProject(id){
        await this.execute("/api/projects/"+id+"/finish");
    }

    async deleteProject(id){
        await this.execute("/api/projects/"+id+"/delete");
    }

    async createReservation(project){
        return await this.getText("/api/projects/"+project+"/reservations/create");
    }

    async getReservation(project,id){
        return await this.getJson("/api/projects/"+project+"/reservations/"+id);
    }

    async updateReservation(project,id,items){
        await this.execute("/api/projects/"+project+"/reservations/"+id,{method:"POST",jsonBody:(items)});
    }

    async deleteReservation(project,id){
        await this.execute("/api/projects/"+project+"/reservations/"+id+"/delete");
    }

    async findRentals(opts){
        return await this.getJson("/api/rentals",{method:"POST",jsonBody:(opts)});
    }

    async getRental(id,opts){
        return await this.getJson("/api/rentals/"+id+(opts.project?("?project="+opts.project):""));
    }

    async updateRental(id,opts){
        await this.execute("/api/rentals/"+id,{method:"POST",jsonBody:(opts)});
    }

    async updateRentalStatus(id,status){
        await this.execute("/api/rentals/"+id+"/updatestatus",{method:"POST",jsonBody:({status:status})});
    }

    async deleteRental(id){
        await this.execute("/api/rentals/"+id+"/delete");
    }

    async createEquipmentIo(data){
        return await this.getText("/api/equipmentio/",{method:"POST",jsonBody:(data)});
    }

    async getCheckout(id){
        return await this.getJson("/api/equipmentio/"+id+"/checkout");
    }

    async getCheckin(id){
        return await this.getJson("/api/equipmentio/"+id+"/checkin");
    }

    async updateEquipmentIo(id,data){
        await this.execute("/api/equipmentio/"+id,{method:"POST",jsonBody:(data)});
    }

    async finishEquipmentIo(id){
        await this.execute("/api/equipmentio/"+id+"/finish");
    }

    async deleteEquipmentIo(id){
        await this.execute("/api/equipmentio/"+id+"/delete");
    }

    async createSupplier(contact){
        return await this.getText("/api/suppliers/create",{method:"POST",jsonBody:({contact:contact})});
    }

    async findSuppliers(opts){
        return await this.getJson("/api/suppliers/find",{method:"POST",jsonBody:(opts)});
    }

    async getSupplier(id){
        return await this.getJson("/api/suppliers/"+id);
    }

    async deleteSupplier(id){
        await this.execute("/api/suppliers/"+id+"/delete");
    }
}
module.exports = new Client();
