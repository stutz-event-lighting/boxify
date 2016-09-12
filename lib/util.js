"use strict";

exports.createIndex = function (arr, key) {
    var index = {};
    for (var i = 0; i < arr.length; i++) {
        index[arr[i][key] + ""] = arr[i];
    }
    return index;
};