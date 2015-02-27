var React = require("react");
var Router = require("./router.js");
console.log("loaded");

var component = Router(data);
React.renderComponent(component,document.body)
