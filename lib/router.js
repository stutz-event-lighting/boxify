"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require("react");
var pathToRegexp = require("path-to-regexp");
var client = require("./client");
var routes = require("./routes");
var bs = require("./barcodescanner");
bs.start();

module.exports = function (_React$Component) {
    _inherits(Router, _React$Component);

    function Router(props, context) {
        _classCallCheck(this, Router);

        var _this = _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).call(this, props, context));

        _this.routes = [];
        for (var path in routes) {
            var route = {
                path: path,
                component: routes[path],
                keys: []
            };
            route.regexp = pathToRegexp(route.path, route.keys);
            _this.routes.push(route);
        }

        var self = _this;
        var clearStateOnBack = false;
        var callbacks = {};
        var nextcallbackid = 1;

        window.visit = function (url, data, cb) {
            if (cb) {
                var id = nextcallbackid++;
                callbacks[id] = cb;
                var state = history.state;
                state.history_callback_id = id;
                history.replaceState(state, undefined, location.pathname);
            }
            history.pushState(data || {}, null, url);
            self.state.state = data;
            self.forceUpdate();
        };

        window.back = function (clear) {
            if (clear) {
                clearStateOnBack = true;
            }
            history.back();
        };

        window.onpopstate = function (e) {
            if (clearStateOnBack) {
                delete e.state;
                clearStateOnBack = false;
            }
            if (e.state) {
                var callbackid = e.state.history_callback_id;
                delete e.state.history_callback_id;
                if (callbackid) {
                    var callback = callbacks[callbackid];
                    delete callbacks[callbackid];
                    callback(e.state);
                }
            }
            self.state.state = e.state || {};
            self.forceUpdate();
        };

        _this.onScan = function (code) {
            if (!this.refs.component.handleScan || this.refs.component.handleScan(code)) {
                switch (code.kind) {
                    case "EQ":
                        if (code.item) {
                            visit("/equipment/" + code.type + "/" + code.item);
                        } else {
                            visit("/equipment/" + code.type);
                        }
                        break;
                }
            }
        }.bind(_this);

        _this.state = { state: {} };
        return _this;
    }

    _createClass(Router, [{
        key: "findHighestLink",
        value: function findHighestLink(link) {
            var highestLink = null;
            while (link && link != document.body) {
                if (link.tagName == "A") highestLink = link;
                link = link.parentNode;
            }
            return highestLink;
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.onLinkClicked = function (e) {
                if (e.which !== 1) return;
                var link = this.findHighestLink(e.target);
                if (link && link.hostname == location.hostname) {
                    if (this.route(link.pathname)) {
                        if (link.getAttribute("href") == "#") return;
                        visit(link.pathname);
                        e.preventDefault();
                        return false;
                    }
                }
            }.bind(this);
            document.addEventListener("click", this.onLinkClicked);
            bs.on("scan", this.onScan);
            client.on("sessionChange", this.forceUpdate.bind(this));
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            document.removeEventListener("click".this.onLinkClicked);
            bs.removeListener("scan", this.onScan);
        }
    }, {
        key: "render",
        value: function render(state) {
            var route = this.route(location.pathname);
            return React.createFactory(route.component)({ ref: "component", state: this.state.state || {}, params: route.params }, []);
        }
    }, {
        key: "route",
        value: function route(path) {
            for (var i = 0; i < this.routes.length; i++) {
                var result = this.routes[i].regexp.exec(path);
                if (result) {
                    var params = {};
                    for (var j = 0; j < this.routes[i].keys.length; j++) {
                        params[this.routes[i].keys[j].name] = result[j + 1];
                    }
                    return { component: this.routes[i].component, params: params };
                }
            }
            return false;
        }
    }]);

    return Router;
}(React.Component);