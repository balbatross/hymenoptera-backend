const { NerManager, SentimentAnalyzer } = require('node-nlp')

class Sentiment{
  constructor(opts){
    this.sentiment = new SentimentAnalyzer()
    this.entity_manager = new NerManager({threshold: opts.entity_threshold})
  }

  analyzeSentiment(opts){ 
    return new Promise((resolve, reject) => {
      let res = this.sentiment.getSentiment(opts.text)
      resolve(res)
    })
  }

  findEntities(opts){
    return new Promise((resolve, reject) => {
      this.entity_manager.findEntities(opts.text, opts.language).then(resolve, reject)
    })
  }

  addNamedEntity(opts){
    return new Promise((resolve, reject) => {
      this.entity_manager.addNamedEntityText(opts.entity_type, opts.label, opts.languages, opts.options)
      resolve()
    })
  }

  stop(){

  }
}

module.exports = {
  id: 'base-nlp',
  name: 'NLP',
  base: {module: Sentiment, opts: {entity_threshold: 0.8}},
  modules: [
    {
      key: 'analyzeSentiment',
      config: {
        type: 'processor',
        params: {
          text: 'Analyze something'
        }
      }
    },
    {
      key: 'findEntities',
      config: {
        type: 'processor',
        params: {
          text: 'It starts at 10pm',
          language: 'en'
        }
      }
    },
    {
      key: 'addNamedEntity',
      config: {
        type: 'processor',
        params: {
          entity_type: 'hero',
          label: 'Spiderman',
          languages: ['en'],
          options: ['Spiderman', 'Spider-man']
        }
      }
    }
  ]  
}
