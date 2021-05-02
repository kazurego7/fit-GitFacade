#!/bin/bash
# **********************************************
# テストリポジトリのビルド実行
# $1 : テストリポジトリのビルドスクリプトのパス
# **********************************************

# コマンドのエラーでビルドエラーとなるように設定
set -eu

# テストリポジトリの作成
FILE_PATH=$1
FILE_NAME=${FILE_PATH##*/}
TEST_NAME=${FILE_NAME%.*}
mkdir $TEST_NAME
cd $TEST_NAME
git init
git commit --allow-empty -m first-commit
git branch -m master main

# テストリポジトリのビルドスクリプトの実行
$FILE_PATH
