<script lang="ts">
	import { onMount } from 'svelte';
	import { navigating } from '$app/stores';
	import '../styles/global.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { initUserStore, isAuthenticated, isLoading as authLoading } from '$lib/stores/userStore';
	import Spinner from '$lib/components/Spinner.svelte';

	let appLoading = true;

	onMount(async () => {
		await initUserStore();
		appLoading = false;
	});
</script>

{#if appLoading || $authLoading || $navigating}
	<div class="loading-container">
		<Spinner size="large" />
	</div>
{:else}
	<div class="app-container">
		<Navbar />
		<main>
			<slot />
		</main>
	</div>
{/if}

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	main {
		flex: 1;
		overflow: auto;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100%;
	}
</style>