const doT = require('dot')
const async = require('async');

class Flow {
  constructor(modules, connections, chain) {
    this.modules = modules;
    this.connection_engine = connections;
    this.connections = {}
    this.nodes = chain.flow.nodes;
    this.links = chain.flow.links;
    this.running = false
    this._flow = this._flow.bind(this)
    this.init_flow()
  }

  init_flow(){
    this.first_node = this.find_node(this.find_start())
  }

  init_modules(){
    return new Promise((resolve, reject) => {
      let to_init = {}
      for(var i = 0; i < this.nodes.length; i++){
        to_init[this.nodes[i].module_inst] = this.nodes[i].module_name
      }
      
      let init_blocks = []
      for(var k in to_init){
        init_blocks.push({inst: k, name: to_init[k]})

      }

      async.parallel(init_blocks.map((block) => {
        return (cb) => {
          let module_inst = block.inst
          let module_name = block.name

          this.connection_engine.getById(module_inst).then((connection) => {
            let module = this.modules[module_name]
            let conn = new module.base.module(connection.connection.opts)
            this.connections[module_inst] = conn
            cb(null, module_inst)
          }) 
        }
      }), (err) => {
        if(err){
          reject(err);
        }else{
          resolve()
        }
      })
    })
  }

  start_flow(){
    this.init_modules().then(() => {

      this.emitter = this.get_node_function(this.first_node)(this.first_node.opts)

      this.emitter.addListener('event', this._flow)
    })
  }

  stop_flow(){
    this.emitter.removeListener('event', this._flow)
    for(var k in this.connections){
      this.connections[k].stop();
    }
  }

  _flow(callback, data){
    let chain = Promise.all(this.find_next(this.first_node, data))
    callback(chain)
  }

  get_node_function(node){
    return this.connections[node.module_inst][node.delegator].bind(this.connections[node.module_inst]) 
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
    console.log("Next for", node_id)
    console.log(this.links);
    return this.links.filter((link) => link.src == node_id).map((link) => link.dst) 
  }

  find_next(node, data){
    let next_nodes = this.find_exit_points(node.id)
    console.log(next_nodes); 
    return next_nodes.map((node_id) => {
      let next_node = this.find_node(node_id)

      let params = this.parse_data(next_node.opts, data)

      return this.get_node_function(next_node)(params).then((response) => {
        let next = this.find_next({id: node_id}, response)
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
