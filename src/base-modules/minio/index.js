const Minio = require('minio')


class MinioData {
  constructor(opts, instance){
    if(!opts){
      this.client = instance
    }else{
      this.url = opts.url
      this.port = opts.port
      this.accessKey = opts.accessKey;
      this.secretKey = opts.secretKey;

      this.client = new Minio.Client({
        endPoint: this.url,
        port: this.port,
        accessKey: this.accessKey,
        secretKey: this.secretKey
      })
    }
  }

  listObjects(opts){
    return new Promise((resolve, reject) => {
      var objects = []
      var stream = this.client.listObjects(opts.bucket, opts.prefix)
      stream.on('data', (obj) => objects.push(obj))
      stream.on('end', () => resolve(objects))
      stream.on('error', (err) => reject(err))
    })
  }

  stop(){

  }
}

module.exports = MinioData;
