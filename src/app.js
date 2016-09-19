var React = require("react");
var ReactDOM = require("react-dom");
var moment = require("moment");
var client = require("./client");
var globalize = require("globalize");
var localize = require("react-widgets/lib/localizers/globalize");
var {RootComponent} = require("react-route-system");
require("moment/locale/de");
require("globalize/lib/cultures/globalize.culture.de-CH");
require("babel-polyfill");
require("whatwg-fetch");

moment.locale("de-CH");
globalize.culture("de-CH");
localize(globalize);

var App = require("./views/app");

window.onload = async function(){
    await client.getSession();
    ReactDOM.render(React.createElement(RootComponent,{component:App}),document.body)
}
