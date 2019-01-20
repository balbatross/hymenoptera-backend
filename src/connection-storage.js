var uuid = require('uuid');

class ConnectionStorage {

  constructor(backend){
    this.backend = backend
  }

  add(module, connection){
    return new Promise((resolve, reject) => {
      let conn = {
        id: uuid.v4(),
        name: connection.name,
        module: module,
        connection: connection
      }
      this.backend.collection('connections').insertOne(conn, (err) => {
        if(err) return reject(err);
        resolve()
      })
    })
  }

  getById(id){
    return new Promise((resolve, reject) => {
      this.backend.collection('connections').findOne({id: id}, (err, result) => {
        if(err) return reject(err);
        resolve(result)
      })
    })
  }

  getByModule(module){
    return new Promise((resolve, reject) => {
      this.backend.collection('connections').find({module: module}).toArray((err, arr) => {
        if(err) return reject(err);
        resolve(arr);
      })
    })
  }

  getAll(){
    return new Promise((resolve, reject) => {
      this.backend.collection('connections').find({}).toArray((err, arr) => {
        if(err) return reject(err)
        resolve(arr)
      })
    })
  }
}

module.exports = ConnectionStorage
