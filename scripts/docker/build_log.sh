#! /bin/sh
## SET THE HEALTH CHECKS

logfile=/srv/app/public/build.log

echo "APP "$(cat .git/config | grep url | sed -e 's/\// /g' | awk '{print $4}' | sed 's/.git//g') > $logfile
echo "GIT_BRANCH "$(cat .git/HEAD) >> $logfile
echo "GIT_SHA "$(cat .git/$(cat .git/HEAD | awk '{print $2}')) >> $logfile
echo "BUILT_AT "$(date -u +"%Y%m%dT%H:%M:%S") >> $logfile
echo "build.log" && cat $logfile
