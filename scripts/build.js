import * as esbuild from "esbuild";

const isProduction = process.argv.includes("production");
const isPreview = process.argv.includes("preview");
const watch = process.argv.includes("--watch") || process.argv.includes("-w");

/** @type {import("esbuild").BuildOptions} */
const commonConfig = {
    entryPoints: ["src/index.js", "src/use-gesture.js"],
    bundle: true,
    outdir: "public/",
    jsx: "automatic",
    loader: {
        ".js": "jsx",
        ".jsx": "jsx",
    },
    define: {
        "process.env.NODE_ENV": `"${isProduction ? "production" : "development"}"`,
    },
    sourcemap: true,
    minify: isProduction,
};

if (isPreview) {
    const ctx = await esbuild.context(commonConfig);
    if (watch) {
        await ctx.watch();
    }
    await ctx.serve({
        port: 3000,
        servedir: "public",
    });
} else {
    // Build mode
    if (watch) {
        const ctx = await esbuild.context(commonConfig);
        await ctx.watch();
    } else {
        await esbuild.build(commonConfig);
    }
}
