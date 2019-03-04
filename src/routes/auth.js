var Router = require('express').Router;
var uuid = require('uuid')

module.exports = (engine) => {
  let router = new Router();

  router.post('/login', (req, res) => {
    engine.authenticateUser(req.body.user).then((user) => {
      //JWT ify
      res.send(user)
    }).catch((err) => {
      res.send(err)
    })    
  })


  router.post('/register', (req, res) => {
    engine.registerUser(req.body.user).then((_res) => {
      res.send({user: _res})
    })
  })
  return router;
}
