var express = require('express');
var bodyParser = require('body-parser')
var Route = require('./route')

class Server {
  constructor(opts, instance){
    if(!opts){
      this.app = instance
    }else{
      this.app = express()
    }
    this.port = this.app.address().port || opts.port
    this.routes = [] 
    this.app.use(bodyParser.json())
    if(!this.app.address().port){
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

module.exports = {
  id: 'base-express-server',
  name: 'Express',
  base: {module: Server, opts: {port: 'int'}},
  modules: [
  {
    key: 'register',
    config: {
      type: 'input',
      params: {
        route: 'string',
        method: 'string'
      },
      output:  {
        params: {},
        body: {},
        query: {}
      } 
    }
  }
  ]
}
