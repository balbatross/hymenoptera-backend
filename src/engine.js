var doT = require('dot')

let default_connections = {
  'Express': {port: 8081},
  'MongoDB': {url: 'mongodb://localhost:27017', db: 'music'},
  'Puppeteer': {execPath: '/usr/bin/google-chrome', headless: false}
}
let modules = require('./base-modules').modules

let connections = []

for(var i = 0; i < modules.length; i++){
  let mod = modules[i];
  let name = mod.name
  let _modules = mod.modules
  let server = mod.base.module
  
  let inst = new server(default_connections[name])
  modules[i].connection = inst
}


let chain = [
  {
    nodes: [
       {
      id: '0',
      type: 'base-express-server',
      func: 'register',
      params: {method: "GET", route: "/love"}
    }, 
       {
      id: '1',
      type: 'base-mongodb',
      func: 'find',
      params: {coll: 'musicians', query: {}}
    },
    ],
    links: [
      {src: '0',
      dst:'1',
      },
    ]
  }
][0]


class HymenFlowEngine{
  constructor(){
    this.modules = modules
    this._flow = this._flow.bind(this)
  }


  start(){
    
  }

  getModules(){
    return this.modules;
  }

  findNode(nodes, ix){
    return nodes.filter((a) => a.id == ix)[0]
  }

  getNext(ix, data, nodes, links){
    let next = this.findNext(ix, data, nodes, links)

    return Promise.all(next)
  }

  _flow(cb, data){  
    let next_chain = this.getNext(this.current_data, data, nodes, links)
    cb(next_chain) 
  }

  parse(chain){
    let nodes = chain.nodes;
    let links = chain.links;

    let inputNode = this.findInputNode(links)
    let node1 = this.findNode(nodes, inputNode)

    let inNode = this.findModule(node1.type, node1.func)(node1.params)

    this.current_emitter = inNode;
    this.current_node = inputNode
    this.current_emitter.addListener('event', this._flow) 
  }

  stop(){
    this.current_emitter.removeListener(this._flow)
  }
  
  findModule(str_type, str_module){
    for(var i = 0; i < this.modules.length; i++){
        let module = this.modules[i]  
        let id = module.id
        console.log(id, str_type) 
        if(id == str_type){
          return module.connection[str_module].bind(module.connection)
        }
      }
  }

  parseData(params, data){
    let string_bean = JSON.stringify(params)
    let data_template = doT.template(string_bean)

    return JSON.parse(data_template(data))
  }


  findNext(current, data, nodes, links){
    let nextNodes = []
    console.log(current)
    for(var i = 0; i < links.length; i++){
      if(links[i].src == current){
        nextNodes.push(links[i].dst)
      }
    }
    
    let exit_nodes = nextNodes.map((x) => {
      let module = this.findNode(nodes, x)
      
      let params = this.parseData(module.params, data)
      return this.findModule(module.type, module.func)(params).then((res) => {
        let next = this.findNext(x, res, nodes, links)
        if(next.length > 0){
          return Promise.all(next)
        }else{
          return res
        }
      })
    }) 
    return exit_nodes
  }


  findInputNode(links){
    let hasInputs = {}
    let nodes = {}
    for(var i = 0; i < links.length; i++){
      let link = links[i];
      nodes[link.src] = true;
      hasInputs[link.dst] = true;
    }

    let input = null;

    for(var k in nodes){
      var exists = false;
      for(var hk in hasInputs){
        if(hk == k){
          exists = true;
        }
      }

      if(!exists){
        input = k
      }
    }
    return input

  }
}

module.exports = HymenFlowEngine;


