<script lang="ts">
  import type { PostView } from "lemmy-js-client";
  import PostActions from "$lib/components/lemmy/post/PostActions.svelte";
  import { userSettings } from "$lib/settings.js";
  import PostMeta from "$lib/components/lemmy/post/PostMeta.svelte";
  import { Material } from "mono-svelte";
  import { mediaType, postLink } from "$lib/components/lemmy/post/helpers.js";
  import { publishedToDate } from "$lib/components/util/date.js";

  import PostMedia from "$lib/components/lemmy/post/media/PostMedia.svelte";
  import PostBody from "./PostBody.svelte";
  import { profile } from "$lib/auth";
  import { goto } from "$app/navigation";
  import PostMediaCompact from "./media/PostMediaCompact.svelte";

  export let post: PostView;
  export let hideCommunity = false;
  export let view = $userSettings.view;

  $: type = mediaType(post.post.url, view);
  $: hideTitle =
    $userSettings.posts.deduplicateEmbed &&
    post.post.embed_title == post.post.name &&
    view != "compact" &&
    type != "iframe";

  $: hideBody =
    $userSettings.posts.deduplicateEmbed &&
    post.post.embed_description == post.post.body &&
    view != "compact";

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
  Post component for feed list view.
-->

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Material
  color="none"
  class="max-w-full min-w-0 w-full group cursor-pointer py-5 post-list {$$props.class}"
  id={post.post.id.toString()}
  padding="none"
  on:click={(e) => {
    onClick(e);
  }}
  style={$userSettings.leftAlign
    ? `--post-list-areas: 
  'meta meta'
  'media title'
  'media body'
  'media embed'
  'actions actions'; --post-list-columns: auto 1fr;`
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
  {#key post.post.url}
    <div style="grid-area:embed;" class="">
      <PostMedia bind:post={post.post} {view} {type} />
    </div>
    {#if type == "image" || type == "iframe"}
      <div
        class="w-24 h-24 sm:w-[240px] sm:h-[180px] {$userSettings.leftAlign
          ? 'mr-2'
          : 'ml-2'}"
        style="grid-area: media;"
      >
        <PostMediaCompact bind:post={post.post} bind:type class="" />
      </div>
    {/if}
  {/key}
  {#if post.post.body && !post.post.nsfw && !hideBody}
    <PostBody body={post.post.body} {view} style="grid-area: body" />
  {/if}
  <PostActions on:hide bind:post style="grid-area: actions;" />
  <div
    class="absolute overflow-hidden inset-0 group-hover:inset-y-0.5 group-hover:-inset-x-4 group-hover:sm:-inset-x-5
    sm:rounded-xl bg-slate-50 dark:bg-zinc-900
    opacity-0 group-hover:opacity-100 transition-all -z-10 no-list-margin
    duration-150"
  />
</Material>

<style>
  :global(.post-list) {
    display: grid;
    grid-template-areas: var(
      --post-list-areas,
      "meta media" "title media" "body media" "embed media" "actions actions"
    );
    width: 100%;
    height: 100%;
    grid-template-columns: var(--post-list-columns, 1fr auto);
  }
  :global(.post-list > *:not(.no-list-margin):not(:first-child)) {
    margin-top: 0.5rem;
  }
</style>
