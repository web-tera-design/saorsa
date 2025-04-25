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



GitHubActionsでの自動アップロード

ステップ	内容
①	.github/workflows/deploy.yml を作成（GitHub Actionsの設定）
②	GitHub Secrets に FTP情報を登録（安全に管理）
③	push → GitHubが自動でビルド＆FTPアップロード


✅ ① .github/workflows/deploy.yml を作成する
プロジェクト直下に以下のフォルダ＆ファイルを作ってね：

markdown
コピーする
編集する
.your-project/
└── .github/
    └── workflows/
        └── deploy.yml
👇 中身はこのコード貼ってOK👇

yaml
コピーする
編集する
name: Deploy via FTP

on:
  push:
    branches:
      - main  # ←メインブランチ名。必要なら 'master' に変えてね

jobs:
  ftp-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: 📥 リポジトリをクローン
        uses: actions/checkout@v3

      - name: 🔧 Node.jsセットアップ
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: 📦 依存パッケージをインストール
        run: npm ci

      - name: 🛠️ Gulpビルド実行
        run: npx gulp build

      - name: 🚀 FTPデプロイ
        uses: SamKirkland/FTP-Deploy-Action@v4
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USER }}
          password: ${{ secrets.FTP_PASS }}
          local-dir: ./public  # ← アップロードするディレクトリ（出力先）


✅ ② GitHub Secrets にFTP情報を登録する
GitHubのリポジトリにアクセス

上部メニューの「Settings」 → 左メニュー「Secrets and variables」→「Actions」

「New repository secret」をクリックして以下を登録：


Name	値（Value）
FTP_HOST	例：ftp.example.com
FTP_USER	FTPログインユーザー名
FTP_PASS	FTPログインパスワード
１つづつ登録
Name FTP_HOST
Secret sv16201.xserver.jp
Name FTP_USER
Secret xs655858
Name FTP_PASS
Secret （FTPパスワード）
※ スペル間違い注意！大文字小文字も完全一致で！
→【XServerアカウント】■重要■サーバーアカウント設定完了のお知らせのメールにまんま載ってる

✅ ③ あとは main ブランチに push するだけ！
bash
コピーする
編集する
git add .
git commit -m "add: GitHub Actions for FTP deploy"
git push origin main
すると…GitHubのActionsタブで自動実行が始まって、
ビルドして、public/ 配下をそのままFTPにアップしてくれるよ！