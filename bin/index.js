#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');
const ProgressBar = require('progress')
const { getApkDownloadUrl, downloadApk, closeBrowser, crawlerApkInfo } = require('../src');

yargs(hideBin(process.argv))
  .command(
    'get <pkg>',
    'get package download url with package name',
    (a) => a.positional('pkg', {describe: 'the package name of you need download'}),
    ({pkg, vc}) => {
      console.log(getApkDownloadUrl(pkg, vc));
  })
  .command(
    'down <pkg>',
    'download package with package name',
    (a) => a.positional('pkg', {describe: 'the package name of you need download'})
      .option('directory', {
        alias: 'd',
        type: 'string',
        description: 'directory where the file is saved'
      }),
    async ({pkg, vc, directory}) => {
      let bar = new ProgressBar(`downloading ${pkg.substring(0, 32)} [:bar] :percent :etas`, {total: 0, complete: '#', width: 50});
      const url = await downloadApk(pkg, vc, directory, (current, total, count) => {
        bar.total = total;
        bar.tick(count);
      });
      await closeBrowser();
      console.log('download success', url);
  })
  .command(
    'crawler <pkg>',
    'crawler package info with package name',
    (a) => a.option('with-versions', {
      alias: 'wv',
      type: 'boolean',
      description: 'crawler app info with all versions download info'
    }),
    async ({pkg, withVersions}) => {
      const data = await crawlerApkInfo(pkg, {withVersions});
      await closeBrowser();
      console.log(data);
  })
  .option('version-code', {
    alias: 'vc',
    type: 'number',
    description: 'package version code',
  })
  .parse();