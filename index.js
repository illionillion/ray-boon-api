const express = require('express')
const app = express()
const path = require('node:path');
const router = require('./router');

// jsonを使えるようにする
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// ルーティングのモジュールを使えるようにする
app.use('/', router);

// 画像とCSSが読み込まれるようにする
app.use(express.static('public'));
app.use("/img", express.static(path.join(__dirname, "/public/img")));
app.use("/css", express.static(path.join(__dirname, "/public/css")));

app.listen(process.env.PORT || 3000);