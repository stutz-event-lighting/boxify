var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("./router.js");
var moment = require("moment");
var client = require("./client.js");
var globalize = require("globalize");
var localize = require("react-widgets/lib/localizers/globalize");
require("moment/locale/de.js");
require("globalize/lib/cultures/globalize.culture.de-CH.js");

moment.locale("de-CH");
globalize.culture("de-CH");
localize(globalize);

client.getSession(function(){
    var component = React.createFactory(Router)(data);
    ReactDOM.render(component,document.body)
});
