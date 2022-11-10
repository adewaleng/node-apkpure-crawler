const puppeteer = require('puppeteer');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

let browser;

async function getBrowser() {
  if(browser) return browser;
  browser = await puppeteer.launch({headless: true});
  // (await (await browser.newPage()).$$eval('.detail_banner', ))
  return browser;
}

async function newPage(url) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  page.setUserAgent(UA);
  if(url) {
    page.goto(url);
  }
  return page;
}

async function closeBrowser() {
  browser && await browser.close();
}

module.exports = {
  UA,
  getBrowser,
  closeBrowser,
  newPage,
}