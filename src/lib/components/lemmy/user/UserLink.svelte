<script lang="ts">
  import ShieldIcon from "$lib/components/lemmy/moderation/ShieldIcon.svelte";
  import Avatar from "$lib/components/ui/Avatar.svelte";
  import { userSettings } from "$lib/settings.js";
  import type { Person } from "lemmy-js-client";
  import { Icon, NoSymbol } from "svelte-hero-icons";

  export let user: Person;
  export let avatar: boolean = false;
  export let avatarSize: number = 24;
  export let badges: boolean = true;
  export let inComment: boolean = false;
  export let showInstance: boolean =
    $userSettings.showInstances.user ||
    ($userSettings.showInstances.comments && inComment);
</script>

<a
  class="items-center inline-flex flex-row min-w-0 gap-1 hover:underline {$$props.class ??
    ''}"
  href="/u/{user.name}@{new URL(user.actor_id).hostname}"
>
  {#if avatar}
    <Avatar url={user.avatar} alt={user.name} width={avatarSize} />
  {/if}
  <div class="h-[1.3em] overflow-hidden text-ellipsis text-slate-500 dark:text-zinc-500">
    <span
      class="text-[0] whitespace-nowrap min-w-0"
      class:ml-0.5={avatar}
    >
      <span
        class="text-xs text-slate-950 dark:text-zinc-50"
        class:font-medium={false}
      >
        {$userSettings.displayNames
          ? user.display_name || user.name
          : user.name}
      </span>
      {#if showInstance}
        <span
          class="text-xs font-normal {$$props.instanceClass ?? ''}"
        >
          @{new URL(user.actor_id).hostname}
        </span>
      {/if}
    </span>
  </div>

  {#if badges}
    {#if user.banned || true}
      <div class="text-red-500" title="Banned">
        <Icon src={NoSymbol} mini size="12" />
      </div>
    {/if}
    {#if user.bot_account || true}
      <div class="text-blue-500 font-bold" title="Bot">BOT</div>
    {/if}
    <slot name="badges" />
  {/if}
</a>
