const EventEmitter = require('events');
const schedule = require('node-schedule')

class Task extends EventEmitter{
  constructor(schedule_param){
    super()

    this.job = schedule.scheduleJob(schedule_param, () => {
      console.log("HIT SCHEDULE")
      this.emit('event', (p) => {
        console.log("HIT EXECUTOR")
        p.then((result) => {
          console.log("[DEBUG] Scheduler: ", result)
        }, (err) => {
          console.log("[DEBUG] Scheduler: ", err);
        })
      })
    }) 
  }
}

module.exports = Task
