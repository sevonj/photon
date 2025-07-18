<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { notifications, profile } from '$lib/auth.svelte.js'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import { t } from '$lib/i18n/translations'
  import { getClient } from '$lib/lemmy.svelte.js'
  import { Button } from 'mono-svelte'
  import { ArrowPath, Check, Icon, Inbox } from 'svelte-hero-icons'
  import { expoOut } from 'svelte/easing'
  import { fly } from 'svelte/transition'
  import InboxItem from './InboxItem.svelte'

  let { data } = $props()

  let markingAsRead = $state(false)

  async function markAllAsRead() {
    if (!profile.data?.user) {
      goto('/login')
      return
    }

    markingAsRead = true

    const response = await getClient().markAllAsRead()

    $notifications.inbox = 0

    goto(page.url, {
      invalidateAll: true,
    }).then(() => {
      markingAsRead = false
    })

    return response.replies
  }

  function addSearchParam(
    currentSearchParams: URLSearchParams,
    newParamString: string,
  ) {
    // Create a new URLSearchParams object from the current search params
    const updatedParams = new URLSearchParams(currentSearchParams)

    // Parse the new parameter string
    const newParam = new URLSearchParams(newParamString)

    // Get the key and value of the new parameter
    const [key, value]: [string, string] = newParam.entries().next().value!

    // Add the new parameter to the updated params
    updatedParams.set(key, value)

    return updatedParams
  }
</script>

<svelte:head>
  <title>{$t('routes.inbox.title')}</title>
</svelte:head>

<div class=" gap-2">
  <div
    class="mt-4 mb-2 z-30 mx-auto max-w-full flex gap-2 md:flex-row flex-col
items-center px-2 w-max top-6 lg:top-22"
  >
    <Tabs
      routes={[
        {
          href: '?type=all',
          name: $t('filter.location.all'),
        },
        {
          href: '?type=replies',
          name: $t('filter.inbox.replies'),
        },
        {
          href: '?type=mentions',
          name: $t('filter.inbox.mentions'),
        },
        {
          href: '/inbox/messages',
          name: $t('filter.inbox.messages'),
        },
      ]}
      currentRoute={page.url.search}
      buildUrl={(route, href) =>
        href.includes('?')
          ? '?' + addSearchParam(page.url.searchParams, href).toString()
          : `${href}${page.url.search}`}
      defaultRoute="?type=all"
      class="overflow-auto"
    />
    <Tabs
      routes={[
        {
          href: '?unreadOnly=false',
          name: $t('filter.location.all'),
        },
        {
          href: '?unreadOnly=true',
          name: $t('filter.unread'),
        },
      ]}
      currentRoute={page.url.search}
      buildUrl={(route, href) =>
        '?' + addSearchParam(page.url.searchParams, href).toString()}
      defaultRoute="?unreadOnly=true"
      class="overflow-auto"
    />
  </div>
  <Header pageHeader class="lg:flex-row justify-between flex-col">
    {$t('routes.inbox.title')}

    <div class="flex items-center gap-2">
      <Button
        onclick={() => goto(page.url, { invalidateAll: true })}
        size="square-lg"
        rounding="xl"
        title={$t('common.refresh')}
      >
        {#snippet prefix()}
          <Icon src={ArrowPath} size="16" mini />
        {/snippet}
      </Button>
      <Button
        onclick={markAllAsRead}
        loading={markingAsRead}
        disabled={markingAsRead}
        size="lg"
        class="h-10"
      >
        {#snippet prefix()}
          <Icon src={Check} width={16} mini />
        {/snippet}
        {$t('routes.inbox.markAsRead')}
      </Button>
    </div>
  </Header>
</div>

<div
  class="flex flex-col list-none flex-1 h-full divide-y divide-slate-200 dark:divide-zinc-900 *:py-4"
>
  {#if !data.inbox?.value || (data.inbox.value?.length ?? 0) == 0}
    <Placeholder
      icon={Inbox}
      title={$t('routes.inbox.empty.title')}
      description={$t('routes.inbox.empty.description')}
      class="self-center justify-self-center my-auto"
    />
  {:else}
    {#each data.inbox.value as item, index (item.id)}
      {#if item.creator.id != profile.data.user?.local_user_view.person.id}
        <div
          class="-mx-4 sm:-mx-6 px-4 sm:px-6
          {item.read ? '' : 'bg-blue-50/50 dark:bg-blue-500/5'}"
          in:fly|global={{
            duration: 1000,
            y: 16,
            opacity: 0,
            easing: expoOut,
            delay: index * 50,
          }}
        >
          <InboxItem bind:item={data.inbox.value[index]} />
        </div>
      {/if}
    {/each}
  {/if}
  {#if !(data.page == 1 && (data?.inbox?.value.length ?? 0) == 0)}
    <div
      class="sticky z-30 mx-auto max-w-full self-end mt-auto bottom-22 lg:bottom-6"
    >
      <Tabs routes={[]} class="mx-auto">
        <Pageination
          hasMore={!(
            !data.inbox || (data.inbox.value?.length ?? 0) < (data?.limit ?? 0)
          )}
          page={data.page}
          href={page => `?page=${page}`}
        />
      </Tabs>
    </div>
  {/if}
</div>
