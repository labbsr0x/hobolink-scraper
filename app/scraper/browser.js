var info = require('debug')('info')
var debug = require('debug')('debug')
var trace = require('debug')('trace')
const puppeteer = require('puppeteer');
const { download } = require('../utils/fileManager');
const fs = require('fs');

class BrowserClient {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async Launch() {
    if(!this.browser){
      try{
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
        const page = await browser.newPage()  
        this.browser = browser
        this.page = page
        info('Puppeteer Launched')  
      } catch (e) {
        console.error("Entering catch block on puppeteer launch");
        console.error(e);
        return new Error("Can't start puppeteer")
      }
      
    }
    return this
  }

  async GoTo(url, waitFor) {
    if(!this.browser) {
      await this.Launch();
    }
    trace(`Going to URL ${url}`)
    await this.page.goto(url)
    await this.page.setViewport({ width: 1800, height: 827 })
    if (!!waitFor) await this.page.waitForSelector(waitFor)
    debug(`GoTo operation ${url} completed!`)  
    return this
  }

  async Click(onSelector, description,  waitFor) {
    trace(`Clicking on selector ${onSelector} - [${description}]`)  
    await this.page.click(onSelector)

    debug(`Click operation [${description}] completed - Clicked on selector ${onSelector}`)
    if (!!waitFor){
      await this.Wait(waitFor, description)
    }
    return this
  }

  async HardClick(onSelector, description, waitFor) {
    trace(`HARD Clicking on selector ${onSelector} - [${description}]`)  
    await this.page.evaluate(async (onSelector) => {
      await document.querySelector(onSelector).click();  
    }, onSelector)
    
    debug(`HARD Click operation [${description}] completed - Clicked on selector ${onSelector}`)
    if (!!waitFor){
      await this.Wait(waitFor, description)
    }
    return this
  }


  async ClickAll(onSelector, interval, description, waitFor) {
    trace(`ClickAll on selector ${onSelector} - [${description}]`)  

    await this.page.waitForSelector(onSelector, { visible: true })
    let elements = await this.page.$$(onSelector)
    trace('ClickAll matched %o', elements.length)
    // await el.click()
    for (let index = 0; index < elements.length; index++) {
      trace('CLICK AND WAINT ON INDEX %o ELEMENT %o', index, elements[index])
      await elements[index].click()
      await this.page.waitFor(interval)
      
    }
    
    debug(`CLICKANDWAIT [${description}] completed - Clicked on selector ${onSelector}`)
    if (!!waitFor){
      await this.Wait(waitFor, description)
    }
    return this
  }

  async Type(onSelector, value, description) {
    if(!this.browser) {
      await this.Launch();
    }
    await this.page.type(onSelector, value)
    debug(`Type Operation [${description}] - Typed value ${value} on selector ${onSelector}`)
    return this
  }

  async ChangeValue(onSelector, value, description) {
    trace(`Changing Value On Selector ${onSelector} - [${description}] - to value ${value}`)  
    await this.page.evaluate(async (onSelector, value) => {
      const element = await document.querySelector(onSelector)
      element.value = value
    }, onSelector, value)
    
    debug(`Change value operation [${description}] completed`)
    return this
  }

  async Select(onSelector, value, description) {
    await this.page.select(onSelector, value)
    debug(`Select operation [${description}] completed - Selected value ${value} on selector ${onSelector}`)
  }

  async Wait(forSelector, description){
    if(!this.browser) {
      this.Launch();
    }
    trace(`Waiting for selector ${forSelector} - [${description}]`)  
    await this.page.waitFor(forSelector)
    debug(`Wait operation [${description}] completed - Selector ${forSelector} sucessfully located!`)
    return this    
  }

  async Download(onSelector, description) {
    debug(`Clicking on download button with selector ${onSelector} - [${description}]`)
    const path = await download(this.page, async () => {
          await this.page.click(onSelector)
        },
    );
    return path
  }

  async GetValue(selector, description) {
    debug(`Getting value for single selector ${selector} - [${description}]`)
    const value = await this.page.$eval(selector, el => el.value);
    debug('Value Retrieved %o', value)
    return value;
  }

  async GetHtml(selector, description) {
    debug(`Getting html text for single selector ${selector} - [${description}]`)
    const html = await this.page.$eval(selector, el => el.innerHTML);
    debug('Html Retrieved %o', html)
    return html;
  }

  async GetHrefs(selector, description) {
    debug(`Getting html text for single selector ${selector} - [${description}]`)
    const hrefs = await this.page.$$eval(selector, els => els.map((el) => el.href));
    debug('Hrefs Retrieved %o', hrefs)
    return hrefs;
  }

  async Close(){
    if(!!this.browser) {
      await this.browser.close()
    }
  }

  async printPDF(filename) {
    //await page.goto('https://blog.risingstack.com', {waitUntil: 'networkidle0'});
    debug('Generating PDF from Puppeteer Screen.')
    const pdf = await this.page.pdf({ format: 'A4' });
    fs.writeFile(filename, pdf, () => { info(`Arquivo %o salvo com sucesso.`, filename)})
    return this
  }
}
  
module.exports = BrowserClient;