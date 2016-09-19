"use strict";

var React = require("react");
var pathToRegexp = require("path-to-regexp");
var client = require("./client");
var routes = require("./routes");
var bs = require("./barcodescanner");
bs.start();

module.exports = class Router extends React.Component{
    constructor(props,context){
        super(props,context);

        this.routes = [];
        for(var path in routes){
            var route = {
                path:path,
                component:routes[path],
                keys:[]
            };
            route.regexp = pathToRegexp(route.path,route.keys);
            this.routes.push(route);
        }
        var clearStateOnBack = false;
        var callbacks = {};
        var nextcallbackid = 1;

        window.visit = function(url,data,cb){
            if(cb){
                var id = nextcallbackid++;
                callbacks[id] = cb;
                var state = history.state;
                state.history_callback_id = id;
                history.replaceState(state,undefined,location.pathname);
            }
            history.pushState(data||{},null,url);
            this.state.state = data;
            this.forceUpdate();
        }.bind(this)

        window.back = function(clear){
            if(clear){
                clearStateOnBack = true;
            }
            history.back();
        }

        window.onpopstate = function(e){
            if(clearStateOnBack){
                delete e.state;
                clearStateOnBack = false;
            }
            if(e.state){
                var callbackid = e.state.history_callback_id;
                delete e.state.history_callback_id;
                if(callbackid){
                    var callback = callbacks[callbackid];
                    delete callbacks[callbackid];
                    callback(e.state);
                }
            }
            this.state.state = e.state||{};
            this.forceUpdate();
        }.bind(this)

        this.onScan = function(code){
            if(!this.refs.component.handleScan || this.refs.component.handleScan(code)){
                switch(code.kind){
                    case "EQ":
                        if(code.item){
                            visit("/equipment/"+code.type+"/"+code.item);
                        }else{
                            visit("/equipment/"+code.type)
                        }
                        break;
                }
            }
        }.bind(this)

        this.state = {state:{}};
    }
    findHighestLink(link){
        var highestLink = null;
        while(link && link != document.body){
            if(link.tagName == "A") highestLink = link;
            link = link.parentNode;
        }
        return highestLink;
    }
    componentDidMount(){
        this.onLinkClicked = function(e){
            if(e.which !== 1) return;
            var link = this.findHighestLink(e.target);
            if(link && link.hostname == location.hostname){
                if(this.route(link.pathname)){
                    if(link.getAttribute("href") == "#") return ;
                    visit(link.pathname);
                    e.preventDefault();
                    return false;
                }
            }
        }.bind(this);
        document.addEventListener("click",this.onLinkClicked);
        bs.on("scan",this.onScan);
        client.on("sessionChange",this.forceUpdate.bind(this));
    }
    componentWillUnmount(){
        document.removeEventListener("click".this.onLinkClicked);
        bs.removeListener("scan",this.onScan);
    }
    render(state){
        var route = this.route(location.pathname);
        return React.createFactory(route.component)({ref:"component",state:this.state.state||{},params:route.params},[]);
    }
    route(path){
        for(var i = 0; i < this.routes.length; i++){
            var result = this.routes[i].regexp.exec(path);
            if(result){
                var params = {};
                for(var j = 0; j < this.routes[i].keys.length; j++){
                    params[this.routes[i].keys[j].name] = result[j+1];
                }
                return {component:this.routes[i].component,params:params}
            }
        }
        return false;
    }
}
