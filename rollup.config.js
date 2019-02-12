import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
// import css from 'rollup-plugin-css-only'
import css from '@modular-css/rollup';

const config = {
    input: 'src/components/index.js',
    external: ['react', 'prop-types'],
    output: {
        dest: 'build/carousel.css',
        format: 'umd',
        name: 'carousel',
        globals: {
            react: 'React',
            "prop-types": 'prop-types'
        }
    },
    plugins: [
      // css({ output: 'build/carousel.css' }),
      css({
        json: true,
        styleExport: false,
        map: { inline : false }
      }),
      babel({
          exclude: "node_modules/**"
      }),
      terser()
  ],
}
export default config
