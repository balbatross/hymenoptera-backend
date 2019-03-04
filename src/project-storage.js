class ProjectStorage {

  constructor(backend){
    this.backend = backend
  }

  add(proj){
    return new Promise((resolve, reject) => {
      this.backend.collection('projects').insert(proj, (err) => {
        resolve(proj)
      })
    })
  }

/*  update(id, flow){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').update({id: id}, {$set: {...flow}}, (err) => {
          if(err)return reject(err)
          resolve({msg: "Updated flow: "+ id})
      })
    })
  }*/

  get(user_id, id){
    return new Promise((resolve, reject) => {
      this.backend.collection('projects').findOne({user_id: user_id, id: id}, (err, result) => {
        if(err) return reject(err);
        resolve(result)
      })
    })
  }

  getAll(user_id){
    return new Promise((resolve, reject) => {
      this.backend.collection('projects').find({user_id: user_id}).toArray((err, arr) => {
        if(err) return reject(err)
        resolve(arr)
      })
    })
  }
}

module.exports = ProjectStorage
