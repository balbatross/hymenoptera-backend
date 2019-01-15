var express = require('express');
var HymenFlowEngine = require('./engine');
var app = express();
var bodyParser = require('body-parser')
var cors = require('cors');
app.use(cors())
app.use(bodyParser.json())

let engine = new HymenFlowEngine();

app.get('/api/modules', (req, res) => {
  let modules = engine.getModules().map((x) => {
      return {
        id: x.id,
        modules: x.modules
      }
  })
  res.send(modules)
})

app.post('/api/run', (req, res) => {
  let flow = req.body.flow;
  engine.parse(flow)
})

app.listen(8000)
