'use strict';
// require()：Node.jsにおけるモジュールの呼び出し
const fs = require('fs');    // fsはFileSystemの略でファイルを扱う際に用いるモジュール
const readline = require('readline');    // readlineはファイルを一行ずつ読み込むモジュール

const rs = fs.createReadStream('./popu-pref.csv');    // 指定したファイルを読み込むstreamを生成
const rl = readline.createInterface({input: rs, output: {} });    // ストリームをインプットとして、読み込んでいく

const prefectureDataMap = new Map();  // 空の連想配列を作成（key:都道府県　value：集計データのオブジェクト）

// lineというイベントが起こったら以下の無名関数を実行してねという記述（line以外にもnodeにはイベントがあるのでAPI Referenceを要チェック）
rl.on('line', lineString => {
    const columns = lineString.split(',');    // ,ごとに文字列を区切っていく（文字列として出力）
    const year = parseInt(columns[0]);    // parseInt()：文字列を数字列に変換する
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    
    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);    // 空の連想配列にgetしても何も得られない
        
        // オブジェクト valueを作成
        if(!value) {    // 空の連想配列しか作っていないので、ここでは初期値の設定をしている
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    };
});

// closeイベントがあった際は無名関数を実行してね、という記述
rl.on('close', () => {
    for (let [key, value] of prefectureDataMap) {    // for-of構文. 分割代入を用いてMapのオブジェクトをそれぞれ第一引数と第二引数に分割代入している
        value.change = value.popu15 / value.popu10;
    }
    // Array.from()：連想配列を普通の配列に変換する
    // sortの際に用いる無名関数は。比較関数という
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;  // 比較関数は並びを同じにしたい場合は0を返し、第一引数＞第二引数にすると第一引数の方が先にくる
    });
    const rankingStrings = rankingArray.map(([key, value]) => {    // 連想配列のMapと関数のmap()は別物なので注意
        return (
            key + 
            ':' +
            value.popu10 +
            '=>' +
            value.popu15 +
            ' 変化率：' +
            value.change
        );
    });
    console.log(rankingStrings);
});