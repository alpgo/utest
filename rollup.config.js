import transpile from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import sourcemaps from 'rollup-plugin-sourcemaps';
import commonjs from 'rollup-plugin-commonjs';

const sourcemap = true;

const plugins = [
    sourcemaps(),
    resolve({
        browser: true,
        preferBuiltins: false,
    }),
    commonjs({
        namedExports: {
            'resource-loader': ['Resource'],
        },
    }),
    string({
        include: [
            '**/*.frag',
            '**/*.vert',
        ],
    }),
    transpile(),
];

export default [{
    input: 'src/index.js',
    output: {
        file: 'lib/utest.js',
        format: 'cjs',
        sourcemap
    },
    plugins
}, {
    input: 'src/index.js',
    output: {
        file: 'dist/utest.js',
        name: 'UTEST',
        format: 'iife',
        sourcemap
    },
    plugins
}];