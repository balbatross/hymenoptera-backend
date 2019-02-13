const verdaccio = require('verdaccio-server');
const npmPublish = require('npm-publish-programmatically')
const mergeDeps = require('@userfrosting/merge-package-dependencies')
const uuid = require('uuid')
const fs = require('fs')
const moniker = require('moniker')
const async = require('async');
const beautify = require('js-beautify').js;

const NPM_TOKEN = '/zIAo7AC7tQSxDFEYhramGpmauNDMCU3oCjxHh7J5MI=';
const USER_CONNECTION = '8c8496a2-929f-4c32-a530-ca2c61bb3b0d';
const VERSION = '0.0.18';

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
    pkgFiles.push('./base.package.json')
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
    let module = modules[module_index]
    files.map((file) => {
      libFiles[`lib/${module.id}/${file}`] = fs.readFileSync(`${module.fs_path}/${file}`, 'utf8')
    })

    return {id: module.id, assigned: module.id.replace(/-/g, '_'), files: libFiles}
  }

  write_readme(){

  }

  get_defined_connections(connections){
    
  }

  merge_connections(connections, user_inputs){
    
    return new Promise((resolve, reject) => {

      let connection_definition = `
        this.connections = {${Object.keys(connections).map((x) => `"${x}": {}`).join(',')}};
      `;
      
      let processors = []
      let _connections = []
      for(var k in connections){
        let module_conns = connections[k]
        let _conns = []
        for(var conn in module_conns){
          _conns.push(conn)
        }

        _connections.push({module: k, connections: _conns})
      }

      async.map(_connections, (item, cb) => {
        async.map(item.connections, (conn, _cb) => {
          if(conn == USER_CONNECTION){
            console.log("CONN", user_inputs, item)
            _cb(null, `\n this.connections['${item.module}']['${conn}'] = ${user_inputs[item.module]};`)
          }else{
            this.connection_storage.getById(conn).then((_connection) => {
              _cb(null, `\n this.connections['${item.module}']['${conn}'] = ${JSON.stringify(_connection.connection.opts)};`)
            })
          }
        }, (_err, _results) => {
          console.log(_err)
          cb(_err,  _results)
        })
      }, (err, results) => {
        console.log(results)
        results.map((item) => {
          console.log(item)
          item.map((c) => {
            console.log(c)
            connection_definition += c
          })
        })

        resolve(connection_definition)
      })

    })
  }

  find_published(published, item){
    for(var i = 0; i < published.length; i++){
      if(published[i].id == item.id){
        return published[i];
      }
    }
  }
  
  write_main(flow, activeModules, activeConnections, published_mods){
    return new Promise((resolve, reject) => {
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

      let modules = published_mods.map((x) => {
        return `"${x.id}": ${x.assigned},`
      }).join('\n')


      let inputArgs = {}
      console.log(published_mods, inputs, "STUFF")
      let inputAssignment = inputs.map((x, ix) => {
        inputArgs[this.find_published(published_mods, x).id] = userInputs[ix] //`this.userConnections['${published_mods[ix].id}'] = ${userInputs[ix]};`
      })

      let _flow = {
        flow: {
          nodes: flow.flow.nodes,
          links: flow.flow.links
        }
      }

      this.merge_connections(activeConnections, inputArgs).then((connection_blob) => {

          //Template code for exported flows
              let template = `
          var Flow = require('./flow')
          ${imports}
          
          const modules = {
            ${modules}
          }

          class ${className} {
            constructor(${userInputs.join(', ')}){ 
              ${connection_blob} 
              let flowable = new Flow(modules, this.connections, ${JSON.stringify(_flow)});

              flowable.start_flow();
            }
          }

          module.exports = ${className}
              
              `
        let output_main = beautify(template, {indent_size: 2, space_in_empty_paren: true})
        resolve(output_main) 
      })
    })
  }

  //Identify modules used
  //Merge package dependencies
  //Create files for each module
  //Find user input connections
  //Prechain flow
  //Write readme
  bundle(flow, version){
    return new Promise((resolve, reject) => {
      console.log("Bundling Flow: ", flow)
      let modulesUsed = this.find_modules(flow);
      let connectionsUsed = this.find_connections(flow)

      let packageFiles = modulesUsed.map((x) => {
        return `${x.fs_path}/package.json`
      })

      let moduleFileBundles = modulesUsed.map((x) => {
        return this.get_module_files(x)
      })

      let mergedPackageFile = this.merge_packfiles(flow, packageFiles, version) 

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

      publishSpec['flow/index.js'] = fs.readFileSync('./src/flow/index.js', 'utf8')
      publishSpec['flow/flow.js'] = fs.readFileSync('./src/flow/flow.js', 'utf8')
      publishSpec['flow/parser.js'] = fs.readFileSync('./src/flow/parser.js', 'utf8')

      this.write_main(flow, modulesUsed, connectionsUsed, publishedModules).then((indexFile) => {
        publishSpec['index.js'] = indexFile 
        console.log(publishSpec['index.js'])      
        npmPublish(publishSpec, {
          auth: {
            token: NPM_TOKEN,
          },
          registry: "http://localhost:4873"
        }).then(() => {
          console.log("Published: ", flow.name)
          resolve({name: mergedPackageFile.name, version: mergedPackageFile.version})
        }).catch((err) => {
          reject({error: err})
        })



      })
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

