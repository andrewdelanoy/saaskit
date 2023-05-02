// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { stripe } from "@/utils/payments.ts";
import type { AccountState } from "./_middleware.ts";
import { RedirectHelper } from "../../utils/redirect.ts";
import { getOrCreateUser } from "@/utils/db.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, AccountState> = {
  async GET(req, ctx) {
    const user = await getOrCreateUser(
      ctx.state.session.user.id,
      ctx.state.session.user.email!,
    );

    const { url } = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: new URL(req.url).origin + "/account",
    });

    /*return new Response(null, {
      headers: {
        location: url,
      },
      status: 302,
    });*/

    return RedirectHelper(url, 302);
  },
};
