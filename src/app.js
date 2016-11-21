var React = require("react");
var ReactDOM = require("react-dom");
var moment = require("moment");
var client = require("./client");
var localize = require("react-widgets/lib/localizers/moment");
var {RootComponent} = require("react-route-system");
require("moment/locale/de");
require("babel-polyfill");
require("whatwg-fetch");

moment.locale("de-CH");
localize(moment);

var App = require("./views/app");

window.onload = async function(){
    await client.getSession();
    ReactDOM.render(React.createElement(RootComponent,{component:App}),document.body)
}
