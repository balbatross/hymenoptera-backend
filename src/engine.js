var doT = require('dot')
var uuid = require('uuid');
let modules = require('./base-modules')
let Flow = require('./flow');
let FlowStorage = require('./flow-storage')
let ProjectStorage = require('./project-storage')
let ConnectionStorage = require('./connection-storage')
let FlowPackager = require('./package-exporter')
let Auth = require('./auth')
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
    this.auth = new Auth(this.storage)
    this.connections = new ConnectionStorage(this.storage)
    this.projects = new ProjectStorage(this.storage)
    this.flows = new FlowStorage(this.storage)
    this.packager = new FlowPackager(modules, this.connections);
    this.active_chains = {}
  }

  registerUser(user){
    return this.auth.register(user)
  }

  authenticateUser(user){
    return this.auth.authenticate(user)
  }

  getProjects(user_id){
    return this.projects.getAll(user_id)
  }

  getProject(user_id, id){
    return this.projects.get(user_id, id)
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

  addFlow(user_id, project_id, flow){
    return this.flows.add(user_id, project_id, flow)
  }
  
  updateFlow(user_id, project_id, id, flow){
    return this.flows.update(user_id, project_id, id, flow)
  }

  getFlow(user_id, project_id, id){
    return this.flows.get(user_id, project_id, id);
  }

  getFlows(user_id, project_id){
    return this.flows.getAll(user_id, project_id)
  }

  getModules(){
    return this.modules;
  }


}

module.exports = FlowEngine;

