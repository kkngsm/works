// import webpack from 'webpack';
import * as fs from "fs"
import path, { dirname }   from 'path';

//ファイルとディレクトリのリストが格納される(配列)
const srcPath = path.join(process.cwd(),'src')
const files = fs.readdirSync(srcPath)

// //ディレクトリのリストに絞る
const dirList = files.filter((file) => {
    return fs.statSync(path.join(srcPath, file)).isDirectory() && file != "templates"
})

export default {
  mode: process.env.NODE_ENV,

  entry: "./src/index.ts",
  output: {
    library: 'works',
    libraryTarget: 'umd',
    //  出力ファイルのディレクトリ名
    path: path.join(process.cwd(), "lib"),
    // 出力ファイル名
    filename: 'works.js',
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
  externals: [
    "three",
    "dat.gui"
  ],
}
