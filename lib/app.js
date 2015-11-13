var React = require("react");
var ReactDOM = require("react-dom");
var Router = require("./router.js");
var moment = require("moment");
var client = require("./client.js");
require("moment/locale/de.js");
require("globalize/lib/cultures/globalize.culture.de-CH.js");

moment.locale("de-CH");
require("globalize").culture("de-CH");

client.getSession(function(){
    console.log(data);
    var component = React.createFactory(Router)(data);
    ReactDOM.render(component,document.body)
});
