<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import MultiSelect from '$lib/components/input/Switch.svelte'
  import Tabs from '$lib/components/ui/layout/pages/Tabs.svelte'
  import { contentPadding } from '$lib/components/ui/layout/Shell.svelte'
</script>

<div class="flex flex-col gap-2">
  <div
    class="sticky mx-auto z-50 max-w-full min-w-0 flex items-center gap-2"
    style="top: max(1.5rem, {$contentPadding.top}px);"
  >
    <Tabs
      routes={[
        {
          href: '/util',
          name: 'Home',
        },
        {
          href: '/util/instance',
          name: 'Photon instance',
        },
        {
          href: '/util/photonify',
          name: 'Photonify Links',
        },
        {
          href: '/util/placeholder',
          name: 'Placeholders',
        },
        {
          href: '/util/constants',
          name: 'Constants',
        },
        {
          href: '/functions',
          name: 'Functions',
        },
      ]}
      class="overflow-auto"
      currentRoute={$page.url.toString()}
    />
  </div>
  <slot />
</div>
