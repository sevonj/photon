<script lang="ts">
  import type { PostView } from "lemmy-js-client";
  import { userSettings } from "$lib/settings.js";
  import PostMeta from "$lib/components/lemmy/post/PostMeta.svelte";
  import { Badge, Material } from "mono-svelte";
  import {
    mediaType,
    postLink,
  } from "$lib/components/lemmy/post/helpers.js";
  import { publishedToDate } from "$lib/components/util/date.js";
  import { profile } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { Icon, ArrowUp, ChatBubbleOvalLeft } from "svelte-hero-icons";

  export let post: PostView;
  export let hideCommunity = false;

  $: hideTitle = false;

  function onClick(e: any) {
    const event = e as MouseEvent;
    const parent = document.getElementById(post.post.id.toString());

    if (event.target == parent) {
      goto(postLink(post.post));
    }
  }
</script>

<!-- 
  @component
  Post item for crosspost list.
-->

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Material
  color="none"
  class="min-w-0 group cursor-pointer py-4 list-typeZ post-compact {$$props.class}"
  id={post.post.id.toString()}
  padding="none"
  on:click={(e) => {
    onClick(e);
  }}
  style={$userSettings.leftAlign
    ? `--post-compact-areas: 
  'meta meta'
  'title title'
  'actions actions'; --post-compact-columns: auto 1fr;`
    : ``}
>
  <PostMeta
    community={hideCommunity ? undefined : post.community}
    user={post.creator}
    published={publishedToDate(post.post.published)}
    badges={{
      deleted: post.post.deleted,
      removed: post.post.removed,
      locked: post.post.locked,
      featured: post.post.featured_local || post.post.featured_community,
      nsfw: post.post.nsfw,
      saved: post.saved,
      admin: post.creator_is_admin,
      moderator: post.creator_is_moderator,
    }}
    subscribed={$profile?.user?.follows
      .map((c) => c.community.id)
      .includes(post.community.id)
      ? "Subscribed"
      : "NotSubscribed"}
    id={post.post.id}
    title={hideTitle ? undefined : post.post.name}
    read={post.read}
    style="grid-area: meta;"
  >
    <slot name="badges" slot="badges" />
  </PostMeta>
  <div class="flex flex-row items-center gap-2 text-sm" style="grid-area: actions;">
    <Badge>
      <Icon src={ArrowUp} slot="icon" size="14" micro />
      {post.counts.score}
    </Badge>
    <Badge>
      <Icon src={ChatBubbleOvalLeft} slot="icon" size="14" micro />
      {post.counts.comments}
    </Badge>
  </div>
  <div/>
</Material>

<style>
  :global(.post-compact) {
    display: grid;
    grid-template-areas: var(
      --post-compact-areas,
      "meta meta" "title title" "actions actions"
    );
    width: 100%;
    height: 100%;
    grid-template-columns: var(--post-compact-columns, 1fr auto);
  }
  :global(.post-compact > *:not(.no-list-margin):not(:first-child)) {
    margin-top: 0.5rem;
  }
</style>
