<script lang="ts">
  import Comment from '$lib/components/lemmy/comment/Comment.svelte'
  import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { getInstance } from '$lib/lemmy.js'
  import { userSettings } from '$lib/settings.js'
  import { t } from '$lib/translations'
  import type { CommentView } from 'lemmy-js-client'
  import { Button, Material } from 'mono-svelte'
  import { ArrowUturnUp, Icon } from 'svelte-hero-icons'

  export let comment: CommentView
  export let view = $userSettings.view
  export let community = false

  export let meta: boolean = true
</script>

<Material
  class="flex flex-col flex-1 {view != 'card'
    ? '!bg-transparent !border-0 rounded-none'
    : 'p-5'} {view == 'list'
    ? 'py-5'
    : view == 'compact'
      ? 'py-4'
      : 'py-5'} {$$props.class}"
  color="distinct"
  padding="none"
>
  {#if meta}
    <div class="flex flex-row justify-between items-center gap-2">
      <div class="flex flex-col gap-2">
        <PostMeta
          badges={{
            nsfw: comment.post.nsfw,
            removed: comment.post.removed,
            admin: false,
            moderator: false,
            saved: false,
            deleted: comment.post.deleted,
            featured:
              comment.post.featured_community || comment.post.featured_local,
            locked: comment.post.locked,
          }}
          published={publishedToDate(comment.comment.published)}
          community={community ? comment.community : undefined}
          title={comment.post.name}
          id={comment.post.id}
          titleClass="text-sm"
        />
      </div>
      <Button
        color="primary"
        href="/post/{comment.post.id}?thread={comment.comment.path}#{comment
          .comment.id}"
        class="self-start"
      >
        {$t('common.jump')}
        <Icon src={ArrowUturnUp} size="16" micro />
      </Button>
    </div>
  {/if}
  <div class="list-none">
    <Comment
      postId={comment.post.id}
      node={{ children: [], comment_view: comment, depth: 1, ui: {} }}
      replying={false}
      {meta}
      {...$$restProps}
    />
  </div>
</Material>
