const express = require('express')
const app = express()
const path = require('node:path');
const router = require('./router');

// jsonを使えるようにする
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 画像とCSSが読み込まれるようにする
app.use(express.static('public'));
app.use("/img", express.static(path.join(__dirname, "/public/img")));
app.use("/css", express.static(path.join(__dirname, "/public/css")));

// ルーティングのモジュールを使えるようにする
app.use('/', router);

//不正なパスにアクセスされた時のエラー処理
app.all('*', (req, res) => {
  res.status(404).sendFile(__dirname + '/public/BadPathError.html');
});

module.exports = app;