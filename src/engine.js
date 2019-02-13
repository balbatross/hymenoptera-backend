var doT = require('dot')
var uuid = require('uuid');
let modules = require('./base-modules')
let Flow = require('./flow');
let FlowStorage = require('./flow-storage')
let ProjectStorage = require('./project-storage')
let ConnectionStorage = require('./connection-storage')
let FlowPackager = require('./package-exporter')

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
    this.connections = new ConnectionStorage(this.storage)
    this.projects = new ProjectStorage(this.storage)
    this.flows = new FlowStorage(this.storage)
    this.packager = new FlowPackager(modules, this.connections);
    this.active_chains = {}
  }

  getProjects(){
    return this.projects.getAll()
  }

  getProject(id){
    return this.projects.get(id)
  }

  addProject(proj){
    return this.projects.add(proj)
  }

  getConnections(){
    return this.connections.getAll()
  }

  getConnectionsForModule(module){
    return this.connections.getByModule(module)
  } 

  addConnectionForModule(module, connection){
    return this.connections.add(module, connection)
  }

  runFlow(flow_id){
    return new Promise((resolve, reject) => {
      this.getFlow(flow_id).then((flow) => {
          let runnableFlow = new Flow(this.modules, this.connections, flow)
          let id = uuid.v4();
          this.active_chains[id] = runnableFlow;
          runnableFlow.start_flow();
          resolve(id)
      })
    })
  }

  stopFlow(active_id){
    return new Promise((resolve, reject) => {
      this.active_chains[active_id].stop_flow();
      delete this.active_chains[active_id]
      resolve({success: true})
    })
  }

  addFlow(flow){
    return this.flows.add(flow)
  }
  
  updateFlow(id, flow){
    return this.flows.update(id, flow)
  }

  getFlow(id){
    return this.flows.get(id);
  }

  getFlows(){
    return this.flows.getAll()
  }

  getModules(){
    return this.modules;
  }


}

module.exports = FlowEngine;

