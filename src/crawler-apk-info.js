const path = require('path');
const { newPage } = require("./browser");
const { getApkDownloadUrl } = require("./download-apk");


async function crawlerApkInfo(pkg, options) {
  const { withVersions } = options || {};
  const page = await newPage(`https://m.apkpure.com/search?q=${pkg}`);

  try {
    await navigateDetailPage(page);
  } catch (e) {
    throw new Error(`search ${pkg} error: ${e}`);
  }
  
  let data = {};
  try {
    data = {
      packageName: pkg,
      downloadUrl: getApkDownloadUrl(pkg),
      ...await scraperDetailPage(page),
    };
  } catch (e) {
    throw new Error(`scrape detail ${pkg} error: ${e}`);
  }

  if(withVersions) {
    try {
      const url = new URL(page.url());
      await page.goto(path.join(url.origin + url.pathname, 'versions'));
      data.versions = await scraperAllVersions(page, pkg);
    } catch (e) {
      throw new Error(`scrape versions ${pkg} error: ${e}`);
    }
  }

  return data;
}

module.exports = {
  crawlerApkInfo,
}

async function navigateDetailPage(page) {
  await page.waitForSelector('.main .first');
  await Promise.all([
    page.waitForNavigation(),
    page.click('.main .first'),
  ]);
}

async function scraperDetailPage(page) {
  const detailBanner = await page.$('.detail_banner');
  const name = await detailBanner.$eval('.title_link h1', n => n.textContent);
  const latestVersionName = await detailBanner.$eval('.details_sdk span', n => n.textContent);
  const developer = await detailBanner.$eval('.details_sdk a', n => n.textContent);
  const developerUrl = await detailBanner.$eval('.details_sdk a', n => n.getAttribute('href'));
  const updateDate = await detailBanner.$eval('.date', n => n.textContent);
  const shortDescription = await page.$eval('.description-short', n => n.textContent);
  const latestVersionCode = await page.$eval('.download_apk_news[data-dt-version_code]', n => n.getAttribute('data-dt-version_code'));
  return {
    name,
    developer: {
      name: developer,
      url: developerUrl,
    },
    updateDate,
    shortDescription,
    latestVersionCode,
    latestVersionName,
  }
}

async function scraperAllVersions(page, pkg) {
  const versionElementList = await page.$$('.ver-wrap li > a');
  const list = await Promise.all(versionElementList.map(async (versionElement) => {
    // remove xapk
    if((await versionElement.$$eval('.ver-item-wrap span', ns => ns.map(n => n.textContent))).includes('XAPK')) return;

    const versionCode = await versionElement.evaluate(n => n.getAttribute('data-dt-versioncode'));
    const versionName = await versionElement.evaluate(n => n.getAttribute('data-dt-version'));
    const updateDate = await versionElement.$eval('.update-on', n => n.textContent);
    const size = await versionElement.$eval('.ver-item-s', n => n.textContent);
    const downloadUrl = getApkDownloadUrl(pkg, Number(versionCode || 0));
    return {
      versionCode,
      version: versionName,
      downloadUrl,
      size,
      updateDate,
    }
  }));
  return list.filter(i => !!i);
}