import { stylusLoader } from "esbuild-stylus-loader";
import esbuild from "esbuild";
import process from "process";

const isWatching = (process.argv[2] === "--watch");

esbuild.build({
    entryPoints: [
        'src/index.mjs',
    ],
    bundle: true,
    minify: true,
    sourcemap: true,
    watch: isWatching,
    outdir: 'dist',
    plugins: [
        stylusLoader({
            stylusOptions: {},
        })
    ],
});