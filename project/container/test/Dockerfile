# *************************************************************
# テストデータビルドステージ
# テストで利用する git リポジトリをスクリプトから作成する
# *************************************************************

# https://hub.docker.com/_/debian
FROM debian:bullseye-slim AS test_builder

# ツールのインストール
RUN apt-get update && apt-get install -y \
    # コマンドツール
    parallel \
    git \
    # クリーンアップ
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# テスト用gitリポジトリのビルド用スクリプトの配置
RUN mkdir /usr/src/builder
RUN mkdir /usr/src/repo
COPY ./container/test/builder /usr/src/builder
COPY ./container/test/executor.sh /usr/src/

# テスト用gitリポジトリのビルド
WORKDIR /usr/src/repo
RUN git config --global user.name "test builder" && \
    git config --global user.email "kazurego7@gmail.com"
RUN ls -1 /usr/src/builder \
    | parallel -j 100% /usr/src/executor.sh /usr/src/builder/{}

ENTRYPOINT [ "bash" ]


# *************************************************************
# テスト実行ステージ
# node によるテストの実行を行う
# *************************************************************

# https://hub.docker.com/_/node
FROM node:15.11 AS test_runner
RUN mkdir /usr/src/test
RUN mkdir /usr/src/fit
WORKDIR /usr/src/fit

# ツールのインストール
RUN apt-get update && apt-get install -y \
    # 依存ライブラリ
    libgtk-3-dev \
    libnss3-dev \
    libasound2 \
    # コマンドツール
    git \
    # クリーンアップ
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# プロジェクトをコピー
COPY ./ /usr/src/fit
RUN npm install

# テスト用のリポジトリをコピー
COPY --from=test_builder /usr/src/repo /usr/src/test

# テスト実行
ENTRYPOINT [ "npm", "test" ]