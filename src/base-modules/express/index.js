var express = require('express');
var bodyParser = require('body-parser')
var Route = require('./route')

class Server {
  constructor(opts){
    this.port = opts.port
    this.routes = [] 
    this.app = express();
    this.app.use(bodyParser.json())
    this.server = this.app.listen(this.port)
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

  start(){
    app.listen(this.port)
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
      }
    }
  }
  ]
}
