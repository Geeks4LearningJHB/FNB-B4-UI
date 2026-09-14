// Local dev config. NOT committed with a real token — paste yours below.
//
// devToken: a ROLE_USER JWT (the same kind you mint on jwt.io for local #218 testing).
//   - header alg matches your local JWKS key
//   - iss  = banking-dev-jsp   (matches application-local.properties)
//   - sub  = the customer's UUID (this is the customerId every endpoint reads)
// The JWKS server (python -m http.server 9000 in the folder with jwks.json) must be running,
// and Banking must be started with --spring.profiles.active=local.
//
export const environment = {
  production: false,

  apiBaseUrl: '/api', // proxied to the local Docker banking-api (Neon+Aiven) on :8085 by proxy.conf.json
  // Minted with `node make-token.js user d7d1fe37-0ed3-438d-9f3b-c1b0d5650723 31536000` — sub is
  // a real customer_id on the shared Neon DB (account 41072555494). 1-year expiry from mint time
  // (2026-09-14) so it doesn't silently expire mid-session like the old 24h one did.
  devToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJhbmtpbmctZGV2LWtleS0xIn0.eyJpc3MiOiJiYW5raW5nLWRldi1qc3AiLCJzdWIiOiJkN2QxZmUzNy0wZWQzLTQzOGQtOWYzYi1jMWIwZDU2NTA3MjMiLCJpYXQiOjE3ODkzNzI4MTEsImV4cCI6MTgyMDkwODgxMX0.fWTwi3XWTsGooAfFe85d-c_UfOyF9IfmZn88XWOv45mVmu-_uVK2wN_fbbM8Cay8FVVDrOer1et0Houk03NalBCzZRgzI1TKJMmM0VI-4qo8mF72wh4oygxAmNlvrcfXoKqQoYkILWU5h4Kz-AU_cL2YfzNor0CKfN5HFn60h0ZBcz0bT8YegUPc669G6FbmhHGfgUHjQmpaHFaPOcNKcQOOY3JvDdZi4v8NxamZkHJ933WgmZwoq301hxnQvrhZt1vOaz3WnMvH3QOSsiFqHm6cfwToIjrXPLZwaU2TSlpLvAPMyh2QGZCt4uUrm2kMag8IWfbpDWwuserHoxRK4w',
};
