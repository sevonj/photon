<script lang="ts">
  import { profile } from '$lib/auth'
  import ItemList from '$lib/components/lemmy/generic/ItemList.svelte'
  import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import EntityHeader from '$lib/components/ui/EntityHeader.svelte'
  import Expandable from '$lib/components/ui/Expandable.svelte'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { publishedToDate } from '$lib/components/util/date.js'
  import { formatRelativeDate } from '$lib/components/util/RelativeDate.svelte'
  import { communityLink } from '$lib/lemmy/generic.js'
  import { userSettings } from '$lib/settings.js'
  import { t } from '$lib/translations'
  import { Spinner, Button, Menu, MenuButton } from 'mono-svelte'
  import {
    AtSymbol,
    EllipsisHorizontal,
    Envelope,
    Icon,
    ShieldExclamation,
  } from 'svelte-hero-icons'

  export let data

  $: my_user = data.my_user!.local_user_view
</script>

<Header pageHeader>
  {$t('routes.profile.overview')}
</Header>

<EntityHeader
  avatar={my_user.person.avatar}
  name={my_user.person.display_name || my_user.person.name}
  banner={my_user.person.banner}
  bio={my_user.person.bio}
  stats={[
    {
      name: $t('content.posts'),
      value: my_user.counts.post_count.toString(),
    },
    {
      name: $t('content.comments'),
      value: my_user.counts.comment_count.toString(),
    },
    {
      name: $t('stats.joined'),
      value: formatRelativeDate(publishedToDate(my_user.person.published), {
        style: 'short',
      }).toString(),
      format: false,
    },
  ]}
>
  <span class="text-sm flex gap-0 items-center w-max" slot="nameDetail">
    @
    <UserLink
      showInstance
      user={my_user.person}
      displayName={false}
      class="font-normal"
    />
  </span>
  {#if (data.moderates ?? []).length > 0}
    <Expandable
      class="border rounded-xl bg-white/50 dark:bg-zinc-900/50 w-full p-3 px-4
      dark:border-zinc-800 border-slate-300 border-opacity-50 text-slate-700 dark:text-zinc-300 transition-colors"
    >
      <span slot="title" class="flex items-center gap-1">
        <ShieldIcon width={14} filled />
        {$t('routes.profile.moderates')}
      </span>
      <ItemList
        items={data.moderates?.map((m) => ({
          id: m.community.id,
          name: m.community.title,
          url: communityLink(m.community),
          avatar: m.community.icon,
          instance: new URL(m.community.actor_id).hostname,
        })) ?? []}
      />
    </Expandable>
  {/if}
</EntityHeader>

{#if $userSettings.debugInfo}
  <pre>
  {JSON.stringify(my_user, undefined, 4)}
</pre>
{/if}
