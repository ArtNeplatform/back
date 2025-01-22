#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

# 환경 변수 추가
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v22.13.0/bin

# yarn 실행
yarn || { echo "Yarn 설치 또는 실행에 실패했습니다."; exit 1; }

# dist 디렉토리 확인
# if [ ! -d "$REPOSITORY/dist" ]; then
#     echo "dist 디렉토리가 없습니다. 빌드가 올바르게 완료되지 않았습니다."
#     exit 1
# fi

# pm2 실행
# pm2 start dist || { echo "PM2 실행에 실패했습니다."; exit 1; }

pm2 start app.js