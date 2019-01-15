const MongoClient = require('mongodb').MongoClient


class MongoData {
  constructor(opts){
    this.url = opts.url
    this.db = opts.db
    const client = MongoClient(opts.url).connect((err, conn) => {
      this.client = conn.db(this.db)
    })
  }

  find(opts){
    return new Promise((resolve, reject) => {
      this.client.collection(opts.coll).find(opts.query).toArray((err, docs) => {
        if(err){
          reject(err)
        }else{
          resolve(docs)
        }
      })
    })
  }

  update(opts){
    return new Promise((resolve, reject) => {
      this.client.collection(opts.coll).update(opts.query, opts.update, (err) => {
        if(err){
          reject(err)
        }else{  
          resolve()
        }
      })
    })
  }
}

module.exports = {
  id: 'base-mongodb',
  name: 'MongoDB',
  base: {module: MongoData, opts: {url: 'string', db: 'string'}},
  modules: [
    {
      key: 'find',
      config: {
        type: 'process',
        params: {
          coll: 'string',
          query: 'object'
        }
      }
    },
    {
      key: 'update',
      config: {
        type: 'process',
        params: {
          coll: 'string',
          query: {},
          update: {}
        }
      }
    }
  ]  
}
