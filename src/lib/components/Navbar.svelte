<script lang="ts">
	import { page } from '$app/stores';
	import { isAuthenticated, user } from '$lib/stores/userStore';
	import { signOut } from '$lib/services/supabase';
	import { onMount } from 'svelte';

	let isMobileMenuOpen = false;
	let userMenuOpen = false;
	let logoSrc = '/logo.svg';

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function toggleUserMenu() {
		userMenuOpen = !userMenuOpen;
	}

	function handleSignOut() {
		signOut();
		userMenuOpen = false;
	}

	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.user-menu') && !target.closest('.user-button')) {
				userMenuOpen = false;
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<header class="navbar">
	<div class="container navbar-container">
		<div class="navbar-start">
			<a href="/" class="logo">
				<img src={logoSrc} alt="FlowLine Logo" width="32" height="32" />
				<span>FlowLine</span>
			</a>

			{#if $isAuthenticated}
				<nav class="desktop-nav">
					<ul>
						<li class:active={$page.url.pathname === '/boards'}>
							<a href="/boards">Boards</a>
						</li>
						<li class:active={$page.url.pathname === '/templates'}>
							<a href="/templates">Templates</a>
						</li>
					</ul>
				</nav>
			{/if}
		</div>

		<div class="navbar-end">
			{#if $isAuthenticated}
				<button class="btn btn-primary create-btn">
					<span class="icon">+</span>
					<span class="create-text">Create</span>
				</button>

				<div class="user-dropdown">
					<button class="user-button" on:click={toggleUserMenu}>
						{#if $user?.avatarUrl}
							<img src={$user.avatarUrl} alt="User avatar" class="avatar" />
						{:else}
							<div class="avatar-placeholder">
								{$user?.name?.charAt(0) || $user?.email?.charAt(0)?.toUpperCase() || '?'}
							</div>
						{/if}
					</button>

					{#if userMenuOpen}
						<div class="user-menu">
							<div class="user-info">
								<p class="user-name">{$user?.name || 'User'}</p>
								<p class="user-email">{$user?.email}</p>
							</div>
							<ul>
								<li>
									<a href="/profile">Profile</a>
								</li>
								<li>
									<a href="/settings">Settings</a>
								</li>
								<li>
									<button on:click={handleSignOut}>Sign out</button>
								</li>
							</ul>
						</div>
					{/if}
				</div>
			{:else}
				<div class="auth-buttons">
					<a href="/login" class="btn btn-outlined">Log in</a>
					<a href="/register" class="btn btn-primary">Sign up</a>
				</div>
			{/if}

			<button class="mobile-menu-button" on:click={toggleMobileMenu} aria-label="Menu">
				<span class="bar"></span>
				<span class="bar"></span>
				<span class="bar"></span>
			</button>
		</div>
	</div>

	{#if isMobileMenuOpen}
		<div class="mobile-menu">
			{#if $isAuthenticated}
				<nav>
					<ul>
						<li>
							<a href="/boards">Boards</a>
						</li>
						<li>
							<a href="/templates">Templates</a>
						</li>
						<li>
							<a href="/profile">Profile</a>
						</li>
						<li>
							<a href="/settings">Settings</a>
						</li>
						<li>
							<button on:click={handleSignOut}>Sign out</button>
						</li>
					</ul>
				</nav>
			{:else}
				<div class="mobile-auth-buttons">
					<a href="/login" class="btn btn-outlined">Log in</a>
					<a href="/register" class="btn btn-primary">Sign up</a>
				</div>
			{/if}
		</div>
	{/if}
</header>

<style>
	.navbar {
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	.navbar-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.navbar-start,
	.navbar-end {
		display: flex;
		align-items: center;
	}

	.logo {
		display: flex;
		align-items: center;
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-lg);
		color: var(--color-primary);
		margin-right: var(--spacing-xl);
	}

	.logo img {
		margin-right: var(--spacing-xs);
	}

	.desktop-nav {
		display: none;
	}

	.desktop-nav ul {
		display: flex;
	}

	.desktop-nav li {
		margin-right: var(--spacing-md);
	}

	.desktop-nav a {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-md);
		transition: background-color 0.2s;
	}

	.desktop-nav a:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.desktop-nav li.active a {
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.create-btn {
		display: none;
		margin-right: var(--spacing-md);
	}

	.icon {
		font-size: 1.2em;
		margin-right: var(--spacing-xs);
	}

	.auth-buttons {
		display: none;
	}

	.auth-buttons .btn:first-child {
		margin-right: var(--spacing-sm);
	}

	.user-dropdown {
		position: relative;
	}

	.user-button {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-primary-light);
		color: white;
		font-weight: var(--font-weight-medium);
		border: none;
	}

	.avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background-color: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		width: 240px;
		z-index: var(--z-dropdown);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.user-info {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.user-name {
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-xs);
	}

	.user-email {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.user-menu ul {
		padding: var(--spacing-sm) 0;
	}

	.user-menu li a,
	.user-menu li button {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		transition: background-color 0.2s;
	}

	.user-menu li a:hover,
	.user-menu li button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.mobile-menu-button {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 24px;
		height: 20px;
	}

	.bar {
		height: 2px;
		width: 100%;
		background-color: var(--color-text-primary);
		border-radius: 2px;
	}

	.mobile-menu {
		display: block;
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-md);
	}

	.mobile-menu ul {
		margin-bottom: var(--spacing-md);
	}

	.mobile-menu li {
		margin-bottom: var(--spacing-sm);
	}

	.mobile-menu a,
	.mobile-menu button {
		display: block;
		width: 100%;
		padding: var(--spacing-sm);
		text-align: left;
	}

	.mobile-auth-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.mobile-auth-buttons .btn {
		width: 100%;
		text-align: center;
	}

	@media (min-width: 768px) {
		.mobile-menu-button {
			display: none;
		}

		.desktop-nav {
			display: block;
		}

		.create-btn {
			display: flex;
		}

		.auth-buttons {
			display: flex;
		}
	}

	@media (max-width: 640px) {
		.create-text {
			display: none;
		}

		.create-btn {
			padding: var(--spacing-xs);
			width: 32px;
			height: 32px;
			border-radius: 50%;
		}

		.icon {
			margin-right: 0;
		}
	}
</style>
