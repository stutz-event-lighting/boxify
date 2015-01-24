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
        for(var i = 0; i < this.props.routes.length; i++){
            this.props.routes[i].component = require(this.props.routes[i].componentPath);
            this.props.routes[i].keys = [];
            this.props.routes[i].regexp = pathToRegexp(this.props.routes[i].path,this.props.routes[i].keys);
        }

        visit = function(url,data){
            history.pushState(data,null,url);
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
            self.state.state = e.state||{};
            self.forceUpdate();
        }


        return {state:{}};
    },
    render:function(state){
        var route = this.route();
        mixin(route.state,this.state.state);
        return route.component(route.state);
    },
    route:function(){
        for(var i = 0; i < this.props.routes.length; i++){
            var result = this.props.routes[i].regexp.exec(location.pathname);
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
