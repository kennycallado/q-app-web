## TODO:

- [ ] auth: guard for routing
- [ ] store: all calls for query_... to query

- [ ] global auth: for some reason needs a setTimeout
- [X] global: create a global service for auth outside the intervention

- [ ] zod: schema validation
  - for validation on the storage
  - for incomming result validation

- [ ] auth: try auth0 for general authentication:
  - global and interventions
  - [ ] guards
  - [ ] login interface
  - [ ] join project interface

- [X] resources: maybe there is more services with different ready pattern

- [ ] offline: some services connect on init
  - [ ] online service
  - [~] basic: content and outcome only connect when online
  - navigator.onLine property
  - [ ] when offline send jobs to backgrund sync


- [X] live q: there is some problem when recive a delete... [object Object]
- [X] storage: I'll go with schemaless
  - ??? maybe ask for the events to the server

- [X] media: `youtube-player` is back. No way to work with `lite-youtube`
- [X] papers: order by create
- [X] scores: basic service
- [X] resources: only modules are accessible after done
- [X] lit: consider avoid using lit. angular signal just have improved a lot
- [X] live: I think when DELETE it's returning the object or is the blob
- [X] youtube: change `@angular/youtube-player` for `@justinribeiro/lite-youtube`
  - [~] styles: revisar bien, algo se podrá hacer...
- [X] scores: change records for scores

