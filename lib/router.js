var React = require("react");
var pathToRegexp = require("path-to-regexp");

function mixin(a,b){
    for(var key in b){
        a[key] = b[key];
    }
}

module.exports = React.createClass({
    getInitialState:function(){
        var self = this;
        var clearStateOnBack = false;
        var callbacks = {};
        var nextcallbackid = 1;
        for(var i = 0; i < this.props.routes.length; i++){
            this.props.routes[i].component = require(this.props.routes[i].componentPath);
            this.props.routes[i].keys = [];
            this.props.routes[i].regexp = pathToRegexp(this.props.routes[i].path,this.props.routes[i].keys);
        }

        visit = function(url,data,cb){
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

        back = function(clear){
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
        return {state:{}};
    },
    findHighestLink:function(link){
        var highestLink = null;
        while(link && link != document.body){
            if(link.tagName == "A") highestLink = link;
            link = link.parentNode;
        }
        return highestLink;
    },
    componentDidMount:function(){
        this.onLinkClicked = function(e){
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
    },
    componentWillUnmount:function(){
        document.removeEventListener("click".this.onLinkClicked);
    },
    render:function(state){
        var route = this.route(location.pathname);
        mixin(route.state,this.state.state);
        return route.component(route.state);
    },
    route:function(path){
        for(var i = 0; i < this.props.routes.length; i++){
            var result = this.props.routes[i].regexp.exec(path);
            if(result){
                var state = {};
                for(var j = 0; j < this.props.routes[i].keys.length; j++){
                    state[this.props.routes[i].keys[j].name] = result[j+1];
                }
                return {component:this.props.routes[i].component,state:{params:state}}
            }
        }
        return false;
    }
})
