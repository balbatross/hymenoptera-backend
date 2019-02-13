const doT = require('dot')
const async = require('async');

const USER_CONNECTION = '8c8496a2-929f-4c32-a530-ca2c61bb3b0d';

class Flow {
  constructor(modules, connections, chain) {
    this.modules = modules;
    this.connections = connections;
    this.instantiated = {}
    this.nodes = chain.flow.nodes;
    this.links = chain.flow.links;
    this.running = false
    this.emitters = []
    this._flow = this._flow.bind(this)
    this.init_flow()
  }

  init_flow(){
    this.first_nodes = this.find_start().map((n) => this.find_node(n))
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
          let module = this.modules[module_name]
          let conn;

          if(module_inst == USER_CONNECTION){
            conn = new module(null, this.connections[module_name][module_inst])
          }else{
            conn = new module(this.connections[module_name][module_inst])
          }
          let _c = {}
          _c[module_inst] = conn
          this.instantiated[module_name] = {
            ...this.instantiated[module_name],
            ..._c
          }
          cb(null, _c)
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

      this.first_nodes.map((x) => {
        if(x.config.type == 'input'){
          let em = this.get_node_function(x)(x.opts)
          em.addListener('event', (cb, data) => {
            this._flow(x, cb, data)
          })
          this.emitters.push(em)
        }else{
          let func = this.get_node_function(x)
          let next = Promise.all(this.find_next(x, {}))
          func(x.opts).then(next)
        }
      })

    })
  }

  stop_flow(){
    this.emitters.map((em) => {
      em.removeListener('event', this._flow)
    })
    for(var k in this.connections){
      this.connections[k].stop();
    }
  }

  _flow(node, callback, data){
    let chain = Promise.all(this.find_next(node, data))
    callback(chain)
  }

  get_node_function(node){
    console.log(this.instantiated, node, " finding a function pairing")
    return this.instantiated[node.module_name][node.module_inst][node.delegator].bind(this.instantiated[node.module_name][node.module_inst]) 
  }

  find_module(node){
    return this.modules[node.module_name]
  }

  find_node(id){
    return this.nodes.filter((a) => a.id == id)[0]
  }

  find_start(){
    let entry_nodes = []
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
        entry_nodes.push(node)
      }
    }
    return entry_nodes
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
