export type AuthLogin = {
  username: string
}

export type AuthJoin = {
  ns: string
  db: string
  sc: string
  pass: string
}

export class AuthUser {
  id?: string
  username?: string
  project?: string | Object
  token: string
}
