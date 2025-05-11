<script lang="ts">
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';
	import '../styles/global.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { initUserStore, isAuthenticated, isLoading as authLoading } from '$lib/stores/userStore';
	import Spinner from '$lib/components/Spinner.svelte';

	let appLoading = true;

	$: isHomePage = $page.url.pathname === '/';
	$: isAuthPage = $page.url.pathname === '/login' || $page.url.pathname === '/register';

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
	<div class="app-container" class:full-height={isHomePage || isAuthPage}>
		<Navbar />
		<main class:full-height={isHomePage || isAuthPage}>
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
	
	.full-height {
		height: 100vh;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100%;
	}
</style>