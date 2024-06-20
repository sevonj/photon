<script lang="ts">
  import { profile, profileData } from '$lib/auth.js'
  import Link from '$lib/components/input/Link.svelte'
  import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
  import {
    amModOfAny,
    isAdmin,
  } from '$lib/components/lemmy/moderation/moderation.js'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { site } from '$lib/lemmy.js'
  import {
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    Modal,
    Spinner,
  } from 'mono-svelte'
  import {
    GlobeAlt,
    Home,
    Icon,
    MagnifyingGlass,
    Newspaper,
    PencilSquare,
    Plus,
    ServerStack,
    XMark,
  } from 'svelte-hero-icons'
  import Profile from './Profile.svelte'
  import NavButton from './NavButton.svelte'
  import { fly, scale } from 'svelte/transition'
  import { expoOut, backOut } from 'svelte/easing'
  import { flip } from 'svelte/animate'
  import SearchBar from '$lib/components/lemmy/util/SearchBar.svelte'
  import { swipeGesture } from '$lib/input/swipe'
  import Logo from '../Logo.svelte'
  import { LINKED_INSTANCE_URL, instance } from '$lib/instance'
  import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
  import { t } from '$lib/translations'
  import { userSettings } from '$lib/settings.js'

  let searching = false
</script>

<nav
  class="flex flex-row gap-2 items-center w-full mx-auto z-50 box-border p-0.5
  duration-150
  {$$props.class}
  "
  style={$$props.style}
>
  <a
      href="/"
      class="flex flex-row items-center gap-2 logo group"
      title="Home"
    >
    <!-- TODO: Remove button -->
    <NavButton href="/" label={$t('nav.home')} class="ml-2 logo">
      <svelte:fragment slot="icon">
        {#if LINKED_INSTANCE_URL || false}
          {#if $site}
            <Avatar
              alt={$site.site_view.site.name}
              url={$site.site_view.site.icon}
              width={32}
              circle={false}
            />
          {:else}
            <Spinner width={32} />
          {/if}
        {:else}
          <Logo width={32} />
        {/if}
      </svelte:fragment>
    </NavButton>
    
    {#if $userSettings.dock.noGap != false}
      <span class="flex flex-row items-center gap-2 max-[800px]:hidden">
        <!-- Large site Title -->
        {#if LINKED_INSTANCE_URL || false}
          <span
            class="text-2xl font-black text-slate-800 dark:text-zinc-200 overflow-hidden overflow-ellipsis whitespace-nowrap"
            style="max-width: 24ch; letter-spacing: -1px;"
          >
            {$site?.site_view.site.name}
          </span>

        <!-- Smol site title + url -->
        {:else}
          <span class="opacity-30 text-xl">/</span>
          <span class="grid place-items-start">
              <span
                in:fly={{ y: -12 }}
                out:fly={{ y: 12 }}
                style="grid-row: 1; max-width: 24ch;"
                class="text-base font-bold break-words overflow-hidden overflow-ellipsis whitespace-nowrap"
              >
                {$site?.site_view.site.name}
              </span>
              <span
                in:fly={{ y: -12 }}
                out:fly={{ y: 12 }}
                style="grid-row: 2; max-width: 24ch;"
                class="text-xs break-words overflow-hidden overflow-ellipsis whitespace-nowrap text-slate-600 dark:text-zinc-400"
              >
                {$instance}
              </span>
          </span>
        {/if}
      </span>
    {/if}
  </a>

  {#if searching}
    <div
      class="w-full h-full absolute z-20 p-2 flex items-center gap-2 bg-white dark:bg-zinc-950
      rounded-full"
      transition:scale={{
        start: 0.96,
        duration: 250,
        easing: backOut,
      }}
    >
      <Button
        size="custom"
        rounding="pill"
        class="w-11 h-11 flex-shrink-0"
        on:click={() => (searching = false)}
      >
        <Icon src={XMark} size="18" mini />
      </Button>
      <SearchBar let:search let:loading class="!rounded-full z-20">
        <Button
          size="custom"
          rounding="pill"
          class="w-11 h-11 flex-shrink-0"
          on:click={search}
          color="primary"
          type="submit"
          {loading}
        >
          <Icon src={MagnifyingGlass} size="18" mini slot="prefix" />
        </Button>
      </SearchBar>
    </div>
  {/if}
  <div class="flex flex-row gap-2 py-2 px-2 items-center w-full">
    <div class="ml-auto" />
    {#if $profile?.user && isAdmin($profile.user)}
      <NavButton
        href="/admin"
        label={$t('nav.admin')}
        icon={ServerStack}
        class="relative"
        isSelectedFilter={(path) => path.startsWith('/admin')}
      >
        {#if ($profile?.user?.notifications.applications ?? 0) > 0}
          <div
            class="rounded-full w-2 h-2 bg-red-500 absolute -top-1 -left-1"
          />
        {/if}
      </NavButton>
    {/if}
    {#if amModOfAny($profile?.user)}
      <NavButton
        href="/moderation"
        label={$t('nav.moderation')}
        class="relative"
      >
        {#if ($profile?.user?.notifications.reports ?? 0) > 0}
          <div
            class="rounded-full w-2 h-2 bg-red-500 absolute -top-1 -left-1"
          />
        {/if}
        <ShieldIcon let:isSelected slot="icon" filled={isSelected} width={18} />
      </NavButton>
    {/if}
    <NavButton
      href="/communities"
      label={$t('nav.communities')}
      icon={GlobeAlt}
    />
    <NavButton
      on:click={() => (searching = true)}
      label={$t('nav.search')}
      icon={MagnifyingGlass}
    />
    <Menu placement="top">
      <NavButton
        class="relative"
        color="primary"
        slot="target"
        label={$t('nav.create.label')}
        icon={Plus}
      />
      <MenuDivider>{$t('nav.create.label')}</MenuDivider>
      <MenuButton link href="/create/post" disabled={!$profile?.jwt}>
        <Icon src={PencilSquare} mini width={16} slot="prefix" />
        {$t('nav.create.post')}
      </MenuButton>
      <MenuButton
        link
        href="/create/community"
        disabled={!$profile?.jwt ||
          !$profile?.user ||
          ($site?.site_view.local_site.community_creation_admin_only &&
            !isAdmin($profile.user))}
      >
        <Icon src={Newspaper} mini width={16} slot="prefix" />
        {$t('nav.create.community')}
      </MenuButton>
      {#if !$profile?.jwt}
        <span class="text-sm mx-4 my-1 py-1">
          {$t('nav.create.logingate')}
        </span>
      {/if}
    </Menu>
    <Profile
      placement="top"
      itemsClass="h-8 md:h-8 z-10"
      targetClass="z-10 h-10"
      containerClass="!max-h-[28rem] z-10"
      buttonClass=""
    />
  </div>
</nav>
