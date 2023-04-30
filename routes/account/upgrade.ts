// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers } from "$fresh/server.ts";
import { stripe } from "@/utils/payments.ts";
import type { AccountState } from "./_middleware.ts";
import { getUser } from "@/utils/db.ts";
import { RedirectHelper } from "@/utils/redirect.ts";

export const handler: Handlers<null, AccountState> = {
  async GET(req, ctx) {
    const STRIPE_PREMIUM_PLAN_PRICE_ID = Deno.env.get(
      "STRIPE_PREMIUM_PLAN_PRICE_ID",
    );
    if (!STRIPE_PREMIUM_PLAN_PRICE_ID) {
      return ctx.renderNotFound();
    }

    const user = await getUser(ctx.state.session.user.id);
    const { url } = await stripe.checkout.sessions.create({
      success_url: new URL(req.url).origin + "/account",
      customer: user.value?.stripeCustomerId,
      line_items: [
        {
          price: STRIPE_PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
    });

    /*return new Response(null, {
      headers: {
        location: url!,
      },
      status: 302,
    });*/
    return RedirectHelper(url!, 302);
  },
};
