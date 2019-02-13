const EventEmitter = require('events')

class Route extends EventEmitter {
  constructor(opts = {}){
    super();
    this.method = opts.method;
    this.route = opts.route;
    this.func = opts.func;
    this._handler = this._handler.bind(this)
  }

  _handler(req, res){
    let params = req.params;
    let body = req.body;
    let query = req.query;

    let data = {params: params, body: body, query: query}
    let promise = null
    this.emit('event', (p) => {
      promise = p
  
      promise.then((result) => {
          res.send(result)
      }, (err) => {
        console.log(err)
        res.send({error: err})
      })
    }, data)
    
  }

  register(app){
    let route = app.route(this.route)
    switch(this.method.toUpperCase()){
      case 'GET':
        route.get(this._handler)
        break
      case 'POST':
        route.post(this._handler)
        break
      case 'PUT':
        route.put(this._handler)
        break
      case 'DELETE':
        route.delete(this._handler)
        break
      default:
        return null
    }
  }
}

module.exports = Route
