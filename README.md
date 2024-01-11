QAppWeb

## NOTES:

- Should modules are the only resources accessible after done?

### LIVE SELECT
- until it's implemented into wasm I'll use the js sdk
- There is a problem on live queries keep one eye on [it](https://github.com/surrealdb/surrealdb/issues/3017)

### Dev mode
- `npm run watch` because Surreal sdk breaks ng serve:
  ``` bash
  docker run --rm -v ./dist/browser/:/usr/share/nginx/html -v ./nginx.conf:/etc/nginx/conf.d/default.conf -p 8000:80 nginx:alpine
  ```
### File generators
- generate guard `ng g guard --skip-tests providers/guards/<>`
- generate servi `ng g service --skip-tests providers/services/<>`
- generate class `ng g class --skip-tests --type=model providers/models/<>`
- generate modul `ng g module modules/<>`
- generate compo `ng g component --module modules/<> modules/<>/components/<>`
