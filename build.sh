#!/bin/sh
#STC_PATH="/home/q/php/STC"
STC_PATH="/usr/local/php/lib/php/STC"
path=`dirname $0`;

if [ -d ${path}"/output" ];then
        rm -rf ${path}"/output";
fi
mkdir ${path}"/output";
if [ ! -f ${path}"/config.php" ];then
        cp $STC_PATH/config/config.php ${path};
fi
#path=$(pwd);
#/usr/local/bin/php $STC_PATH/index.php ${path} minos $1;

#echo "/usr/local/php/bin/php $STC_PATH/index.php ${path} minos $1";
#exit 1;

/usr/local/php/bin/php $STC_PATH/index.php ${path} minos $1;

if [ -f ${path}"/stc.error.log" ]; then
    rm -rf ${path}"/stc.error.log";
    exit 1;
fi

