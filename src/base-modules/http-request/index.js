const request = require('request')


class HttpRequest {
  constructor(opts){
  }
  
  request(opts){
    return new Promise((resolve, reject) => {
      request(opts.url, {json: true}, (err, res, body) => {
        if(err){
          reject(err)
        }else{
          resolve(body)
        }
      })
    })
  }

  stop(){
    console.log("Nothing to do")
  }
}

module.exports = {
  id: 'base-http-request',
  name: 'HTTP Request',
  base: {module: HttpRequest, opts: {}},
  modules: [
    {
      key: 'request',
      config: {
        type: 'process',
        params: {
          url: 'string',
        }
      }
    }
  ]  
}
