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

echo "PM2 프로세스 상태 확인 중..."
pm2 describe index.js > /dev/null 2>&1
RUNNING=$?

if [ $RUNNING -ne 0 ]; then
  echo "PM2에서 index.js가 실행 중이지 않습니다. 새로 시작합니다..."
  pm2 start index.js || { echo "PM2로 index.js 시작에 실패했습니다."; exit 1; }
else
  echo "PM2에서 index.js가 실행 중입니다. 재시작합니다..."
  pm2 restart index.js || { echo "PM2로 index.js 재시작에 실패했습니다."; exit 1; }
fi
