<script lang="ts">
  import { Button } from 'mono-svelte'
  import LoginPage from '../../login/+page.svelte'
  import { ArrowLeft, Icon } from 'svelte-hero-icons'
  import { t } from '$lib/i18n/translations'
</script>

<LoginPage ref="/accounts">
  <Button
    size="custom"
    color="none"
    class="w-max hover:underline text-slate-600 dark:text-zinc-400"
    onclick={() => history?.back()}
  >
    <Icon src={ArrowLeft} size="16" micro />
    {$t('account.accounts')}
  </Button>
</LoginPage>
