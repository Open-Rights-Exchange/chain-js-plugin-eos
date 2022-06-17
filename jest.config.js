const fs = require('fs')

function makeModuleNameMapper() {
  const aliases = {}
  const { paths } = JSON.parse(fs.readFileSync('./tsconfig-paths.json')).compilerOptions

  // Iterate over paths and convert them into moduleNameMapper format
  Object.keys(paths).forEach(item => {
    const key = item.replace('/*', '/(.*)')
    const path = paths[item][0].replace('/*', '/$1')
    aliases[key] = `<rootDir>/${path}`
  })
  return aliases
}

module.exports = {
  automock: false,
  roots: ['<rootDir>/tests', '<rootDir>/src/plugin/tests'],
  setupFiles: ['<rootDir>/tests/setupJest.js'],
  testMatch: ['<rootDir>/src/**/?(*.)(spec|test).(js|ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig-cjs.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
  moduleNameMapper: makeModuleNameMapper(),
}
