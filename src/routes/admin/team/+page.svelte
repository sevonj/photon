<script lang="ts">
  import { profile } from '$lib/auth.js'
  import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
  import Placeholder from '$lib/components/ui/Placeholder.svelte'
  import EditableList from '$lib/components/ui/list/EditableList.svelte'
  import { toast } from 'mono-svelte'
  import { instance } from '$lib/instance.js'
  import { getClient } from '$lib/lemmy.js'
  import { addAdmin } from '$lib/lemmy/user.js'
  import { removeItem, trycatch } from '$lib/util.js'
  import { Button, TextInput } from 'mono-svelte'
  import { Icon, Plus, QuestionMarkCircle, Trash } from 'svelte-hero-icons'
  import Header from '$lib/components/ui/layout/pages/Header.svelte'
  import { t } from '$lib/translations.js'

  export let data

  let newAdmin: string = '',
    adding: boolean = false

  async function removeAdmin(id: number, confirm: boolean): Promise<any> {
    if (!confirm)
      return toast({
        content: $t('toast.removeAdminWarning'),
        action: () => removeAdmin(id, true),
      })

    if (!$profile?.jwt) return

    const result = await trycatch(() =>
      getClient().addAdmin({
        added: false,
        person_id: id,
      })
    )

    if (result) {
      data.site!.admins = result.admins
      toast({
        content: $t('toast.removeAdmin'),
        type: 'success',
      })
    }
  }
</script>

<Header pageHeader>{$t('routes.admin.team.title')}</Header>
{#if data.site}
  <EditableList let:action on:action={(e) => removeAdmin(e.detail, false)}>
    {#if data.site.admins.length <= 0}
      <Placeholder
        icon={QuestionMarkCircle}
        title={$t('routes.admin.team.empty.title')}
        description={$t('routes.admin.team.empty.description')}
      />
    {:else}
      {#each data.site?.admins ?? [] as admin}
        <div class="py-3 flex items-center justify-between">
          <UserLink avatar showInstance={false} user={admin.person} />
          <Button on:click={() => action(admin.person.id)} size="square-md">
            <Icon src={Trash} mini size="16" />
          </Button>
        </div>
      {/each}
    {/if}
  </EditableList>
  <form
    class="flex flex-row items-center gap-2 mt-auto w-full"
    on:submit|preventDefault={() => {
      trycatch(async () => {
        if (!$profile?.jwt || newAdmin == '') return
        adding = true

        const r = await addAdmin(`${newAdmin}@${$instance}`, true, $profile.jwt)
        if (!r) return

        toast({
          content: 'Successfully added that admin.',
          type: 'success',
        })

        if (data.site) data.site.admins = r.admins

        newAdmin = ''
        adding = false
      })
    }}
  >
    <TextInput
      bind:value={newAdmin}
      placeholder="@user"
      class="flex-1"
      pattern={'@[^ |]{1,}'}
    />
    <Button loading={adding} disabled={adding} size="md" class="h-full" submit>
      <Icon src={Plus} mini size="16" slot="prefix" />
      {$t('common.add')}
    </Button>
  </form>
{/if}
