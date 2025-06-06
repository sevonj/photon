<script lang="ts">
  import { run, preventDefault } from 'svelte/legacy'

  import { Button, Material, Spinner, TextInput, toast } from 'mono-svelte'
  import Message from './Message.svelte'
  import { t } from '$lib/i18n/translations'
  import { Icon, PaperAirplane } from 'svelte-hero-icons'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { fly } from 'svelte/transition'
  import { backOut, expoOut } from 'svelte/easing'
  import { client } from '$lib/lemmy.svelte'
  import { errorMessage } from '$lib/lemmy/error'
  import type { PrivateMessageResponse } from 'lemmy-js-client'
  import { flip } from 'svelte/animate'
  import { browser } from '$app/environment'
  import { onMount, tick } from 'svelte'
  import { report } from '$lib/components/lemmy/moderation/moderation'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Placeholder from 'mono-svelte/placeholder/Placeholder.svelte'

  let { data: pageData } = $props()
  let data = $state(pageData)
  $effect(() => {
    data = pageData
  })

  let textbox = $state({
    message: '',
    loading: false,
  })

  let chatWindow = $state<HTMLDivElement>()

  async function sendMessage(
    message: string,
  ): Promise<PrivateMessageResponse | undefined> {
    if (message == '') return

    textbox.loading = true

    try {
      const res = await client().createPrivateMessage({
        content: message,
        recipient_id: data.creator.person_view.person.id,
      })

      textbox.loading = false

      return res
    } catch (err) {
      toast({
        content: errorMessage(err as any),
        type: 'error',
      })
    }

    textbox.loading = false
  }

  $effect(() => {
    if (browser && data.message && chatWindow) {
      tick().then(() =>
        chatWindow?.scrollTo({
          top: chatWindow.scrollHeight,
          behavior: 'smooth',
        }),
      )
    }
  })

  async function deleteMessage(id: number) {
    const res = await client().deletePrivateMessage({
      deleted: true,
      private_message_id: id,
    })

    data.message = {
      private_messages: data.message.private_messages.toSpliced(
        data.message.private_messages.findLastIndex(
          (i) => i.private_message.id == id,
        ),
        1,
      ),
    }
  }
</script>

<Header pageHeader>
  {$t('filter.inbox.messages')}
  {#snippet extended()}
    <UserLink avatar user={data.creator.person_view.person} />
  {/snippet}
</Header>
<Material
  color="transparent"
  rounding="2xl"
  padding="none"
  class="bg-white dark:bg-zinc-950 dark:border-t-zinc-900
  w-full overflow-auto mt-6 relative max-h-128 h-full"
>
  <div class="h-full overflow-auto" bind:this={chatWindow}>
    <ul id="chat-window" class=" h-full flex flex-col gap-1 flex-1 px-4 py-4">
      <div class="mt-auto"></div>
      <p class="mx-auto mt-auto text-slate-400 dark:text-zinc-600">
        {$t('routes.inbox.messages.conversation', {
          // @ts-ignore
          user:
            data.creator.person_view.person.name +
            '@' +
            new URL(data.creator.person_view.person.actor_id).hostname,
        })}
      </p>
      {#each data.message.private_messages.toReversed() as private_message, index (private_message.private_message.id)}
        <div
          class={private_message.creator.id ==
          data.creator.person_view.person.id
            ? 'self-start'
            : 'self-end'}
          in:fly|global={{
            duration: 700,
            easing: backOut,
            delay: data.message.private_messages.length * 50 - index * 50,
            y: -12,
          }}
          animate:flip={{ duration: 500, easing: expoOut }}
        >
          <Message
            ondelete={() => deleteMessage(private_message.private_message.id)}
            onreport={() => report(private_message)}
            message={private_message}
            primary={private_message.creator.id !=
              data.creator.person_view.person.id}
          />
        </div>
      {/each}
    </ul>
  </div>
</Material>
{#await data.message then message}
  <div class="sticky bottom-4 p-4">
    <form
      class="flex flex-row h-14 items-center w-full
    border-slate-200 dark:border-zinc-800
   p-2 gap-2 backdrop-blur-xl
   bg-white/50 dark:bg-zinc-950/50 border rounded-2xl"
      onsubmit={async (e) => {
        e.preventDefault()

        const res = await sendMessage(textbox.message)
        if (!res) return

        data.message = {
          private_messages: [
            res.private_message_view,
            ...message.private_messages,
          ],
        }

        textbox.message = ''
      }}
    >
      <TextInput
        bind:value={textbox.message}
        class="rounded-xl! h-full flex-1 dark:bg-zinc-925!"
      />

      <Button
        title={$t('common.send')}
        size="custom"
        rounding="xl"
        class="aspect-square h-9"
        color="primary"
        submit
        loading={textbox.loading}
        disabled={textbox.loading}
      >
        {#snippet prefix()}
          <Icon src={PaperAirplane} size="18" micro />
        {/snippet}
      </Button>
    </form>
  </div>
{/await}

<style>
  #chat-window {
    box-shadow: inset 0px -10px 15px -10px rgba(0, 0, 0, 0.1);
  }
</style>
