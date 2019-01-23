var express = require('./express')
var mongodb = require('./mongodb')
var httpRequest = require('./http-request')
var puppeteer = require('./puppeteer')
var cron = require('./scheduler')
var tts = require('./tts')
var sentiment = require('./sentiment');

let modules = [
  express,
  mongodb,
  httpRequest,
  puppeteer, 
  cron,
  tts,
  sentiment
]

module.exports = (() => {
  let export_modules = {}
  modules.map((x) => {
    export_modules[x.id] = x
  })
  return export_modules
})()
