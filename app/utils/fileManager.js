const fs = require('fs');
const path = require('path');
const util = require('util');
const info = require('debug')('info')

// set up, invoke the function, wait for the download to complete
async function download(page, f) {
  const downloadPath = path.resolve(
    process.cwd(),
    'output',
    `download-${Math.random()
      .toString(36)
      .substr(2, 8)}`,
  );
  await util.promisify(fs.mkdir)(downloadPath);
  info('Download directory: %o', downloadPath);

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath,
  });

  await f();

  info('Downloading file now...');
  let fileName;
  let idx = 1;
  while (!fileName || fileName.endsWith('.crdownload')) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    [fileName] = await util.promisify(fs.readdir)(downloadPath);
    info('Waiting for file %o to finish download', fileName)
  }

  const filePath = path.resolve(downloadPath, fileName);
  info('Downloaded file: %o', filePath);
  return filePath;
}

async function deleteFolder(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolder(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
    info('Deleted folder: %s', path)
  }
};

module.exports = { download, deleteFolder };