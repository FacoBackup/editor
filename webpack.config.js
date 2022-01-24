module.exports = {
    module: {
        rules: [
            {
                test: /\.worker\.(c|m)?js$/i,
                loader: "worker-loader",
                options: {
                    esModule: false,
                },
            },
        ],
    },  optimization: {
        minimize: false
    },
};