const request = require('request')


class HttpRequest {
  constructor(opts){
  }
  
  request(opts){
    return new Promise((resolve, reject) => {
      request({url: opts.url, method: opts.method, body: opts.body || null}, {json: true}, (err, res, body) => {
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
          method: 'string',
          body: {}
        }
      }
    }
  ]  
}
