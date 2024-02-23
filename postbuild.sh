#! /usr/bin/env bash

ls dist/browser/ | grep main | xargs -I[] sed -i 's/surrealdb/\.\/surrealdb/g' ./dist/browser/[]
ls dist/browser/ | grep chunk | xargs -I[] sed -i 's/surrealdb/\.\/surrealdb/g' ./dist/browser/[]

# write 'hello' at the second line of the file ./dist/browser/ngsw-worker.js
sed -i '2s/^/importScripts("\.\/assets\/workers\/bg-sync.js");\n/' ./dist/browser/ngsw-worker.js

devcont="$(podman ps -a | grep dev-build | awk '{print $1}')"

if [ -z "$devcont" ]; then
  echo "No dev-build container"
else
  podman container restart $devcont
fi
