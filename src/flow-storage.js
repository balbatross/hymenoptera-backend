class FlowStorage {

  constructor(backend){
    this.backend = backend
    this.flows = []
  }

  add(flow){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').insert(flow, (err) => {
        resolve()
      })
    })
  }

  update(id, flow){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').update({id: id}, {$set: {...flow}}, (err) => {
          if(err)return reject(err)
          resolve({msg: "Updated flow: "+ id})
      })
    })
  }

  get(id){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').findOne({id: id}, (err, result) => {
        if(err) return reject(err);
        resolve(result)
      })
    })
  }

  getAll(){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').find({}).toArray((err, arr) => {
        if(err) return reject(err)
        resolve(arr)
      })
    })
  }
}

module.exports = FlowStorage
