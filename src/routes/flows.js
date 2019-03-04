var Router = require('express').Router;
var uuid = require('uuid')

module.exports = (engine) => {
  let router = new Router()
  router.get('/:project_id', (req, res) => {
    engine.getFlows(req.user.id, req.params.project_id).then((flows) => {
    
      let mapped_flows = flows.map((x) => {
        return {
          id: x.id,
          name: x.name,
          flow: x.flow
        }
      })
      res.send(mapped_flows)
    })
  })

  router.post('/:project_id', (req, res) => {
    let flow = req.body.flow;

    if(!flow.id){
      flow.id = uuid.v4()
    }

    if(!flow.flow){
      flow.flow = {nodes: [], links: []}
    } 

    engine.addFlow(req.user.id, req.params.project_id, flow).then((id) => {
      res.send({success: true, flow: flow})
    })
  })

  router.put('/:project_id/:id', (req, res) => {
    let id = req.params.id;

    if(id ){
      engine.updateFlow(req.user.id, req.params.project_id, id, req.body.flow).then((result) => {
        res.send({result: result})
      })
    }else{
      res.send({error: "No id supplied for flow update"})
    }
  })

  //PACKAGE ROUTE
  router.post('/:project_id/:id/package', (req, res) => {
    let id = req.params.id;
    let version = req.body.version;

    engine.getFlow(req.user.id, req.params.project_id, id).then((flow) => {
      engine.packager.bundle(req.user, flow, version).then((module) => {
        res.send({module: module})
      }).catch((err) => {
        res.send(err)
      })
    })
  })

  //RUN ROUTE
  router.post('/:id/run', (req, res) => {
    let id = req.params.id;

    if(id){
      engine.runFlow(id).then((result) => {
        res.send({result: result})
      })
    }else{
      res.send({error: "No id supplied to run flow method"})
    }
  })

  router.post('/:run_id/stop', (req, res) => {
    let id = req.params.run_id;

    if(id){
      engine.stopFlow(id).then((result) => {
        res.send({result: result})
      })
    }else{
      res.send({error: "No active flow id supplied to method"})
    }
  })

  return router;
}
