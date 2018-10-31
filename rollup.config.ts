import * as babel from 'rollup-plugin-babel'
import * as commonjs from 'rollup-plugin-commonjs'

export = async (argv) => {
  return {
    input   : 'build/index.js',
    output  : {
      exports: 'named',
      format : 'cjs',
      file   : 'dist/index.js',
    },
    external: [
      'filename-logger',
      'immer',
      'debug',
      'aws-sdk',
      'ramda',
      'number-converter-alphabet'
    ],
    plugins : [
      babel({
        presets   : [
          ['@babel/preset-env', {
            targets: {
              node: '8.10'
            }
          }],
        ],
        extensions: ['.js']
      }),
      commonjs({
        ignore: ['immer']
      })
    ],
  }
}
