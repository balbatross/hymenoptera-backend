
class Log {
  constructor(){
  }

  error(opts){
    return new Promise((resolve, reject) => {

      console.log(opts.msg)
      resolve()
    })
  }

  log(opts){
    return new Promise((resolve, reject) => {
      console.log(opts.msg)
      resolve()
    })
  }

  debug(opts){
    return new Promise((resolve, reject) => {
      console.debug(opts.msg)
      resolve()
    })
  }
}

module.exports = Log
