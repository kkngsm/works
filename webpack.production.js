const fs = require("fs");
const path = require("path");

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
const entry = {};
dirList.forEach((dir) => {
  entry[dir] = path.resolve(srcPath, dir, "index.ts");
});
module.exports.default = {
  mode: process.env.NODE_ENV,
  entry,
  output: {
    libraryTarget: "umd",
    globalObject: "this",
    //  出力ファイルのディレクトリ名
    path: path.resolve(process.cwd(), "lib"),
    // 出力ファイル名
    filename: "[name].js",
    assetModuleFilename: "assets/[hash]",
  },
  module: {
    rules: [
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
    ],
  },
  resolve: {
    extensions: [".ts"],
  },
  externals: ["three", "dat.gui"],
};
