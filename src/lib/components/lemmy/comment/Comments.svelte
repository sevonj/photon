<script lang="ts">
  import Comment from './Comment.svelte'
  import { buildCommentsTree, type CommentNodeI } from './comments'
  import { page } from '$app/stores'
  import { onMount, setContext } from 'svelte'
  import {
    ChevronDoubleDown,
    ChevronDown,
    Icon,
    Plus,
    PlusCircle,
    ArrowDownCircle,
  } from 'svelte-hero-icons'
  import { getClient } from '$lib/lemmy.js'
  import type { CommentView, Post } from 'lemmy-js-client'
  import { fly } from 'svelte/transition'
  import { toast } from 'mono-svelte'
  import { profile } from '$lib/auth.js'
  import { Button } from 'mono-svelte'
  import { afterNavigate, goto } from '$app/navigation'
  import { backOut, expoOut } from 'svelte/easing'
  import { t } from '$lib/translations'
  import { browser } from '$app/environment'

  export let nodes: CommentNodeI[]
  export let isParent: boolean
  export let post: Post

  let hydrated = false

  onMount(() => {
    hydrated = true
    if (isParent && $page.url.hash && browser) {
      document.getElementById($page.url.hash)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  })

  let loadingChildren = false
  let childrenPage = 0

  async function fetchChildren(parent: CommentNodeI) {
    if (
      !(
        parent.comment_view.counts.child_count > 0 &&
        parent.children.length == 0
      )
    )
      return

    try {
      parent.loading = true

      const newComments = await getClient($page.params.instance).getComments({
        max_depth: 5,
        parent_id: parent.comment_view.comment.id,
        type_: 'All',
        page: childrenPage,
      })

      if (newComments.comments.length == 0) {
        loadingChildren = false
        toast({
          content: $t('toast.noComments'),
          type: 'error',
        })
        return
      }

      const tree = buildCommentsTree(newComments.comments, parent.depth)

      // 0.18.2 -> 0.18.3 broke this
      // so i'm adding this check
      const treeParent = tree.find(
        (c) => c.comment_view.comment.id == parent.comment_view.comment.id
      )

      if (treeParent) {
        // < 0.18.3
        parent.children = treeParent.children
        if (treeParent.children.length == 0) {
          toast({
            content: $t('toast.noComments'),
            type: 'warning',
          })
        }
      } else {
        // 0.18.3+
        parent.children = tree
        if (tree.length == 0) {
          toast({
            content: $t('toast.noComments'),
            type: 'warning',
          })
        }
      }
      childrenPage++
    } catch (error) {
      console.error(error)
      toast({
        content: error as any,
        type: 'error',
      })
    }
  }
</script>

<ul
  in:fly={{ duration: 500, easing: expoOut, y: -12 }}
  class={isParent
    ? 'divide-y dark:divide-zinc-900 divide-slate-100'
    : ' border-slate-200 dark:border-zinc-800 my-1'}
>
  {#each nodes as node (node.comment_view.comment.id)}
    <Comment
      postId={post.id}
      bind:node
      bind:open={node.ui.open}
      op={post.creator_id == node.comment_view.creator.id}
      contentClass="pl-3 {node.children.length > 0 ||
      node.comment_view.counts.child_count > 0
        ? 'border-l'
        : ''} ml-3 border-slate-200 dark:border-zinc-800"
    >
      {#if node.children?.length > 0}
        <svelte:self {post} bind:nodes={node.children} isParent={false} />
      {/if}
      {#if node.comment_view.counts.child_count > 0 && node.children.length == 0}
        <svelte:element
          this={hydrated ? 'div' : 'a'}
          class="w-full my-2 h-8"
          href="/comment/{$page.params.instance}/{node.comment_view.comment.id}"
        >
          <Button
            loading={node.loading}
            disabled={node.loading}
            rounding="pill"
            color="tertiary"
            class="font-normal text-slate-600 dark:text-zinc-400"
            loaderWidth={16}
            on:click={() => {
              if (node.depth > 4) {
                goto(
                  `/comment/${$page.params.instance}/${node.comment_view.comment.id}#comments`
                )
              } else {
                node.loading = true
                fetchChildren(node).then(() => (node.loading = false))
              }
            }}
          >
            <Icon
              src={ArrowDownCircle}
              micro
              size="16"
              slot="prefix"
              class="text-primary-900 dark:text-primary-100"
            />
            {$t('comment.more', {
              // @ts-ignore
              comments: node.comment_view.counts.child_count,
            })}
          </Button>
        </svelte:element>
      {/if}
    </Comment>
  {/each}
</ul>
