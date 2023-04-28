// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import type { State } from "@/routes/_middleware.ts";
import Layout from "@/components/Layout.tsx";
import Head from "@/components/Head.tsx";
import ItemSummary from "@/components/ItemSummary.tsx";
import {
  BUTTON_STYLES,
  INPUT_STYLES,
  SITE_WIDTH_STYLES,
} from "@/utils/constants.ts";
import { timeAgo } from "@/components/ItemSummary.tsx";
import {
  CommentValue,
  createComment,
  getItem,
  getItemComments,
  ItemValue,
} from "@/utils/db.ts";
import { RedirectHelper } from "@/utils/redirect.ts";

interface ItemPageData extends State {
  itemRes: Deno.KvEntry<ItemValue>;
  commentsRes: Deno.KvEntry<CommentValue>[];
}

export const handler: Handlers<ItemPageData, State> = {
  async GET(_req, ctx) {
    const { id } = ctx.params;

    const itemRes = await getItem(id);
    if (itemRes.value === null) {
      return ctx.renderNotFound();
    }

    const commentsRes = await getItemComments(id);

    return ctx.render({ ...ctx.state, itemRes, commentsRes });
  },
  async POST(req, ctx) {
    if (!ctx.state.session) {
      /** @todo Figure out `redirect_to` query */
      /*return new Response(null, {
        headers: {

          location: "/login",
        },
        status: 302,
      });*/
      // Changed redirect path to signup page
      return RedirectHelper("/signup", 302);
    }

    const form = await req.formData();
    const text = form.get("text");

    if (typeof text !== "string") {
      return new Response(null, { status: 400 });
    }

    await createComment({
      userId: ctx.state.session.user.id,
      itemId: ctx.params.id,
      text,
    });

    /*return new Response(null, {
      headers: { location: `/item/${ctx.params.id}` },
      status: 302,
    });*/

    return RedirectHelper(`/item/${ctx.params.id}`, 302);
  },
};

function Comment(comment: CommentValue) {
  return (
    <div class="py-4">
      <p>{comment.userId}</p>
      <p class="text-gray-500">{timeAgo(new Date(comment.createdAt))} ago</p>
      <p>{comment.text}</p>
    </div>
  );
}

export default function ItemPage(props: PageProps<ItemPageData>) {
  return (
    <>
      <Head title={props.data.itemRes.value.title} />
      <Layout isLoggedIn={props.data.isLoggedIn}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-8 space-y-4`}>
          <ItemSummary {...props.data.itemRes} />
          <div class="divide-y">
            {props.data.commentsRes.map((comment) => (
              <Comment {...comment.value} />
            ))}
          </div>
          <form method="post">
            <textarea
              class={INPUT_STYLES}
              type="text"
              name="text"
              required
            />
            <button type="submit" class={BUTTON_STYLES}>Comment</button>
          </form>
        </div>
      </Layout>
    </>
  );
}
