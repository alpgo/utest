import sourcemaps from 'rollup-plugin-sourcemaps';
import resolve from 'rollup-plugin-node-resolve';

var sourcemap = true;
var plugins = [];

export default {
    input: 'src/index.js',
    output: {
        file: 'lib/utest.js',
        format: 'cjs',
        sourcemap   
    },
    plugins
};