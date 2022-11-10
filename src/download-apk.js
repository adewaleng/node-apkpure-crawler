const path = require('path');
const https = require('https');
const { createWriteStream } = require('fs');
const { newPage } = require('./browser');

const defaultDir = './';

function getApkDownloadUrl(pkg, versionCode) {
  if(!pkg) return;
  if(!versionCode) return `https://d.apkpure.com/b/APK/${pkg}?version=latest`;
  return `https://d.apkpure.com/b/APK/${pkg}?versionCode=${versionCode}`;
}

async function downloadApk(pkg, versionCode, dir, progress) {
  const url = getApkDownloadUrl(pkg, versionCode);
  const downloadUrl = await getWinudfUrl(url);
  progress = progress ||(() => {});

  return await new Promise((resolve, reject) => {
    const file = createWriteStream(path.resolve(dir || defaultDir ,`${pkg}-${versionCode || 'latest'}.apk`));
    https.get(downloadUrl, res => {
      res.pipe(file);
      const total = Number(res.headers['content-length'] || Number.MAX_SAFE_INTEGER);
      let length = 0;
      progress(0, total, 0);
      res.on('data', chunk => {
        progress(length + chunk.length, total, chunk.length);
      })
      file.on("finish", () => {
        file.close();
        resolve(file.path);
      });
      file.on('error', e => {
        reject(e);
      })
    });
  })
}

async function getWinudfUrl(url) {
  const page = await newPage();
  await page.setRequestInterception(true);

  const downloadUrl = await new Promise(async (resolve, reject) => {
    page.on('request', async (event) => {
      const u = event.url();
      if (event.isInterceptResolutionHandled())
        return;
      if (!/^https:\/\/d-[0-9a-z]*\.winudf\.com/.test(u))
        return await event.continue();
      await event.respond({ status: 200, body: '' });
      resolve(u);
    });
    // if call setRequestInterception(true) will introduce bug https://github.com/puppeteer/puppeteer/issues/3118
    page.goto(url).catch((e) => {
      // When the error is reported, it means success.
      if (e.message === 'Navigation failed because browser has disconnected!')
        return;
      throw e;
    });
    setTimeout(() => {
      reject(new Error('timeout get download url'));
    }, 5000);
  });

  await page.close();
  return downloadUrl;
}

exports.getApkDownloadUrl = getApkDownloadUrl;
exports.downloadApk = downloadApk;