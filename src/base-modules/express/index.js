var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var Route = require('./route')

class Server {
  constructor(opts){
    this.port = opts.port
    this.routes = [] 

    app.use(bodyParser.json())
    app.listen(this.port)
  }

  registerRoute(route){
    this.routes.push(route);
    route.register(app)
  }

  register(opts){
    let r = new Route(opts);
    r.register(app)
    this.routes.push(r)
    return r;
  }

  start(){
    app.listen(this.port)
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
