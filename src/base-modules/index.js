var express = require('./express')
var mongodb = require('./mongodb')
var httpRequest = require('./http-request')
var puppeteer = require('./puppeteer')


let modules = [express, mongodb, httpRequest, puppeteer]

module.exports = (() => {
  let export_modules = {}
  modules.map((x) => {
    export_modules[x.id] = x
  })
  return export_modules
})()
