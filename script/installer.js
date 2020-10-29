#!/usr/bin/env node

const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')
const rimraf = require('rimraf')

deleteOutputFolder()
  .then(getInstallerConfig)
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  const rootPath = path.join(__dirname, '..')
  const outPath = path.join(rootPath, 'dist')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'Digital Persona Fingerprint Bridge-win32-ia32'),
    exe: 'Digital Persona Fingerprint Bridge.exe',
    authors: 'Toha <tohenk@yahoo.com>',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    setupExe: 'DPFPBridgeSetup.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'app.ico'),
    skipUpdateIcon: true
  })
}

function deleteOutputFolder () {
  return new Promise((resolve, reject) => {
    rimraf(path.join(__dirname, '..', 'dist', 'windows-installer'), (error) => {
      error ? reject(error) : resolve()
    })
  })
}
