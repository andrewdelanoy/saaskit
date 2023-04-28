// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { stripe } from "@/utils/payments.ts";
import type { AccountState } from "./_middleware.ts";
import { getUser } from "@/utils/db.ts";
import { RedirectHelper } from "../../utils/redirect.ts";

// deno-lint-ignore no-explicit-any
export const handler: Handlers<any, AccountState> = {
  async GET(req, ctx) {
    const user = await getUser(ctx.state.session.user.id);
    const { url } = await stripe.billingPortal.sessions.create({
      customer: user.value!.stripeCustomerId,
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
