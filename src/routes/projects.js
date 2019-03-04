var Router = require('express').Router;
var uuid = require('uuid')

module.exports = (engine) => {
  let router = new Router();

  router.get('/', (req, res) => {
    engine.getProjects(req.user.id).then((projects) => {
      res.send(projects)
    })
  })

  router.get('/:project', (req, res) => {
    engine.getProject(req.user.id, req.params.project).then((project) => {
      res.send(project)
    })
  })

  router.post('/', (req, res) => {
    let project = {
      id: uuid.v4(),
      name: req.body.project.name,
      type: req.body.project.type,
      project_id: req.body.project.id,
      user_id: req.user.id
    }
    engine.addProject(project).then(() => {
      res.send({succes: true})
    })
  })


  return router;
}
