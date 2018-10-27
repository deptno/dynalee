import * as babel from 'rollup-plugin-babel'
import * as commonjs from 'rollup-plugin-commonjs'

export = async (argv) => {
  return {
    plugins,
    entry  : 'build/index.js',
    output : {
      exports: 'named',
      format : 'cjs',
      file   : 'dist/index.js',
    },
    exports: 'default'
  }
}

const plugins = [
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
  commonjs()
]

