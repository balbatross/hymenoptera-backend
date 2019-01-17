var express = require('express');
var FlowEngine = require('./engine');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
app.use(cors())
app.use(bodyParser.json())

let engine = new FlowEngine();

app.get('/api/modules', (req, res) => {
  let modules = engine.getModules().map((x) => {
      return {
        id: x.id,
        name: x.name,
        modules: x.modules
      }
  })
  res.send(modules)
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
