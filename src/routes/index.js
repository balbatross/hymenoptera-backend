var Router = require('express').Router;
var flows = require('./flows')
var modules = require('./modules')

module.exports = (engine) => {
  let router = new Router()
  let flowRouter = flows(engine)
  let moduleRouter = modules(engine)

  router.use('/flows', flowRouter)
  router.use('/modules', moduleRouter)
  return router;
}
