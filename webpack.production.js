const fs = require("fs");
const path = require("path");

//ファイルとディレクトリのリストが格納される(配列)
const srcPath = path.resolve(process.cwd(), "src");
const files = fs.readdirSync(srcPath);

const extludeDir = ["templates", "test"];
// //ディレクトリのリストに絞る
const dirList = files.filter((file) => {
  return (
    fs.statSync(path.resolve(srcPath, file)).isDirectory() &&
    !extludeDir.includes(file)
  );
});
console.log(dirList);
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
    path: path.resolve(process.cwd(), "lib"),
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
