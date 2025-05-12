<script lang="ts">
	import { page } from '$app/stores';
	import { isAuthenticated, user } from '$lib/stores/userStore';
	import { signOut } from '$lib/services/supabase';
	import { onMount } from 'svelte';

	let isMobileMenuOpen = false;
	let userMenuOpen = false;
	let logoSrc = 'https://raw.githubusercontent.com/Balionelis/Flowline/refs/heads/main/static/flowline-logo.png';
	
	$: isHomePage = $page.url.pathname === '/';
	$: isAuthPage = $page.url.pathname === '/login' || $page.url.pathname === '/register';
	$: showNavbar = !isHomePage || $isAuthenticated;

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

{#if showNavbar}
<header class="navbar">
	{#if isAuthPage}
		<div class="centered-navbar-container">
			<div class="centered-logo">
				<a href="/" class="logo">
					<img src={logoSrc} alt="FlowLine Logo" width="48" height="48" />
					<span>FlowLine</span>
				</a>
			</div>
		</div>
	{:else}
		<div class="container navbar-container">
			<div class="navbar-start">
				<a href="/" class="logo">
					<img src={logoSrc} alt="FlowLine Logo" width="40" height="40" />
					<span>FlowLine</span>
				</a>

				{#if $isAuthenticated}
					<nav class="desktop-nav">
						<ul>
							<li class:active={$page.url.pathname === '/boards'}>
								<a href="/boards">Boards</a>
							</li>
						</ul>
					</nav>
				{/if}
			</div>

			<div class="navbar-end">
				{#if $isAuthenticated}

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
	{/if}

	{#if isMobileMenuOpen}
		<div class="mobile-menu">
			{#if $isAuthenticated}
				<nav>
					<ul>
						<li>
							<a href="/boards">Boards</a>
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
{/if}

<style>
	.navbar {
		background-color: #0f172a; /* Dark background matching your image */
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}
	
	.navbar-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80px;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
	}

	.centered-navbar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100px;
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		position: relative;
	}

	.centered-logo {
		text-align: center;
	}

	.centered-logo .logo {
		font-size: 1.75rem;
	}

	.centered-logo .logo img {
		width: 48px;
		height: 48px;
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
		font-size: 1.5rem;
		color: #3b82f6; /* Bright blue color */
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
		color: #f8fafc;
	}

	.desktop-nav a:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.desktop-nav li.active a {
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}

	.auth-buttons {
		display: none;
	}

	.btn-outlined {
		border: 1px solid #3b82f6;
		background-color: transparent;
		color: #3b82f6;
	}

	.btn-primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn:hover {
		transform: translateY(-2px);
		transition: transform 0.2s;
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
		margin-left: 16px;
	}

	.bar {
		height: 2px;
		width: 100%;
		background-color: #f8fafc; /* Light color for the bars */
		border-radius: 2px;
	}

	.mobile-menu {
		display: block;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: var(--spacing-md);
		background-color: #0f172a; /* Dark background for mobile menu */
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
		color: #f8fafc; /* Light text for mobile menu */
	}

	.mobile-auth-buttons {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.mobile-auth-buttons .btn {
		width: 100%;
		text-align: center;
		padding: 12px;
	}

	@media (min-width: 768px) {
		.mobile-menu-button {
			display: none;
		}

		.desktop-nav {
			display: block;
		}

		.auth-buttons {
			display: flex;
			gap: 12px;
		}
		
		.auth-buttons .btn {
			padding: 10px 20px;
		}
	}

	@media (max-width: 640px) {
		.navbar-container {
			height: 70px;
			padding: 0 var(--spacing-md);
		}
		
		.centered-navbar-container {
			height: 80px;
			padding: 16px var(--spacing-md);
		}
		
		.logo {
			font-size: 1.25rem;
		}
		
		.logo img {
			width: 32px;
			height: 32px;
		}
		
		.centered-logo .logo {
			font-size: 1.5rem;
		}
		
		.centered-logo .logo img {
			width: 40px;
			height: 40px;
		}
	}
</style>