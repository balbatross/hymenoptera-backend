var Router = require('express').Router;
var flows = require('./flows')
var modules = require('./modules')
var connections = require('./connections')
var projects = require('./projects')
var auth = require('./auth')

module.exports = (engine) => {
  let router = new Router()
  let flowRouter = flows(engine)
  let moduleRouter = modules(engine)
  let connectionRouter = connections(engine)
  let projectRouter = projects(engine)
  let authRouter = auth(engine)

  router.use('/auth', authRouter)
  router.use('/projects', projectRouter)
  router.use('/connections', connectionRouter)
  router.use('/flows', flowRouter)
  router.use('/modules', moduleRouter)
  return router;
}
