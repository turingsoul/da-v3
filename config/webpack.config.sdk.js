"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const resolve = require("resolve");
const PnpWebpackPlugin = require("pnp-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const InlineChunkHtmlPlugin = require("react-dev-utils/InlineChunkHtmlPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const safePostCssParser = require("postcss-safe-parser");
const ManifestPlugin = require("webpack-manifest-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const paths = require("./paths");
const getClientEnvironment = require("./env");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin-alt");
const typescriptFormatter = require("react-dev-utils/typescriptFormatter");

const CleanWebpackPlugin = require("clean-webpack-plugin");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === "./";
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";
// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== "false";
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);
//zip
const ZipPlugin = require("zip-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified["process.env"].NODE_ENV !== '"production"') {
    throw new Error("Production builds must have NODE_ENV=production.");
}

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const version = require(path.resolve(__dirname, "../package.json")).version;

function pathResolve(dir) {
    return path.join(__dirname, "..", dir);
}

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: Object.assign(
                {},
                shouldUseRelativeAssetPaths
                    ? { publicPath: "../../" }
                    : undefined
            )
        },
        {
            loader: require.resolve("css-loader"),
            options: cssOptions
        },
        {
            // Options for PostCSS as we reference these options twice
            // Adds vendor prefixing based on your specified browser support in
            // package.json
            loader: require.resolve("postcss-loader"),
            options: {
                // Necessary for external CSS imports to work
                // https://github.com/facebook/create-react-app/issues/2677
                ident: "postcss",
                plugins: () => [
                    require("postcss-flexbugs-fixes"),
                    require("postcss-preset-env")({
                        autoprefixer: {
                            flexbox: "no-2009"
                        },
                        stage: 3
                    })
                ],
                sourceMap: shouldUseSourceMap
            }
        }
    ];
    if (preProcessor) {
        loaders.push({
            loader: require.resolve(preProcessor),
            options: {
                sourceMap: shouldUseSourceMap
            }
        });
    }
    return loaders;
};

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    mode: "production",
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    // devtool: shouldUseSourceMap ? "source-map" : false,
    devtool:false,
    // In production, we only want to load the app code.
    // entry: {
    //     index: path.resolve(__dirname, "../src/corejs/index.js")
    // },
    // output:{
    //     path: path.resolve(__dirname, "dist"),
    //     filename: "dashboard.core.js"
    // },
    entry: [
        path.resolve(__dirname, "../src/corejs/index.js")
    ],
    output: {
        path: paths.sdkBuild,
        filename: "dashboard.core.js"
    },
    resolve: {
        extensions: [".js", ".jsx"],
        alias: {
            corejs: pathResolve("src/corejs"),
            components: pathResolve("src/corejs/components"),
            dashboard: pathResolve("src/dashboard"),
            page: pathResolve("src/dashboard/page"),
            componentsUi: pathResolve("src/dashboard/components"),
            resource: pathResolve("src/dashboard/resource"),
            util: pathResolve("src/dashboard/util"),
            xdux: pathResolve("src/dashboard/xdux"),
            submit: pathResolve("src/dashboard/submit"),
            reedite: pathResolve("src/dashboard/reedite"),
            node_modules: pathResolve("src/node_modules")
        }
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /(\.(png|jpg|ttf|woff|svg|eot|gif|bmp)$)/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 10000,
                            name: "resource/[name].[hash:7].[ext]"
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "less-loader"
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["sdk"]),
        new ExtractTextPlugin("styles.css"),
    ].filter(Boolean),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: "empty",
        fs: "empty",
        net: "empty",
        tls: "empty",
        child_process: "empty"
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false
};
