var CV = require('.')

let test_device = new CV({capture_device: 0})

test_device.read().addListener('event', (cb, data)=>{
  cb(test_device.imshow({window: 'name', frame: data}))
//  console.log("TEST", data)
})
