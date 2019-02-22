"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", err => {
    throw err;
});

// Ensure environment variables are read.
require("../config/env");

const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const clearConsole = require("react-dev-utils/clearConsole");
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
const {
    choosePort,
    createCompiler,
    //   prepareProxy,
    prepareUrls
} = require("react-dev-utils/WebpackDevServerUtils");
const openBrowser = require("react-dev-utils/openBrowser");
const paths = require("../config/paths");
const config = require("../config/webpack.config.dev");
const createDevServerConfig = require("../config/webpackDevServer.config");

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
    return (err, req, res) => {
        const host = req.headers && req.headers.host;
        console.log(
            chalk.red("Proxy error:") +
                " Could not proxy request " +
                chalk.cyan(req.url) +
                " from " +
                chalk.cyan(host) +
                " to " +
                chalk.cyan(proxy) +
                "."
        );
        console.log(
            "See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (" +
                chalk.cyan(err.code) +
                ")."
        );
        console.log();

        // And immediately send the proper error response to the client.
        // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
        if (res.writeHead && !res.headersSent) {
            res.writeHead(500);
        }
        res.end(
            "Proxy error: Could not proxy request " +
                req.url +
                " from " +
                host +
                " to " +
                proxy +
                " (" +
                err.code +
                ")."
        );
    };
}

function prepareProxy(proxy = {}, appPublicFolder) {
    let config = {
        target: proxy.target || "",
        auth: proxy.auth || "",
        secure: false,
        logLevel: "silent",
        // For single page apps, we generally want to fallback to /index.html.
        // However we also want to respect `proxy` for API calls.
        // So if `proxy` is specified as a string, we need to decide which fallback to use.
        // We use a heuristic: We want to proxy all the requests that are not meant
        // for static assets and as all the requests for static assets will be using
        // `GET` method, we can proxy all non-`GET` requests.
        // For `GET` requests, if request `accept`s text/html, we pick /index.html.
        // Modern browsers include text/html into `accept` header when navigating.
        // However API calls like `fetch()` won’t generally accept text/html.
        // If this heuristic doesn’t work well for you, use a custom `proxy` object.
        context: function(pathname, req) {
            let result = true;
            if(proxy.test && proxy.test.test){
                result = proxy.test.test(pathname);
            }
            return (
                req.method !== "GET" || (mayProxy(pathname) && req.headers.accept && result)
            );
        },
        onProxyReq: proxyReq => {
            // Browers may send Origin headers even with same-origin
            // requests. To prevent CORS issues, we have to change
            // the Origin to match the target URL.
            if (proxyReq.getHeader("origin")) {
                proxyReq.setHeader("origin", proxy.target);
            }
        },
        onError: onProxyError(proxy.target || ""),
        secure: false,
        changeOrigin: true,
        ws: true,
        xfwd: true
    };

    // Otherwise, if proxy is specified, we will let it handle any request except for files in the public folder.
    function mayProxy(pathname) {
        const maybePublicPath = path.resolve(
            appPublicFolder,
            pathname.slice(1)
        );
        return !fs.existsSync(maybePublicPath);
    }

    return [config];
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
    console.log(
        chalk.cyan(
            `Attempting to bind to HOST environment variable: ${chalk.yellow(
                chalk.bold(process.env.HOST)
            )}`
        )
    );
    console.log(
        `If this was unintentional, check that you haven't mistakenly set it in your shell.`
    );
    console.log(
        `Learn more here: ${chalk.yellow("http://bit.ly/CRA-advanced-config")}`
    );
    console.log();
}

// We require that you explictly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
checkBrowsers(paths.appPath, isInteractive)
    .then(() => {
        // We attempt to use the default port but if it is busy, we offer the user to
        // run on a different port. `choosePort()` Promise resolves to the next free port.
        return choosePort(HOST, DEFAULT_PORT);
    })
    .then(port => {
        if (port == null) {
            // We have not found a port.
            return;
        }
        const protocol = process.env.HTTPS === "true" ? "https" : "http";
        const appName = require(paths.appPackageJson).name;
        const urls = prepareUrls(protocol, HOST, port);
        // Create a webpack compiler that is configured with custom messages.
        const compiler = createCompiler(
            webpack,
            config,
            appName,
            urls,
            useYarn
        );
        // Load proxy config
        const proxySetting = require("../config/webpack.config.dev").devServer
            .proxy;
        const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
        // Serve webpack assets generated by the compiler over a web server.
        const serverConfig = createDevServerConfig(
            proxyConfig,
            urls.lanUrlForConfig
        );
        const devServer = new WebpackDevServer(compiler, serverConfig);
        // Launch WebpackDevServer.
        devServer.listen(port, HOST, err => {
            if (err) {
                return console.log(err);
            }
            if (isInteractive) {
                clearConsole();
            }
            console.log(chalk.cyan("Starting the development server...\n"));
            openBrowser(urls.localUrlForBrowser);
        });

        ["SIGINT", "SIGTERM"].forEach(function(sig) {
            process.on(sig, function() {
                devServer.close();
                process.exit();
            });
        });
    })
    .catch(err => {
        if (err && err.message) {
            console.log(err.message);
        }
        process.exit(1);
    });
