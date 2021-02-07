# https://hub.docker.com/_/node
FROM node:12.20-alpine

# vscode 拡張を管理するツール vsce のインストール
RUN npm install -g vsce

# ビルドするプロジェクトの保存ディレクトリを作成
ARG SRC_DIR="/usr/src"
RUN mkdir ${SRC_DIR}
WORKDIR ${SRC_DIR}

# ビルド用のプロジェクトをコピー
ARG PROJECT_ROOT
COPY ${PROJECT_ROOT} ${SRC_DIR}
RUN npm install

# vsix ファイルのビルド
RUN vsce package

# vscode 拡張を publish する(Personal Access Token は、コンテナ起動時に環境変数で指定)
ENV ACCESS_TOKEN=""
ENTRYPOINT ["/bin/sh", "-l", "-c", "vsce publish --pat $ACCESS_TOKEN" ]