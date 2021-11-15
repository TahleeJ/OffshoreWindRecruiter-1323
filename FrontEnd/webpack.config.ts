import path from "path";
import { Configuration } from "webpack";
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';


const config: Configuration & any = {
    entry: "./src/index.tsx",
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
				exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react",
                            "@babel/preset-typescript",
                        ],
                    },
                },
            },
        ],
    },
	// The "plugin" has better type checking but it gets caught on the styling, so...
    // plugins: [
    //     new ForkTsCheckerWebpackPlugin({
    //         async: false,
    //         eslint: {
    //             files: "./src/**/*",
    //         }
    //     }),
    // ],

    // optimization: { //this will minimize the files
    //     minimize: true
    // },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve("app"),
        filename: "bundle.js",
    },
    devServer: {
        static: path.resolve("app"),
        compress: true,
        port: 4000,
    },
};

export default config;