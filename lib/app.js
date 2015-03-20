var React = require("react");
var Router = require("./router.js");
var moment = require("moment");
require("moment/locale/de.js");
require("react-widgets/node_modules/globalize/lib/cultures/globalize.culture.de-CH.js");

moment.locale("de-CH");
require("react-widgets/node_modules/globalize").culture("de-CH");

var component = Router(data);
React.renderComponent(component,document.body)
