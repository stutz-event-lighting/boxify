"use strict";

var React = require("react");
var pathToRegexp = require("path-to-regexp");
var client = require("./client.js");
var bs = require("./barcodescanner.js");
bs.start();

module.exports = class Router extends React.Component{
    constructor(props,context){
        super(props,context);
        var self = this;
        var clearStateOnBack = false;
        var callbacks = {};
        var nextcallbackid = 1;
        for(var i = 0; i < this.props.routes.length; i++){
            this.props.routes[i].component = require(this.props.routes[i].componentPath);
            this.props.routes[i].keys = [];
            this.props.routes[i].regexp = pathToRegexp(this.props.routes[i].path,this.props.routes[i].keys);
        }

        window.visit = function(url,data,cb){
            if(cb){
                var id = nextcallbackid++;
                callbacks[id] = cb;
                var state = history.state;
                state.history_callback_id = id;
                history.replaceState(state,undefined,location.pathname);
            }
            history.pushState(data||{},null,url);
            self.state.state = data;
            self.forceUpdate();
        }

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
            self.state.state = e.state||{};
            self.forceUpdate();
        }

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
        for(var i = 0; i < this.props.routes.length; i++){
            var result = this.props.routes[i].regexp.exec(path);
            if(result){
                var params = {};
                for(var j = 0; j < this.props.routes[i].keys.length; j++){
                    params[this.props.routes[i].keys[j].name] = result[j+1];
                }
                return {component:this.props.routes[i].component,params:params}
            }
        }
        return false;
    }
}
