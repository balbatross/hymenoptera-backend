const doT = require('dot')
const async = require('async');
const Parser = require('./parser')
const USER_CONNECTION = '8c8496a2-929f-4c32-a530-ca2c61bb3b0d';


class Flow {
  constructor(instantiated, chain) {
    this.running = false 
    this.nodes = chain.flow.nodes;
    this.links = chain.flow.links;

    this.emitters = []
    this.instantiated = instantiated || {}
    
    this.parser = new Parser();   
    
    this._flow = this._flow.bind(this)
    
    this.init_flow(chain)

  }

  init_flow(chain){
    this.chain = this.parser.parse(chain)
      
  }

  start_thread(chain_thread){
    let start = chain_thread[0];
    let _next = chain_thread[1];

    let s_node = this.find_node(start);

    let f = this.get_node_function(s_node)(s_node.opts)
    if(Promise.resolve(f) == f){
      f.then((response) => {
        return this.find_next(_next, response)
      })
    }else{
      f.addListener('event', (cb, data) => {
        console.log(_next)
        let next = this.find_next(_next, data)
        console.log("NEXT", next)
        cb(next)
      })
    }

  }

  find_next(thread_block, data){
    let p = []
    console.log("FINDING NEXT", thread_block)
    if(thread_block && thread_block.length > 0){
      thread_block.map((x) => {
          let f_node = this.find_node(x[0])
          for(var k in data){
            if(typeof(data[k]) == 'object'){
              data[k] = JSON.stringify(data[k])
            }
          }
          let params = this.parse_data(f_node.opts, f_node.config.params, data)
          console.log(params)
          let f = this.get_node_function(f_node)(params).then((resp) => {
            let next = this.find_next(x[1], resp)
            return next;
          })
          p.push(f)
      })

      return Promise.all(p) 
    }else{
      return new Promise((resolve) => resolve(data))
    }
  }

  start_flow(){
    for(var i = 0; i < this.chain.length; i++){
      let thread = this.chain[i];
      
      this.start_thread(thread);
    }


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
    let module = this.instantiated[node.module_name][node.module_inst]
    console.log(module[node.delegator])
    return module[node.delegator].bind(module) 
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
    return this.links.filter((link) => link.src == node_id).map((link) => link.dst) 
  }

  eval_object(it, object){
    for(var k in it){
      try{
        it[k] = JSON.parse(it[k])
      }catch(e){

      }
    }
    return eval(`($it) => {
      let json = ${object}
      return json;
      }
      `)(it)

 }

  parse_data(opts, params, data){
    let obj = {}
    for(var k in opts){
      let p = params[k]
      let o = opts[k]
      
      if(typeof(p) == "object"){
        obj[k] = this.eval_object(data, o)  
      }else{
        obj[k] = o
      }

    }
    return obj 
  }
}

module.exports = Flow;
