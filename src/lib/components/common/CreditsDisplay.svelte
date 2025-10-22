<script lang="ts">
	import { onMount } from 'svelte';
	import { getCredits } from '$lib/apis/credits';
	import Tooltip from '$lib/components/common/Tooltip.svelte';

	export let credits = 0;
	export let planName = 'Free';
	export let hasCredits = true;
	export let loading = true;

	let showUpgradeMessage = false;

	onMount(async () => {
		await loadCredits();
		// Atualizar créditos a cada 30 segundos
		const interval = setInterval(loadCredits, 30000);
		return () => clearInterval(interval);
	});

	async function loadCredits() {
		try {
			const response = await getCredits();
			if (response.success) {
				credits = response.credits;
				planName = response.planName;
				hasCredits = response.hasCredits;
				showUpgradeMessage = credits <= 2; // Mostrar aviso quando tiver 2 ou menos créditos
			}
		} catch (error) {
			console.error('Erro ao carregar créditos:', error);
		} finally {
			loading = false;
		}
	}

	export function refreshCredits() {
		return loadCredits();
	}

	function getCreditColor(credits: number): string {
		if (credits > 5) return 'text-green-400';
		if (credits > 2) return 'text-yellow-400';
		return 'text-red-400';
	}

	function getCreditBgColor(credits: number): string {
		if (credits > 5) return 'bg-green-500/10';
		if (credits > 2) return 'bg-yellow-500/10';
		return 'bg-red-500/10';
	}
</script>

{#if !loading}
	<div class="flex items-center gap-2">
		<Tooltip content={`Plan: ${planName} • ${credits} AI credits remaining`}>
			<div
				class="flex items-center gap-2 px-3 py-1.5 rounded-lg {getCreditBgColor(
					credits
				)} border border-gray-600/30 cursor-pointer hover:border-gray-500/50 transition-all"
			>
				<!-- Ícone de créditos -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4 {getCreditColor(credits)}"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
					/>
				</svg>

				<!-- Número de créditos -->
				<span class="text-sm font-semibold {getCreditColor(credits)}">
					{credits}
				</span>

				<!-- Badge do plano -->
				<span
					class="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300 border border-gray-600/30"
				>
					{planName}
				</span>
			</div>
		</Tooltip>

		<!-- Mensagem de upgrade -->
		{#if showUpgradeMessage && credits > 0}
			<div
				class="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 animate-pulse"
			>
				Low credits!
			</div>
		{/if}

		<!-- Mensagem de sem créditos -->
		{#if !hasCredits}
			<div class="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">
				No credits
			</div>
		{/if}
	</div>
{:else}
	<div class="flex items-center gap-2">
		<div class="w-20 h-8 bg-gray-700/50 rounded animate-pulse" />
	</div>
{/if}

