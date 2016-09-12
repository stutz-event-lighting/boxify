"use strict";

var calcEquipmentBalance = require("../equipment/calculatebalance");

module.exports = function _callee(db, project) {
    var results, needed, rentals, type, timeline, i, rental, start, end, min, current, time;
    return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(db.Project.findOne({ _id: project }).select("start end reserved"));

                case 2:
                    project = _context.sent;

                    if (project) {
                        _context.next = 5;
                        break;
                    }

                    throw new Error("Project does not exist");

                case 5:
                    _context.next = 7;
                    return regeneratorRuntime.awrap(Promise.all([calcEquipmentBalance(db), db.EquipmentRental.find({ return: { $gte: project.start }, delivery: { $lte: project.end }, status: { $in: ["requested", "booked"] } }).select("delivery return items")]));

                case 7:
                    results = _context.sent;
                    needed = results[0];
                    rentals = results[1];


                    for (type in needed) {
                        needed[type] = -needed[type].count;
                    }

                    //create timeline out of all projects
                    timeline = {};

                    for (i = 0; i < rentals.length; i++) {
                        rental = rentals[i];
                        start = timeline[rental.delivery];

                        if (!start) timeline[rental.delivery] = start = {};
                        end = timeline[rental.return];

                        if (!end) timeline[rental.return] = end = {};
                        for (type in rental.items) {
                            if (start[type] === undefined) start[type] = 0;
                            start[type] += rental.items[type].count;
                            if (end[type] === undefined) end[type] = 0;
                            end[type] -= rental.items[type].count;
                        }
                    }
                    timeline = Object.keys(timeline).map(function (time) {
                        return parseFloat(time);
                    }).sort().map(function (time) {
                        return { time: time, types: timeline[time] };
                    });

                    //find the lowest count for every type in the timeline
                    min = {};

                    if (!timeline.length) {
                        _context.next = 30;
                        break;
                    }

                    current = timeline[0].types;
                    i = 1;

                case 18:
                    if (!(i < timeline.length)) {
                        _context.next = 29;
                        break;
                    }

                    if (!(timeline[i].time >= project.end)) {
                        _context.next = 21;
                        break;
                    }

                    return _context.abrupt("break", 29);

                case 21:
                    time = timeline[i].types;

                    for (type in time) {
                        current[type] += time[type];
                    }

                    if (!(timeline[i].time < project.start)) {
                        _context.next = 25;
                        break;
                    }

                    return _context.abrupt("continue", 26);

                case 25:
                    for (type in current) {
                        if (!min[type] || current[type] < min[type]) {
                            min[type] = current[type];
                        }
                    }

                case 26:
                    i++;
                    _context.next = 18;
                    break;

                case 29:
                    for (type in current) {
                        if (min[type] === undefined) min[type] = current[type];
                    }

                case 30:

                    //add the lowest reservation count of each type to the available count
                    for (type in min) {
                        needed[type] -= min[type];
                    }

                    //calculate the needed value for each type
                    for (type in project.reserved) {
                        needed[type] += project.reserved[type];
                        if (needed[type] <= 0) {
                            delete needed[type];
                        }
                    }
                    return _context.abrupt("return", needed);

                case 33:
                case "end":
                    return _context.stop();
            }
        }
    }, null, this);
};