const doT = require('dot')

class Flow {
  constructor(modules, chain) {
    this.modules = modules;
    this.nodes = chain.nodes;
    this.links = chain.links;
    this.running = false
    this._flow = this._flow.bind(this)
    this.init_flow()
  }

  init_flow(){
    this.first_node = this.find_node(this.find_start())
  }

  init_modules(){
    
  }

  start_flow(){
    this.init_modules()

    this.emitter = this.get_node_function(this.first_node)(this.first_node.opts)

    this.emitter.addListener('event', this._flow)
  }

  stop_flow(){
    this.emitter.removeListener('event', this._flow)
  }

  _flow(callback, data){
    let chain = Promise.all(this.find_next(this.first_node, data))
    cb(chain)
  }

  get_node_function(node){
    
  }

  find_module(node){
    return this.modules[node.module_name]
  }

  find_node(id){
    return this.nodes.filter((a) => a.id == id)[0]
  }

  find_start(){
    let inputs = {}
    let nodes = {}
    
    for(var i = 0; i < this.links.length; i++){
      let link = this.links[i]
      nodes[link.src] = true;
      inputs[link.dst] = true;
    }

    let input = null;

    for(var node in nodes){
      let exists = false;
      for(var hasInput in inputs){
        if(hasInput == node){
          exists = true;
        }
      }

      if(!exists){
        input = node
        return node
      }
    }
  }

  find_exit_points(node_id){
    let next_nodes = []
    return this.links.filter((link) => link.src == node_id).map((link) => link.dst) 
  }

  find_next(node, data){
    let next_nodes = this.find_exit_points(node.id)
    
    return next_nodes.map((node_id) => {
      let next_node = this.find_node(node_id)

      let params = this.parse_data(next_node.opts, data)

      return this.get_node_function(next_node)(params).then((response) => {
        let next = this.find_next(node_id, response)
        if(next.length > 0){
          return Promise.all(next)
        }else{
          return response
        }
      })
    })
  }

  parse_data(opts, data){
    return JSON.parse(doT.template(JSON.stringify(opts))(data))
  }
}

module.exports = Flow;
