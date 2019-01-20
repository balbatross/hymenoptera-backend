var express = require('express');
var FlowEngine = require('./engine');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
var routes = require('./routes')
var MongoClient = require('mongodb').MongoClient;

const uuid = require('uuid')

app.use(cors())
app.use(bodyParser.json())

let data_conf = {
  url: 'mongodb://localhost',
  db: 'hymenoptera'
}

MongoClient(data_conf.url).connect((err, conn) => {
  const db = conn.db(data_conf.db)

  let engine = new FlowEngine(db)
  app.use('/api', routes(engine))

})

app.post('/api/run', (req, res) => {
  let flow = req.body.flow;
  engine.parse(flow)
  res.send({message: "Started"})
})

app.post('/api/stop', (req, res) => {
  engine.stop()
  res.send({message: "Stopped"})
})

app.listen(8000)
