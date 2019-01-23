var express = require('express');
var bodyParser = require('body-parser')
var Route = require('./route')

class Server {
  constructor(opts, instance){
    if(!opts){
      this.app = instance
    }else{
      this.port = opts.port
      this.app = express()
    }

    this.routes = [] 
    this.app.use(bodyParser.json())
    if(opts){
      this.server = this.app.listen(this.port)
    }
  }

  registerRoute(route){
    this.routes.push(route);
    route.register(this.app)
  }

  register(opts){
    let r = new Route(opts);
    r.register(this.app)
    this.routes.push(r)
    return r;
  }

  stop(){
    this.server.close()
  }
}

module.exports = Server
