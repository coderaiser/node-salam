import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';

const noop = () => {};
const onlyIf = (a, plugin) => a ? plugin : noop;

const {NODE_ENV} = process.env;
const isProd = NODE_ENV === 'production';

export default {
    entry: 'client/index.js',
    moduleName: 'salam',
    plugins: [
        commonjs({
            include: [
                'client/**',
                'node_modules/**',
            ],
            namedExports: {
                'load.js': [
                    'js',
                ],
            }
        }),
        nodeResolve({
            preferBuiltins: true,
            browser: true,
        }),
        babel({
            exclude: 'node_modules/**'
        }),
        onlyIf(isProd, uglify()),
        onlyIf(isProd, filesize()),
    ]
};

