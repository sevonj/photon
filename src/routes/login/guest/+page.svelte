<script lang="ts">
  import { site, validateInstance } from '$lib/lemmy.js'
  import { Button, Note, TextInput, toast } from 'mono-svelte'
  import { MINIMUM_VERSION } from '$lib/version'
  import { mayBeIncompatible } from '$lib/lemmy'
  import { DOMAIN_REGEX_FORMS } from '$lib/util'
  import { profile, profileData, type Profile } from '$lib/auth'
  import { LINKED_INSTANCE_URL } from '$lib/instance'
  import { goto } from '$app/navigation'
  import { t } from '$lib/translations'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'

  export let ref: string = '/'

  let form = {
    instance: '',
    username: `${$t('account.guest')} ${$profileData.profiles.filter((p) => p.jwt == undefined).length + 1}`,
    loading: false,
  }

  async function addGuest() {
    form.loading = true
    if (!(await validateInstance(form.instance))) {
      toast({ content: $t('toast.failInstanceURL'), type: 'error' })
      form.loading = false
      return
    }

    profileData.update((pd) => {
      // too lazy to make a decent system
      const id = Math.floor(Math.random() * 100000)

      const newProfile: Profile = {
        id: id,
        instance: form.instance,
        username: form.username,
      }

      return {
        profile: id,
        profiles: [...pd.profiles, newProfile],
      }
    })

    toast({ content: $t('toast.addAccount'), type: 'success' })

    goto(ref)

    form.loading = false
  }
</script>

<div class="max-w-xl w-full mx-auto h-max my-auto">
  <form on:submit|preventDefault={addGuest} class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <slot />
      <Header>{$t('account.addGuest')}</Header>
      {#if $site && mayBeIncompatible(MINIMUM_VERSION, $site.version.replace('v', ''))}
        <Note>
          {$t('account.versionGate', {
            //@ts-ignore
            version: `v${MINIMUM_VERSION}`,
          })}
        </Note>
      {/if}
    </div>
    <div class="inline-flex items-center gap-2">
      <TextInput
        required
        label={$t('form.name')}
        bind:value={form.username}
        placeholder="Guest 2"
        minlength={1}
        class="flex-1"
      ></TextInput>
      {#if !LINKED_INSTANCE_URL}
        <TextInput
          required
          label={$t('form.instance')}
          bind:value={form.instance}
          pattern={DOMAIN_REGEX_FORMS}
          placeholder="example.com"
          class="flex-1"
        />
      {/if}
    </div>
    <Button
      submit
      class="w-full"
      color="primary"
      size="lg"
      loading={form.loading}
      disabled={form.loading}
    >
      {$t('form.submit')}
    </Button>
  </form>
</div>
