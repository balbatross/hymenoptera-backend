const say = require('say') 

class TTS{
  constructor(opts){
//    this.speed = opts.speed
  }

  say(opts){ 
    return new Promise((resolve, reject) => {
      say.speak(opts.text, 'Good News', 0.8, (err) => {
        if(err) console.log(err);
        resolve({msg: "Spoken"})
      })
     
    })
  }

  stop(){

  }
}

module.exports = {
  id: 'base-tts',
  name: 'Text-to-Speech',
  base: {module: TTS, opts: {speed: 1.0}},
  modules: [
    {
      key: 'say',
      config: {
        type: 'process',
        params: {
          text: 'Say something'
        }
      }
    },
  ]  
}
