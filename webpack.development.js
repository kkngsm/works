const fs = require("fs");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const modeIsDevelopment = process.env.NODE_ENV == "development";
//ファイルとディレクトリのリストが格納される(配列)
const srcPath = path.join(process.cwd(), "src");
const files = fs.readdirSync(srcPath);

// //ディレクトリのリストに絞る
const dirList = files.filter((file) => {
  return (
    fs.statSync(path.join(srcPath, file)).isDirectory() && file != "templates"
  );
});
const datas = {};
dirList.forEach((dir) => {
  datas[dir] = require(path.join(srcPath, dir, "info.json"));
});

const setting = dirList.map((dir) => {
  const plugin = new HtmlWebpackPlugin({
    inject: false,
    filename: path.join(process.cwd(), "dist", dir, "index.html"),
    template: path.join(process.cwd(), "example/pug/work.pug"),
    data: datas[dir],
  });
  return {
    mode: process.env.NODE_ENV,
    devtool: modeIsDevelopment ? "source-map" : false,
    entry: path.join(process.cwd(), "example/ts/index.ts"),
    output: {
      path: path.join(process.cwd(), "dist", dir),
      filename: `index.js`,
      assetModuleFilename: "assets/[hash]",
    },
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
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
          type: "asset/resource",
        },
        {
          test: /\.pug$/,
          use: [
            {
              loader: "pug-loader",
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts"],
    },
    plugins: [plugin],
  };
});

setting[0].plugins.push(
  new HtmlWebpackPlugin({
    inject: false,
    filename: path.join(process.cwd(), "dist", "index.html"),
    template: path.join(process.cwd(), "example/pug/index.pug"),
    data: datas,
  })
);

module.exports.default = setting;
