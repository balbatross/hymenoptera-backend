var Router = require('express').Router;

module.exports = (engine) => {
  let router = new Router();

  router.get('/', (req, res) => {
    engine.getConnections().then((conns) => {
      res.send(conns)
    })
  })

  router.get('/:module', (req, res) => {
    engine.getConnectionsForModule(req.params.module).then((conns) => {
      res.send(conns)
    })
  })

  router.post('/:module', (req, res) => {
    engine.addConnectionForModule(req.params.module, req.body.connection).then((conn) => {
      res.send({connection: conn})
    })
  })

  router.get('/p/:id', (req, res) => {
    engine.getConnectionsForProject(req.params.id)
  })

  router.post('/p/:id', (req, res) => {
    engine.addConnectionForProject(req.params.id, req.body.connection)
  })
  return router;
}
