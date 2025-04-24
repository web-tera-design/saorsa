◯初期構成
・gulpfile.js
・packeage.json
・gulpfile.js
・src(中身の階層に基づきgulpfileを書き換える)

◯下記のコードを実行
npm install
→各モジュールなどが生成される。

※本番用フォルダの生成（初回のみ実行でOK）
npx gulp build
→css、js、imgがプロジェクト直下に生成される

◯watchとブラウザの起動（コーディングの際は必ず起動）
npx gulp dev

☆Sassパーシャルファイルの自動登録について
・gulpが起動しているときのみ、実行されます。
・新しくパーシャルファイルを作りたい場合、各フォルダ内にて「◯◯.scss」を作成します
・自動でindex.scssに登録されます。

☆Webp変換について
・gulpが起動しているときのみ、実行されます。
・srcのimgフォルダ内に、png、jpeg、svgなどそのまま格納してください
・本番用のimgフォルダ内に自動でwebpとしてコピーされます。

☆サーバーにアップロードするとき
・このプロジェクトフォルダをコピー
・コピーしたら、「css」「img」「js」「index.html」以外削除
→テスト環境用のフォルダは不要のため
