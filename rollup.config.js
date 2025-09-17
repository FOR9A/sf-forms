import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default {
  input: 'src/index.ts', // or index.tsx if that's your entry
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      dedupe: ['react', 'react-dom']
    }),
    commonjs(),
    babel({
      babelHelpers: 'runtime',
      presets: [
        ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: /node_modules/
    }),
    postcss({
      extract: true, // publish CSS separately OR set inject:true to inline
      minimize: true,
      sourceMap: true
    }),
    terser()
  ],
  external: [
    'next-translate/useTranslation',
    'next-auth/react'
  ]
};