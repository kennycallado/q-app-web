#!/bin/bash

ls dist/browser/ | grep main | xargs -I[] sed -i 's/surrealdb/\.\/surrealdb/g' ./dist/browser/[]
ls dist/browser/ | grep chunk | xargs -I[] sed -i 's/surrealdb/\.\/surrealdb/g' ./dist/browser/[]

devcont="$(docker ps -a | grep dev-build | awk '{print $1}')"

if [ -z "$devcont" ]; then
  echo "No dev-build container"
else
  docker container restart $devcont
fi
