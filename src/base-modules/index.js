var express = require('./express')
var mongodb = require('./mongodb')
var httpRequest = require('./http-request')
var puppeteer = require('./puppeteer')

module.exports = {
  modules: [express, mongodb, httpRequest, puppeteer]
}
