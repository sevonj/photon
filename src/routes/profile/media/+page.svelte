<script lang="ts">
  import { page } from '$app/stores'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import Pageination from '$lib/components/ui/Pageination.svelte'
  import { t } from '$lib/translations'
  import { searchParam } from '$lib/util'
  import { flip } from 'svelte/animate'
  import PictrsImage from './PictrsImage.svelte'
  import { expoInOut, expoOut } from 'svelte/easing'

  export let data
</script>

<Header pageHeader>{$t('routes.profile.media.title')}</Header>
<div class="media-grid">
  {#each data.images as image (image.local_image.pictrs_delete_token)}
    <div animate:flip={{ duration: 500, easing: expoInOut }}>
      <PictrsImage
        image={image.local_image}
        on:delete={() => {
          data.images = data.images.toSpliced(
            data.images.findIndex(
              (i) =>
                i.local_image.pictrs_delete_token ==
                image.local_image.pictrs_delete_token
            ),
            1
          )
        }}
      />
    </div>
  {/each}
</div>
{#if data.images.length == 20}
  <Pageination
    page={Number($page.url.searchParams.get('page')) || 1}
    on:change={(p) => {
      searchParam($page.url, 'page', p.detail.toString())
    }}
  />
{/if}

<style>
  .media-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media screen and (min-width: 768px) {
    .media-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  @media screen and (min-width: 1024px) {
    .media-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }
  }
</style>
