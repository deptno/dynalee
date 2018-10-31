export = {
  preset                    : 'ts-jest',
  globals                   : {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
    }
  },
  moduleFileExtensions      : [
    'ts',
    'js'
  ],
  transform                 : {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testMatch                 : [
    '**/*.spec.ts'
  ],
  testPathIgnorePatterns    : [
    '__tests__',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  coverageReporters         : [
    'json',
    'lcov',
    'text',
    'text-summary'
  ]
}