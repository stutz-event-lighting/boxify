"use strict";

var cookie = require("cookies-js");
var events = require("events");

function Client() {
    events.EventEmitter.call(this);
    this.session = null;
}

Client.prototype = Object.create(events.EventEmitter.prototype);

Client.prototype.fetch = function (url, data, cb) {
    var req = new XMLHttpRequest();
    req.open(data ? "POST" : "GET", url);
    req.setRequestHeader("Content-Type", "application/json");
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status != 200) {
                var err = new Error(req.status + " - " + req.statusMessage);
                err.code = req.status;
                cb(err);
            } else {
                cb(null, req.responseText);
            }
        }
    };
    req.send(data);
};
Client.prototype.fetchJSON = function (url, data, cb) {
    this.fetch(url, data, function (err, data) {
        if (err) return cb(err);
        try {
            data = JSON.parse(data);
        } catch (e) {
            return cb(new Error("Got invalid JSON"));
        }
        cb(null, data);
    });
};

Client.prototype.createSession = function (data, cb) {
    this.fetchJSON("/api/session/create", JSON.stringify(data), function (err, session) {
        if (!err) {
            this.session = session;
            cookie.set("session", this.session._id, { expires: 60 * 60 * 24 * 365 * 100 });
        }
        cb(err, session);
    }.bind(this));
};

Client.prototype.getSession = function (cb) {
    this.fetchJSON("/api/session", null, function (err, session) {
        this.session = session || null;
        if (!session) cookie.expire("session");
        this.emit("sessionChange");
        cb(err, session);
    }.bind(this));
};

Client.prototype.deleteSession = function (cb) {
    if (!this.session) return cb(new Error("Not logged in"));
    this.fetch("/api/session/delete", null, function () {
        delete this.session;
        cookie.expire("session");
        cb();
    }.bind(this));
};

Client.prototype.hasPermission = function (permission) {
    if (!this.session) return false;
    return this.session.permissions.indexOf(permission) >= 0;
};

Client.prototype.hasPermissions = function (permissions) {
    if (!(permissions instanceof Array)) return true;
    for (var i = 0; i < permissions.length; i++) {
        if (!this.hasPermission(permissions[i])) return false;
    }
    return true;
};

Client.prototype.getEquipmentCategories = function (cb) {
    this.fetchJSON("/api/equipment/categories", null, cb);
};

Client.prototype.createEquipmentCategory = function (name, cb) {
    this.fetch("/api/equipment/categories/create", JSON.stringify({ name: name }), cb);
};

Client.prototype.updateEquipmentCategory = function (id, name, cb) {
    this.fetch("/api/equipment/categories/" + id, JSON.stringify({ name: name }), cb);
};

Client.prototype.deleteEquipmentCategory = function (id, cb) {
    this.fetch("/api/equipment/categories/" + id + "/delete", null, cb);
};

Client.prototype.findEquipmentTags = function (name, cb) {
    this.fetchJSON("/api/equipment/tags/find", JSON.stringify({ tag: name }), cb);
};
Client.prototype.renameEquipmentTag = function (oldname, newname, cb) {
    this.fetchJSON("/api/equipment/tags/" + oldname, JSON.stringify({ tag: newname }), cb);
};

Client.prototype.findEquipmentTypes = function (opts, cb) {
    this.fetchJSON("/api/equipment", JSON.stringify(opts), cb);
};

Client.prototype.createEquipmentType = function (opts, cb) {
    this.fetch("/api/equipment/create", JSON.stringify(opts), cb);
};

Client.prototype.getEquipmentType = function (id, cb) {
    this.fetchJSON("/api/equipment/" + id, null, cb);
};

Client.prototype.getEquipmentTypeName = function (type, cb) {
    this.fetch("/api/equipment/" + type + "/name", null, cb);
};

Client.prototype.saveEquipmentType = function (id, data, cb) {
    this.fetch("/api/equipment/" + id, JSON.stringify(data), cb);
};

Client.prototype.increaseEquipmentCount = function (id, data, cb) {
    this.fetch("/api/equipment/" + id + "/count", JSON.stringify(data), cb);
};

Client.prototype.getEquipmentTypeStock = function (id, loose, cb) {
    this.fetchJSON("/api/equipment/" + id + "/stock", JSON.stringify({ loose: loose }), cb);
};

Client.prototype.getEquipmentTypeItems = function (id, cb) {
    this.fetchJSON("/api/equipment/" + id + "/items", null, cb);
};

Client.prototype.getEquipmentTypeGraph = function (id, from, to, cb) {
    this.fetchJSON("/api/equipment/" + id + "/graph/" + from + "-" + to, null, cb);
};

Client.prototype.createEquipment = function (type, opts, cb) {
    this.fetch("/api/equipment/" + type + "/create", JSON.stringify(opts), cb);
};

Client.prototype.getEquipment = function (type, id, cb) {
    this.fetchJSON("/api/equipment/" + type + "/" + id, null, cb);
};

Client.prototype.saveEquipment = function (type, id, data, cb) {
    this.fetch("/api/equipment/" + type + "/" + id, JSON.stringify(data), cb);
};

Client.prototype.getEquipmentContainer = function (type, id, cb) {
    this.fetchJSON("/api/equipment/" + type + "/" + id + "/container", null, cb);
};

Client.prototype.deleteEquipment = function (type, id, cb) {
    this.fetch("/api/equipment/" + type + "/" + id + "/delete", null, cb);
};

Client.prototype.deleteEquipmentType = function (id, cb) {
    this.fetch("/api/equipment/" + id + "/delete", null, cb);
};

Client.prototype.createContact = function (opts, cb) {
    this.fetch("/api/contacts/create", JSON.stringify(opts), cb);
};

Client.prototype.findContacts = function (opts, cb) {
    this.fetchJSON("/api/contacts/find", JSON.stringify(opts), cb);
};

Client.prototype.getContact = function (id, cb) {
    this.fetchJSON("/api/contacts/" + id, null, cb);
};

Client.prototype.updateContact = function (id, data, cb) {
    this.fetch("/api/contacts/" + id, JSON.stringify(data), cb);
};

Client.prototype.updateContactImage = function (id, image, cb) {
    this.fetch("/api/contacts/" + id + "/image", JSON.stringify(image), cb);
};

Client.prototype.createUser = function (contact, cb) {
    this.fetch("/api/users/create", JSON.stringify({ contact: contact }), cb);
};

Client.prototype.findUsers = function (opts, cb) {
    this.fetchJSON("/api/users/find", JSON.stringify(opts), cb);
};

Client.prototype.getUser = function (id, cb) {
    this.fetchJSON("/api/users/" + id, null, cb);
};

Client.prototype.saveUser = function (id, data, cb) {
    this.fetch("/api/users/" + id + "/save", JSON.stringify(data), cb);
};

Client.prototype.setPin = function (id, pin, cb) {
    this.fetch("/api/users/" + id + "/pin", JSON.stringify({ pin: pin }), cb);
};

Client.prototype.setPassword = function (id, password, cb) {
    this.fetch("/api/users/" + id + "/password", JSON.stringify({ password: password }), cb);
};

Client.prototype.deleteUser = function (id, cb) {
    this.fetch("/api/users/" + id + "/delete", null, cb);
};

Client.prototype.createCustomer = function (contact, cb) {
    this.fetch("/api/customers/create", JSON.stringify({ contact: contact }), cb);
};

Client.prototype.findCustomers = function (opts, cb) {
    this.fetchJSON("/api/customers/find", JSON.stringify(opts), cb);
};

Client.prototype.deleteCustomer = function (id, cb) {
    this.fetch("/api/customers/" + id + "/delete", null, cb);
};

Client.prototype.findProjects = function (opts, cb) {
    this.fetchJSON("/api/projects", JSON.stringify(opts), cb);
};

Client.prototype.createProject = function (opts, cb) {
    this.fetch("/api/projects/create", JSON.stringify(opts), cb);
};

Client.prototype.getProject = function (id, cb) {
    this.fetchJSON("/api/projects/" + id, null, cb);
};

Client.prototype.updateProject = function (id, opts, cb) {
    this.fetch("/api/projects/" + id, JSON.stringify(opts), cb);
};

Client.prototype.finishProject = function (id, cb) {
    this.fetch("/api/projects/" + id + "/finish", null, cb);
};

Client.prototype.deleteProject = function (id, cb) {
    this.fetch("/api/projects/" + id + "/delete", null, cb);
};

Client.prototype.createReservation = function (project, cb) {
    this.fetch("/api/projects/" + project + "/reservations/create", null, cb);
};

Client.prototype.getReservation = function (project, id, cb) {
    this.fetchJSON("/api/projects/" + project + "/reservations/" + id, null, cb);
};

Client.prototype.updateReservation = function (project, id, items, cb) {
    this.fetch("/api/projects/" + project + "/reservations/" + id, JSON.stringify(items), cb);
};

Client.prototype.deleteReservation = function (project, id, cb) {
    this.fetch("/api/projects/" + project + "/reservations/" + id + "/delete", null, cb);
};

Client.prototype.findRentals = function (opts, cb) {
    this.fetchJSON("/api/rentals", JSON.stringify(opts), cb);
};

Client.prototype.getRental = function (id, opts, cb) {
    this.fetchJSON("/api/rentals/" + id + (opts.project ? "?project=" + opts.project : ""), null, cb);
};

Client.prototype.updateRental = function (id, opts, cb) {
    this.fetch("/api/rentals/" + id, JSON.stringify(opts), cb);
};

Client.prototype.updateRentalStatus = function (id, status, cb) {
    this.fetch("/api/rentals/" + id + "/updatestatus", JSON.stringify({ status: status }), cb);
};

Client.prototype.deleteRental = function (id, cb) {
    this.fetch("/api/rentals/" + id + "/delete", null, cb);
};

Client.prototype.createEquipmentIo = function (data, cb) {
    this.fetch("/api/equipmentio/", JSON.stringify(data), cb);
};

Client.prototype.getCheckout = function (id, cb) {
    this.fetchJSON("/api/equipmentio/" + id + "/checkout", null, cb);
};

Client.prototype.getCheckin = function (id, cb) {
    this.fetchJSON("/api/equipmentio/" + id + "/checkin", null, cb);
};

Client.prototype.updateEquipmentIo = function (id, data, cb) {
    this.fetch("/api/equipmentio/" + id, JSON.stringify(data), cb);
};

Client.prototype.finishEquipmentIo = function (id, cb) {
    this.fetch("/api/equipmentio/" + id + "/finish", null, cb);
};

Client.prototype.deleteEquipmentIo = function (id, cb) {
    this.fetch("/api/equipmentio/" + id + "/delete", null, cb);
};

Client.prototype.createSupplier = function (contact, cb) {
    this.fetch("/api/suppliers/create", JSON.stringify({ contact: contact }), cb);
};

Client.prototype.findSuppliers = function (opts, cb) {
    this.fetchJSON("/api/suppliers/find", JSON.stringify(opts), cb);
};

Client.prototype.getSupplier = function (id, cb) {
    this.fetchJSON("/api/suppliers/" + id, null, cb);
};

Client.prototype.deleteSupplier = function (id, cb) {
    this.fetch("/api/suppliers/" + id + "/delete", null, cb);
};
module.exports = new Client();