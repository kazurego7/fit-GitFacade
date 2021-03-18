#!/bin/bash
set -eu

# テストデータ用の git リポジトリ作成
echo "fuga1" > hoge1.txt
git add -A
git commit -m "puyo1"