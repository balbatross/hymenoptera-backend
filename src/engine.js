var doT = require('dot')
let modules = require('./base-modules')
let FlowStorage = require('./flow-storage')

let default_connections = {
  'Express': {port: 8081},
  'MongoDB': {url: 'mongodb://localhost:27017', db: 'music'},
  'Puppeteer': {execPath: '/usr/bin/google-chrome', headless: false}
};

let connections = []

/*for(var i = 0; i < modules.length; i++){
  let mod = modules[i];
  let name = mod.name
  let _modules = mod.modules
  let server = mod.base.module

  let inst = new server(default_connections[name])
  modules[i].connection = inst
}
*/
class FlowEngine{
  constructor(storage_backend){
    this.modules = modules
    this.storage = storage_backend
    this.flows = new FlowStorage(this.storage)
  }


  addFlow(flow){
    return this.flows.add(flow)
  }
  
  updateFlow(id, flow){
    return this.flows.update(id, flow)
  }

  getFlows(){
    return this.flows.getAll()
  }

  getModules(){
    return this.modules;
  }


}

module.exports = FlowEngine;

