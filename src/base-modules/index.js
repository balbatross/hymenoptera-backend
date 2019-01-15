var express = require('./express')
var mongodb = require('./mongodb')
var httpRequest = require('./http-request')
module.exports = {
  modules: [express, mongodb, httpRequest]
}
