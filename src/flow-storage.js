class FlowStorage {

  constructor(){
    this.flows = []
  }

  add(flow){
    return new Promise((resolve, reject) => {
      this.flows.push(flow)
      resolve()
    })
  }

  getAll(){
    return this.flows;
  }
}

module.exports = FlowStorage
