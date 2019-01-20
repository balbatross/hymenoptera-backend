var Router = require('express').Router;
var uuid = require('uuid')

module.exports = (engine) => {
  let router = new Router()
  router.get('/', (req, res) => {
    engine.getFlows().then((flows) => {
    
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

  router.post('/', (req, res) => {
    let flow = req.body.flow;

    if(!flow.id){
      flow.id = uuid.v4()
    }

    if(!flow.flow){
      flow.flow = {nodes: [], links: []}
    } 

    engine.addFlow(flow).then((id) => {
      res.send({success: true})
    })
  })

  router.put('/:id', (req, res) => {
    let id = req.params.id;

    if(id ){
      engine.updateFlow(id, req.body.flow).then((result) => {
        res.send({result: result})
      })
    }else{
      res.send({error: "No id supplied for flow update"})
    }
  })

  return router;
}
