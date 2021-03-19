# README.md

## 概要
- テストの自動化がしたい
- テストは何度も繰り返されるため、テストリポジトリの状態を再現できるようにしたい  
- テストコード修正に伴うテストリポジトリの修正も git で管理したい

そのため、ビルドスクリプトによって作成したテストリポジトリ群を docker のイメージとして固め、コンテナ上の node でテストを実行する

また、ビルド時間短縮のため、テストリポジトリビルド用のステージと、テスト実行用のステージとに分離する([マルチステージビルドの利用](https://matsuand.github.io/docs.docker.jp.onthefly/develop/develop-images/multistage-build/))

テストリポジトリビルド用のステージでは、テスト用の git リポジトリがビルドされる  
テスト実行用のステージでは、プロジェクトと前のステージのテストリポジトリがコピーされ、node によるテストコマンドが実行される

## ディレクトリ構成
```bash
container
├── test
│   ├── builder         # テストリポジトリのビルドスクリプト群
│   │   └── test1.sh
│   ├── Dockerfile
│   ├── README.md
│   └── executor.sh     # テストリポジトリのビルド実行スクリプト
├── .env
└── docker-compose.yml
```

## テストまでの流れ
1. テストリポジトリのビルドスクリプトを配置
2. 各ステージごとのイメージをビルド
3. テストリポジトリが作成できたかの確認
4. テスト実行

## 1. テストリポジトリのビルドスクリプトを配置
ビルドスクリプトには、すでに `git init` が実行済みのものとして、git のコマンドを記述する

ビルドスクリプトは `container/test/builder` に配置する

ビルドスクリプトの拡張子抜きのファイル名が、リポジトリのルートディレクトリ名となる

ビルドスクリプト `test_hoge.sh` の例
```bash
#!/bin/bash 
set -eu # エラーおよび未定義変数があれば停止

echo "hogehoge" > hoge.txt
git add -A
git commit -m "hogeeee"

echo "fugafuga" > fuga.txt
git add -A
git commit -m "fugaaaa"
```

## 2. 各ステージごとのイメージをビルド
テストリポジトリビルド用のステージ、テスト実行用のステージごとにイメージをビルドする
```
docker-compose build test-builder test-runner
```

## 3. テストリポジトリが作成できたかの確認
コンテナ上の bash に接続し、テストリポジトリが作成されているかを確認する
```
docker-compose run test-builder
```

## 4. テスト実行
コンテナ上の node でテストが実行される
```
docker-compose run test-runner
```