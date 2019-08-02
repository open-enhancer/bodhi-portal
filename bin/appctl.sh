#!/bin/bash
SCRIPT_DIR=`dirname $0`
cd $SCRIPT_DIR
SCRIPT_DIR=`pwd`

cd $SCRIPT_DIR/../

BASE_HOME=`pwd`


NODEJS=node

mkdir -p ${BASE_HOME}/logs

STDOUT_LOG=${BASE_HOME}/logs/stdout.log

ACTION=$1

start() {
  PORT=`cat ${BASE_HOME}/config/system.js | grep 'port:' | tr -d "port\:\ \,\""`
  arr=($PORT)
  PORT=${arr[0]}

  STATUS_URL=http://127.0.0.1:$PORT/__status
  STATUS=`curl --silent $STATUS_URL`
  if [ "$STATUS" == "OK" ]; then
    echo "Bodhi portal is already started at port $PORT. Visit: http://localhost:$PORT"
    echo "Bodhi Portal 已经启动在端口 $PORT 。访问：http://localhost:$PORT"
    exit
  fi

  $NODEJS $SCRIPT_DIR/start >$STDOUT_LOG 2>&1 &
  sleep 3
  STATUS=`curl --silent $STATUS_URL`
  if [ "$STATUS" == "OK" ]; then
    echo "Bodhi portal is started at port $PORT. Visit: http://localhost:$PORT/$homeBase"
    echo "Bodhi portal 已经启动在端口 $PORT 。访问：http://localhost:$PORT/$homeBase"
  else
    echo "Bodhi portal can not be started properly, please see details in './logs/stdout.log'."
    echo "Bodhi portal 无法正常启动，请在 './logs/stdout.log' 日志文件中查看错误细节。"
    stop
  fi
}

stop() {
  ps -ef |grep node | grep ${BASE_HOME} |grep -v grep|awk '{print $2}'|xargs kill -9
  echo "Bodhi portal stopped."
  echo "Bodhi portal 已停止。"
}

case "$ACTION" in
  start)
    start
  ;;
  stop)
    stop
  ;;
  restart)
    stop
    start
  ;;
esac