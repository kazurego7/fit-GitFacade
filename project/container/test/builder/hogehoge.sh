#!/bin/bash
set -eu

# テストデータ用の git リポジトリ作成
echo "fuga" > hoge.txt
git add -A
git commit -m "puyo"