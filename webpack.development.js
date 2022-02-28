const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const modeIsDevelopment = process.env.NODE_ENV == "development";
//ファイルとディレクトリのリストが格納される(配列)
const srcPath = path.resolve(process.cwd(), "src");
const files = fs.readdirSync(srcPath);

// //ディレクトリのリストに絞る
const dirList = files.filter((file) => {
  return (
    fs.statSync(path.resolve(srcPath, file)).isDirectory() &&
    file != "templates"
  );
});
const datas = {};
dirList.forEach((dir) => {
  datas[dir] = require(path.resolve(srcPath, dir, "info.json"));
});

const setting = dirList.map((dir) => {
  const plugin = new HtmlWebpackPlugin({
    inject: false,
    filename: path.resolve(process.cwd(), "dist", dir, "index.html"),
    template: path.resolve(process.cwd(), "example/pug/work.pug"),
    data: datas[dir],
  });
  return {
    mode: process.env.NODE_ENV,
    devtool: modeIsDevelopment ? "source-map" : false,
    entry: path.resolve(process.cwd(), "example/ts/index.ts"),
    output: {
      path: path.resolve(process.cwd(), "dist", dir),
      filename: `index.js`,
      assetModuleFilename: "assets/[hash]",
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          exclude: /node_modules/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                url: false,
                sourceMap: modeIsDevelopment,
                importLoaders: 2,
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: modeIsDevelopment,
              },
            },
          ],
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.json",
            },
          },
        },
        {
          test: /\.(glsl|vs|fs|vert|frag)$/,
          exclude: /node_modules/,
          type: "asset/source",
        },
        {
          test: /\.(glb|gltf)$/,
          exclude: /node_modules/,
          type: "asset/resource",
        },
        {
          test: /\.pug$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "pug-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {
        "@work": path.resolve(srcPath, dir),
      },
      extensions: [".ts"],
    },
    plugins: [plugin],
  };
});

setting[0].plugins.push(
  new HtmlWebpackPlugin({
    inject: false,
    filename: path.resolve(process.cwd(), "dist", "index.html"),
    template: path.resolve(process.cwd(), "example/pug/index.pug"),
    data: datas,
  })
);

module.exports.default = setting;
