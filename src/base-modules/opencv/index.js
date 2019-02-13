const cv = require('opencv4nodejs')
const EventEmitter = require('events')
class OpenCV{
  constructor(opts, instance){
    this.capture = new cv.VideoCapture(opts.capture_device)
  }

  imshow(opts){
    return new Promise((resolve, reject) => {
      cv.imshow(opts.window, opts.frame)
      cv.waitKey(1)
      resolve()
    })
  }

  read(opts){
    let emitter = new EventEmitter();

    setInterval(() => {
      let frame = this.capture.read()
      if(!frame.empty){
        emitter.emit('event', (p) => {
          p.then((res) => {

          })
        }, {frame: frame})
      }
    }, 0)
    return emitter;
  }

  readFrame(opts){
    return new Promise((resolve, reject) => {
      setInterval(() => {
        let frame = this.capture.read()
        if(!frame.empty){
          resolve(frame)
        }
      }, 0)
    })
  }
}

module.exports = OpenCV
