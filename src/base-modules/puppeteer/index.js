const puppeteer = require('puppeteer-core');


class WebDriver {
  constructor(opts, cb){
    puppeteer.launch({executablePath: opts.execPath, headless: opts.headless}).then((browser) =>  {
      this.browser = browser;

      this.browser.newPage().then((page) => {
        this.page = page
      })
    })
  }
  
  toPage(opts){
    return new Promise((resolve, reject) => {
      console.log("going to page")
      this.page.goto(opts.url).then(() => {
        console.log("Went to page")
        resolve()
      }, (err) => {
        reject(err)
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  click(opts){
    return new Promise((resolve, reject) => {
       this.page.click(opts.selector, {delay: opts.delay}).then((cr) => {
        console.log(cr)
        resolve()
       })
    })
  }
} 

module.exports = {
  id: 'base-webdriver',
  name: 'Puppeteer',
  base: {module: WebDriver, opts: {execPath: 'string', headless: 'bool'}},
  modules: [
    {
      key: 'toPage',
      config: {
        type: 'process',
        params: {
          url: 'string'
        }
      }
    },
    {
      key: 'click',
      config: {
        type: 'process',
        params: {
          selector: 'string', 
          delay: 'int'
        }
      }
    }
  ]  
}

