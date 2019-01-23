const verdaccio = require('verdaccio-server');
const npmPublish = require('npm-publish-programmatically')
const mergeDeps = require('@userfrosting/merge-package-dependencies')
const uuid = require('uuid')
const fs = require('fs')
const moniker = require('moniker')


const USER_CONNECTION = '8c8496a2-929f-4c32-a530-ca2c61bb3b0d';
const VERSION = '0.0.9';

class Packager {
  constructor(modules, connections){
    this.connection_storage = connections;
    this.modules = modules;
    verdaccio.stopAll()
    verdaccio.start()
  }

  //TODO check that all modules added will actually get fired
  find_modules(flow){
    let modules = {}

    let nodes = flow.flow.nodes;

    for(var i = 0; i < nodes.length; i++){ 
      modules[nodes[i].module_name] = this.modules[nodes[i].module_name]
    }
    
    let retArr = []
    for(var k in modules){
      modules[k].uuid = uuid.v4()
      retArr.push(modules[k])
    }
    return retArr
  }

  find_connections(flow){
    let connections = {}
    let nodes = flow.flow.nodes;

    for(var i = 0; i < nodes.length; i++){
      let conns = connections[nodes[i].module_name]
      if(!conns){ 
        conns = {}
      }
      conns[nodes[i].module_inst] = true
      connections[nodes[i].module_name] = conns
    }
    console.log(connections)

    return connections; 
  }

  merge_packfiles(flow, pkgFiles, version){
    return mergeDeps.npm({
        name: flow.name.toLowerCase().replace(/ /g, '-'),
        description: flow.name,
        main: 'index.js',
        version: version
    }, pkgFiles)
  } 

  get_module_files(module){
    let files = []
    files.push(`${module.packageJSON.main}`)

    if(module.packageJSON.files){
      module.packageJSON.files.map((file) => {
        files.push(`${file}`)
      })
    }
    return files;
  }

  libify(modules, files, module_index){
    let id = uuid.v4();
    let libFiles = {}
    files.map((file) => {
      libFiles[`lib/${id}/${file}`] = fs.readFileSync(`${modules[module_index].fs_path}/${file}`, 'utf8')
    })

    return {id: id, assigned: moniker.choose().replace(/-/g, '_'), files: libFiles}
  }

  write_readme(){

  }

  write_main(flow, activeModules, activeConnections, published_mods){

  //Data grabbing for template
    let className = flow.name.replace(/ /g, '')

    let inputs = activeModules.filter((x) => {
      let connections = activeConnections[x.id]
      let exists = false      
      for(var k in connections){
        if(k == USER_CONNECTION){
          exists = true;
        }
      }
      return exists;
    })

    let userInputs = inputs.map((x) => x.id.toLowerCase().replace(/-/g, '_'))

    let moduleInit = published_mods.map((x) => {
      return `let ${x.assigned}_inst = new ${x.assigned}(null, this.userConnections['${x.id}']);`
    }).join(`\n`)


    let imports = published_mods.map((x) => {
      return `const ${x.assigned} = require('./lib/${x.id}');\n`
    }).join('')


    let inputAssignment = inputs.map((x, ix) => {
      return `this.userConnections['${published_mods[ix].id}'] = ${userInputs[ix]};`
    }).join(`\n`)

//Template code for exported flows
    let template = `

${imports}

class ${className} {
  constructor(${userInputs.join(', ')}){
    this.userConnections = {}
    ${inputAssignment}

    ${moduleInit}
  }
}

module.exports = ${className}
    
    `

    return template;
  }

  //Identify modules used
  //Merge package dependencies
  //Create files for each module
  //Find user input connections
  //Prechain flow
  //Write readme
  bundle(flow){
    let modulesUsed = this.find_modules(flow);
    let connectionsUsed = this.find_connections(flow)

    let packageFiles = modulesUsed.map((x) => {
      return `${x.fs_path}/package.json`
    })

    let moduleFileBundles = modulesUsed.map((x) => {
      return this.get_module_files(x)
    })

    let mergedPackageFile = this.merge_packfiles(flow, packageFiles, VERSION) 

    let publishSpec = {
      'package.json': mergedPackageFile,
    }

    let publishedModules = moduleFileBundles.map((x, ix) => {
      let published_mod = this.libify(modulesUsed, x, ix)
      publishSpec = {
        ...publishSpec,
        ...published_mod.files
      }
      return published_mod
    })


/*    publishSpec['README.md'] = `
      #${flow.name}

      ## Usage
        
        const Lib = require('${flow.name.toLowerCase().replace(/ /g, '-')}')

        const instantiated = new Lib(${userInputs});
 

    `
*/

    publishSpec['index.js'] = this.write_main(flow, modulesUsed, connectionsUsed, publishedModules)
    console.log(publishSpec)
    
    npmPublish(publishSpec, {
      auth: {
        token: 'ZQLH4mrZw9zXnB37CgNGXl8J4axCfVnoMdcrk/ynB04=',
      },
      registry: "http://localhost:4873"
    }).then(() => {
      console.log("Published: ", flow.name)
    })
  
  }
}

module.exports = Packager;

/*
npmPublish({
  'package.json': {
    name: 'test-unit',
    version: '0.0.2',
    main: 'index.js',
  },
  'build/main.js': `module.exports = function(g){
    console.log('hello ' + greeting)
  }`
}, {
  auth: {
    token: 
  },
  registry: 'http://localhost:4873'
}).then(() => {
  console.log("PUblished")
}, (err) => {
  console.error(err)
})*/

