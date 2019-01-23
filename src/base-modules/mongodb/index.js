const MongoClient = require('mongodb').MongoClient


class MongoData {
  constructor(opts, instance){
    if(!opts){
      this.client = instance
    }else{
      this.url = opts.url
      this.db = opts.db
      this.mongoclient = new MongoClient(opts.url)
      this.mongoclient.connect((err, conn) => {
        this.client = conn.db(this.db)
      })
    }
  }

  insert(opts){
    return new Promise((resolve, reject) => {
      this.client.collection(opts.coll).insertOne(opts.object, (err, res) => {
        if(err){
          reject(err)
        }else{  
          resolve(res)
        }
      })
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

  stop(){
    this.mongoclient.close()
  }
}

module.exports = MongoData;
