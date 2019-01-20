var Router = require('express').Router;

module.exports = (engine) => {
  let router = new Router()
  router.get('/', (req, res) => {
    let modules = engine.getModules();
    let export_modules = []
    for(var k in modules){
      export_modules.push(modules[k])
    }
/*    .map((x) => {
      return {
        id: x.id,
        name: x.name,
        modules: x.modules
      }
    })*/
    res.send(export_modules)
  })

  return router;
}
