const async = require('async')
const Flow = require('./flow')
const USER_CONNECTION = '8c8496a2-929f-4c32-a530-ca2c61bb3b0d';

/*
  Runnable Flow
  
  takes a module set, connection blob and command chain

  - Finds unique module - connection pairs
  - Finds threads of command
  - Initializes module klass
  - Initializes flow threads
  
*/

class RunnableFlow {

  constructor(module_registry, connections, command_chain){
    this._modules = module_registry;
    this._connections = connections;
    this._commands = command_chain;

    this.instantiated = {}
    this.nodes = command_chain.flow.nodes;
    this.links = command_chain.flow.links;
    
    this.init();
  }

  init(){
    this.init_modules().then(() => {
      console.log("Modules")
      console.log(this.instantiated)

      this.init_flow()
    })
  }

  init_flow(){
    this.flow = new Flow(this.instantiated, this._commands)
    this.start_flow()
  }

  start_flow(){
    if(this.flow){
      this.flow.start_flow()
    }else{
      console.log("No flow initialized yet")
    }
  }

  find_chain_modules(){
    let modules = {}
    for(var i = 0; i < this.nodes.length; i++){
      let n = this.nodes[i];
      let connections = modules[n.module_name]
      if(!connections) connections = []
      if(connections.indexOf(n.module_inst) < 0){
        connections.push(n.module_inst);
      }
      modules[n.module_name] = connections;
    }
    return modules;
  }

  get_module_initmap(module_set){
    let init = []
    for(var k in module_set){
      let conns = module_set[k]
      for(var i = 0; i < conns.length; i++){
        init.push({name: k, inst: conns[i]})
      }
    }
    return init.map((block) => {
        return (cb) => {
          let m_inst = block.inst;
          let m_name = block.name;

          let module = this._modules[m_name]
          let conn;
          let opts = this._connections[m_name][m_inst]
          if(m_inst == USER_CONNECTION){
            conn = new module(null, opts)
          }else{
            conn = new module(opts)
          }
          
          let _conn = {}
          _conn[m_inst] = conn
          this.instantiated[m_name] = {
            ...this.instantiated[m_name],
            ..._conn
          }
          cb(null, _conn)
        }
    });
  }

  init_modules(){
    return new Promise((resolve, reject) => {
      let modules = this.find_chain_modules();
      
      let init_map = this.get_module_initmap(modules);
      async.parallel(init_map, (err) => {
        
        if(err){
          reject(err);
        }else{
          resolve()
        }
      })
    })
  }
}

module.exports = RunnableFlow;
