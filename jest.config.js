module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!eos-transit).+\\.js$'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleFileExtensions: ['web.js', 'js', 'json', 'web.jsx', 'jsx', 'ts', 'tsx', 'node'],
  modulePaths: ['<rootDir>/src/'],
  testMatch: ['<rootDir>/**/?(*.)(spec|test).(js|jsx|ts|tsx)'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig-test.json',
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}
