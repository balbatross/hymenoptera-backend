const fs = require('fs')
const path = require('path')

var module_paths = [
  "./express",
  "./mongodb",
  "./http-request",
  "./scheduler"
].map((x) => path.dirname(__filename) + "/" + x)

var modules = module_paths.map((m) => {
  let _path = path.resolve(m)
  let packageJson = JSON.parse(fs.readFileSync(`${ m}/package.json`))
  
  var module_file = `${m}/${packageJson.main}`
  var module = require(module_file)
  return {
    id: packageJson.name,
    name: packageJson.description,
    klass: {module: module, opts: packageJson.options},
    modules: packageJson.modules,
    packageJSON: packageJson,
    fs_path: m
  };
})
console.log(modules)

module.exports = (() => {
  let export_modules = {}
  modules.map((x) => {
    export_modules[x.id] = x
  })
  return export_modules
})()
