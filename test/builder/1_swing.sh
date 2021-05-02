#!/bin/bash
set -eu # エラーおよび未定義変数があれば停止

git commit --allow-empty -m commit1-1

echo line1 >>file1.txt
echo line1 >>file2.txt
git add -A
git commit -m commit1-2

git branch b2
git checkout b2
git commit --allow-empty -m commit2-1

git checkout main
git branch b3
git checkout b3
git commit --allow-empty -m commit3-1
echo line2 >>file1.txt
echo line2 >>file2.txt
echo line1 >>file3.txt
git add file1.txt
