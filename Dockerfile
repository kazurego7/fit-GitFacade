# *************************************************************
# テストリポジトリのビルドステージ
# テストで利用する git リポジトリをスクリプトからビルドする
# *************************************************************

# https://hub.docker.com/_/debian
FROM debian:buster-slim AS test_builder

# ツールのインストール
RUN apt-get update && apt-get install -y \
    # コマンドツール
    parallel \
    git \
    # クリーンアップ
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# git の初期設定
RUN git config --global user.name "test builder" && \
    git config --global user.email "kazurego7@gmail.com"

# 自作ツールのインストール
COPY tools/git-subcommand /usr/local/bin

# テスト用gitリポジトリのビルド用スクリプトの配置
RUN mkdir /usr/src/builder
RUN mkdir /usr/src/repo
COPY builder /usr/src/builder
COPY executor.sh /usr/src/

# テスト用gitリポジトリのビルド
WORKDIR /usr/src/repo
RUN ls -1 /usr/src/builder \
    | parallel -j 100% /usr/src/executor.sh /usr/src/builder/{}

ENTRYPOINT [ "bash" ]


# *************************************************************
# テスト実行ステージ
# node によるテストの実行を行う
# *************************************************************

# https://hub.docker.com/_/node
FROM node:15-buster-slim AS test_runner
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

# git の初期設定
RUN git config --global user.name "test builder" && \
    git config --global user.email "kazurego7@gmail.com"

# プロジェクトをコピー
COPY ./ /usr/src/fit
RUN npm install

# テスト用のリポジトリをコピー
COPY --from=fit_test_builder /usr/src/repo /usr/src/repo

# テスト実行
ENTRYPOINT ["npm", "test"]