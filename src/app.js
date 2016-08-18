var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("./router");
var moment = require("moment");
var client = require("./client");
var globalize = require("globalize");
var localize = require("react-widgets/lib/localizers/globalize");
require("moment/locale/de");
require("globalize/lib/cultures/globalize.culture.de-CH");

moment.locale("de-CH");
globalize.culture("de-CH");
localize(globalize);

window.onload = function(){
    client.getSession(function(){
        var component = React.createFactory(Router)({});
        ReactDOM.render(component,document.body)
    });
}
