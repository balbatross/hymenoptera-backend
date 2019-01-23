
const EventEmitter = require('events')
const Task = require('./task')

class Scheduler{
  constructor(opts){
  }

  scheduleTask(opts){ 
    let task = new Task(opts.schedule)
    return task
  }

  stop(){

  }
}

module.exports = {
  id: 'base-scheduler',
  name: 'Cron',
  base: {module: Scheduler, opts: {}},
  modules: [
    {
      key: 'scheduleTask',
      config: {
        type: 'input',
        params: {
          schedule: '*s *m *h *dom *m *dow'
        }
      }
    },
  ]  
}
