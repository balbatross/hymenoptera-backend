const doT = require('dot')
const fs = require('fs')
const crypto = require('crypto')

class Packaging {
  constructor(opts, instance){
    if(!opts){
      this.client = instance
    }else{
      this.url = opts.url
      this.db = opts.db
    }
  }

  sha256(opts){
    return new Promise((resolve, reject) => {
      return resolve({hash: crypto.createHash('sha256').update(opts.text).digest('hex')});
    })
  }

  template(opts){
    return new Promise((resolve, reject) => {
      let template = doT.template(opts.template);
      let data = opts.data;
      resolve({formatted: doT(data)})      
    })
  }

  readFile(opts){
    return new Promise((resolve, reject) => {
      let data = fs.readFileSync(opts.path, 'utf8')
      resolve({file: data})
    })  
  } 

}

module.exports = Packaging;
