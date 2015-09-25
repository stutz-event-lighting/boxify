var React = require("react");
var Router = require("./router.js");
var moment = require("moment");
var client = require("./client.js");
require("moment/locale/de.js");
require("globalize/lib/cultures/globalize.culture.de-CH.js");

moment.locale("de-CH");
require("globalize").culture("de-CH");

client.getSession(function(){
    var component = Router(data);
    React.renderComponent(component,document.body)
});
