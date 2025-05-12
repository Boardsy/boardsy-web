<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/userStore';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated) {
			goto('/boards');
		}
	});
</script>

<div class="welcome-container">
	<div class="welcome-content">
		<div class="logo-section">
			<img src="https://raw.githubusercontent.com/Balionelis/Flowline/refs/heads/main/static/flowline-banner.png" alt="FlowLine" class="banner" />
			<p class="tagline">Organize your work. Boost your productivity.</p>
		</div>
		
		<div class="auth-options">
			<div class="auth-option">
				<h2>Already have an account?</h2>
				<a href="/login" class="btn btn-primary btn-lg">Log In</a>
			</div>
			
			<div class="auth-option">
				<h2>New to FlowLine?</h2>
				<a href="/register" class="btn btn-outlined btn-lg">Register</a>
			</div>
		</div>
		
		<div class="footer">
			<p>&copy; {new Date().getFullYear()} FlowLine. Open source under MIT License.</p>
		</div>
	</div>
</div>

<style>
	.welcome-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 64px);
		padding: var(--spacing-md);
		background-color: var(--color-bg);
	}

	.welcome-content {
		width: 100%;
		max-width: 800px;
		text-align: center;
	}

	.logo-section {
		margin-bottom: var(--spacing-2xl);
	}

	.banner {
		width: 409px;
		max-width: 100%;
		height: auto;
		margin: 0 auto var(--spacing-md);
	}

	.tagline {
		font-size: var(--font-size-xl);
		color: var(--color-text-secondary);
	}

	.auth-options {
		display: flex;
		gap: var(--spacing-2xl);
		margin-bottom: var(--spacing-2xl);
		justify-content: center;
	}

	.auth-option {
		flex: 1;
		max-width: 300px;
		padding: var(--spacing-lg);
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.auth-option h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}

	.auth-option .btn {
		width: 100%;
	}

	.footer {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	@media (max-width: 768px) {
		.auth-options {
			flex-direction: column;
			align-items: center;
		}

		.auth-option {
			width: 100%;
		}
	}
</style>