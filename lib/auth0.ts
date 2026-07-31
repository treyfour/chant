import { Auth0Client } from "@auth0/nextjs-auth0/server";

/**
 * SDK v4.26.0.
 *
 * v4 uses `new Auth0Client()`, NOT the v3 `initAuth0()`. Verified against the
 * installed package README, not from memory — v3 patterns compile and then fail
 * at runtime.
 *
 * Config comes from env, all provisioned via Stripe Projects:
 *   AUTH0_DOMAIN · AUTH0_CLIENT_ID · AUTH0_CLIENT_SECRET · AUTH0_SECRET · APP_BASE_URL
 */
export const auth0 = new Auth0Client();
