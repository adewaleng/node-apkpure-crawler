apkpure-crawler is a tool to automatically retrieve APKs from [apkpure](https://m.apkpure.com)

## Install
```
npm install -g apkpure-crawler
```

## Use in command line
```
apkcrawl help
Commands:
  apkcrawl get <pkg>      get package download url with package name
  apkcrawl down <pkg>     download package with package name
  apkcrawl crawler <pkg>  crawler package info with package name

Options:
  --help                Show help                                      [boolean]
  --version             Show version number                            [boolean]
  --version-code, --vc  package version code                            [number]
```

example: 
```
apkcrawl get com.ea.gp.fifamobile

# output
https://d.apkpure.com/b/APK/com.ea.gp.fifamobile?version=latest
```
```
apkcrawl down com.ea.gp.fifamobile 

# output
downloading com.ea.gp.fifamobile [##################################################] 100% 0.0s
download success /Users/adewale/node-apkpure-crawler/com.ea.gp.fifamobile-latest.apk
```
```
apkcrawl crawler com.ea.gp.fifamobile

# output
{
  packageName: 'com.ea.gp.fifamobile',
  downloadUrl: 'https://d.apkpure.com/b/APK/com.ea.gp.fifamobile?version=latest',
  name: 'FIFA World Cup 2022™',
  developer: { name: 'ELECTRONIC ARTS', url: '/developer/ELECTRONIC%20ARTS' },
  updateDate: '2022-11-03',
  shortDescription: '\n' +
    'Play FIFA Soccer in 30 leagues and 650 teams with players around the world!\n',
  latestVersionCode: '40210',
  latestVersionName: '18.0.02'
}
```


## Use in javascript
```javascript
const apkpureCrawler = require('apkpure-crawler');

async function main() {
  const data = await apkpureCrawler.crawlerApkInfo('com.ea.gp.fifamobile', {withVersions: true});
  console.log(data);
  apkpureCrawler.closeBrowser();
}

main();
```

## Possible problems

```
Error: Failed to launch the browser process!
/root/.cache/puppeteer/chrome/linux-1056772/chrome-linux/chrome: error while loading shared libraries: libatk-bridge-2.0.so.0: cannot open shared object file: No such file or directory
```
I fixed it by `sudo yum install atk java-atk-wrapper at-spi2-atk gtk3 libXt` in centOS
[see more solutions](https://github.com/puppeteer/puppeteer/issues/1598)


```
Error: Failed to launch the browser process!
[1111/170542.396615:ERROR:zygote_host_impl_linux.cc(100)] Running as root without --no-sandbox is not supported. See https://crbug.com/638180.
```
Just switch your users