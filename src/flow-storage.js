class FlowStorage {

  constructor(backend){
    this.backend = backend
    this.flows = []
  }

  add(user_id, project_id, flow){
    return new Promise((resolve, reject) => {
      let _flow = {
        ...flow,
        user_id: user_id,
        project_id: project_id
      }
      this.backend.collection('flows').insert(_flow, (err) => {
        resolve()
      })
    })
  }

  update(user_id, project_id, id, flow){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').update({project_id: project_id, user_id, id: id}, {$set: {...flow}}, (err) => {
          if(err)return reject(err)
          resolve({msg: "Updated flow: "+ id})
      })
    })
  }

  get(user_id, project_id, id){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').findOne({user_id, id: id, project_id: project_id}, (err, result) => {
        if(err) return reject(err);
        resolve(result)
      })
    })
  }

  getAll(user_id, project_id){
    return new Promise((resolve, reject) => {
      this.backend.collection('flows').find({project_id: project_id, user_id: user_id}).toArray((err, arr) => {
        if(err) return reject(err)
        resolve(arr)
      })
    })
  }
}

module.exports = FlowStorage
