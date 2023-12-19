QAppWeb

## NOTES:

- Should modules are the only resources accessible after done?
- There is a problem on live queries keep one eye on it

## TODO:

- [X] papers: order by create
- [X] scores: basic service
- [X] resources: only modules are accessible after done
- [X] lit: consider avoid using lit. angular signal just have improved a lot
- [ ] live: I think when DELETE it's returning the object or is the blob
- [X] youtube: change `@angular/youtube-player` for `@justinribeiro/lite-youtube`
  - [ ] styles: revisar bien, algo se podrá hacer...
- [X] scores: change records for scores

### LIVE SELECT
until it's implemented into wasm I'll use the js sdk

### Dev mode
- `npm run watch` because Surreal breaks ng serve at the same time:
  ``` bash
  docker run --rm -v ./dist/browser/:/usr/share/nginx/html -v ./nginx.conf:/etc/nginx/conf.d/default.conf -p 8000:80 nginx:alpine
  ```
### File generators
- generate guard `ng g guard --skip-tests providers/guards/<>`
- generate servi `ng g service --skip-tests providers/services/<>`
- generate class `ng g class --skip-tests --type=model providers/models/<>`
- generate modul `ng g module modules/<>`
- generate compo `ng g component --module modules/<> modules/<>/components/<>`
