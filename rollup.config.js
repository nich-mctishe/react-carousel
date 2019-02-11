import { terser } from 'rollup-plugin-terser'
import babel from 'rollup-plugin-babel'
import css from 'rollup-plugin-css-only'

const config = {
    input: 'src/components/index.js',
    external: ['react'],
    output: {
        format: 'umd',
        name: 'carousel',
        globals: {
            react: 'React'
        }
    },
    plugins: [
      css({ output: 'build/carousel.css' }),
      babel({
          exclude: "node_modules/**"
      }),
      terser()
  ],
}
export default config
