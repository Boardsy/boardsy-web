<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, user } from '$lib/stores/userStore';
	import { signOut, supabase } from '$lib/services/supabase';
	import Spinner from '$lib/components/Spinner.svelte';
	import { applyTheme, type Theme } from '$lib/services/themeManager';

	let name = $user?.name || '';
	let email = $user?.email || '';
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';

	let isLoading = false;
	let isSavingProfile = false;
	let isChangingPassword = false;
	let profileSuccess = '';
	let profileError = '';
	let passwordSuccess = '';
	let passwordError = '';
	let showDeleteAccountConfirm = false;
	let deleteAccountConfirmText = '';

	let theme: Theme = 'system';

	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		try {
			const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
			theme = savedTheme;

			isLoading = true;
			setTimeout(() => {
				isLoading = false;
			}, 300);
		} catch (error) {
			console.error('Error loading settings:', error);
		}
	});

	function updateTheme(newTheme: Theme) {
		theme = newTheme;
		applyTheme(theme);
	}

	async function saveProfile() {
		if (!name.trim()) {
			profileError = 'Name cannot be empty';
			return;
		}

		isSavingProfile = true;
		profileError = '';
		profileSuccess = '';

		try {
			const { error } = await supabase.auth.updateUser({
				data: { name }
			});

			if (error) throw error;

			if ($user) {
				user.set({
					...$user,
					name
				});
			}

			profileSuccess = 'Profile updated successfully';
		} catch (error) {
			console.error('Error updating profile:', error);
			profileError = 'Failed to update profile';
		} finally {
			isSavingProfile = false;
		}
	}

	async function changePassword() {
		if (!currentPassword || !newPassword || !confirmPassword) {
			passwordError = 'All password fields are required';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'New passwords do not match';
			return;
		}

		if (newPassword.length < 6) {
			passwordError = 'Password must be at least 6 characters long';
			return;
		}

		isChangingPassword = true;
		passwordError = '';
		passwordSuccess = '';

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) throw error;

			passwordSuccess = 'Password changed successfully';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			console.error('Error changing password:', error);
			passwordError = 'Failed to change password';
		} finally {
			isChangingPassword = false;
		}
	}

	function startDeleteAccount() {
		showDeleteAccountConfirm = true;
	}

	async function deleteAccount() {
		if (deleteAccountConfirmText !== 'DELETE') {
			return;
		}

		try {
			const { error } = await supabase.auth.admin.deleteUser($user?.id || '');

			if (error) throw error;

			await signOut();
			goto('/');
		} catch (error) {
			console.error('Error deleting account:', error);
			alert('Failed to delete account. Please contact support.');
		}
	}
</script>

<div class="settings-container">
	{#if isLoading}
		<div class="loading-container">
			<Spinner size="large" />
		</div>
	{:else}
		<div class="settings-header">
			<h1>Settings</h1>
			<p>Manage your account and app preferences</p>
		</div>

		<div class="settings-content">
			<div class="settings-sidebar">
				<nav class="sidebar-nav">
					<a href="#profile" class="nav-link active">Profile</a>
					<a href="#account" class="nav-link">Account</a>
					<a href="#appearance" class="nav-link">Appearance</a>
				</nav>
			</div>

			<div class="settings-main">
				<!-- Profile Settings -->
				<section id="profile" class="settings-section">
					<h2>Profile Settings</h2>

					<div class="card">
						<div class="form-group">
							<label for="name" class="form-label">Name</label>
							<input
								id="name"
								type="text"
								bind:value={name}
								class="form-input"
								placeholder="Your name"
							/>
						</div>

						<div class="form-group">
							<label for="email" class="form-label">Email</label>
							<input id="email" type="email" value={email} class="form-input" disabled />
							<p class="form-hint">To change your email, please contact support</p>
						</div>

						{#if profileSuccess}
							<div class="success-message">{profileSuccess}</div>
						{/if}

						{#if profileError}
							<div class="error-message">{profileError}</div>
						{/if}

						<div class="form-actions">
							<button class="btn primary" on:click={saveProfile} disabled={isSavingProfile}>
								{#if isSavingProfile}
									Saving...
								{:else}
									Save Profile
								{/if}
							</button>
						</div>
					</div>
				</section>

				<!-- Account Settings -->
				<section id="account" class="settings-section">
					<h2>Account Settings</h2>

					<div class="card">
						<h3>Change Password</h3>

						<div class="form-group">
							<label for="currentPassword" class="form-label">Current Password</label>
							<input
								id="currentPassword"
								type="password"
								bind:value={currentPassword}
								class="form-input"
								placeholder="Current password"
							/>
						</div>

						<div class="form-group">
							<label for="newPassword" class="form-label">New Password</label>
							<input
								id="newPassword"
								type="password"
								bind:value={newPassword}
								class="form-input"
								placeholder="New password"
							/>
						</div>

						<div class="form-group">
							<label for="confirmPassword" class="form-label">Confirm New Password</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="form-input"
								placeholder="Confirm new password"
							/>
						</div>

						{#if passwordSuccess}
							<div class="success-message">{passwordSuccess}</div>
						{/if}

						{#if passwordError}
							<div class="error-message">{passwordError}</div>
						{/if}

						<div class="form-actions">
							<button class="btn primary" on:click={changePassword} disabled={isChangingPassword}>
								{#if isChangingPassword}
									Changing...
								{:else}
									Change Password
								{/if}
							</button>
						</div>
					</div>

					<div class="card danger-zone">
						<h3>Danger Zone</h3>
						<p>Once you delete your account, there is no going back. Please be certain.</p>

						{#if !showDeleteAccountConfirm}
							<button class="btn danger" on:click={startDeleteAccount}> Delete Account </button>
						{:else}
							<div class="delete-confirm">
								<p>Please type <strong>DELETE</strong> to confirm:</p>
								<input
									type="text"
									bind:value={deleteAccountConfirmText}
									class="form-input"
									placeholder="Type DELETE to confirm"
								/>
								<div class="delete-actions">
									<button class="btn secondary" on:click={() => (showDeleteAccountConfirm = false)}>
										Cancel
									</button>
									<button
										class="btn danger"
										on:click={deleteAccount}
										disabled={deleteAccountConfirmText !== 'DELETE'}
									>
										Permanently Delete Account
									</button>
								</div>
							</div>
						{/if}
					</div>
				</section>

				<!-- Appearance Settings -->
				<section id="appearance" class="settings-section">
					<h2>Appearance</h2>

					<div class="card">
						<h3>Theme</h3>

						<div class="theme-options">
							<div class="theme-option">
								<button
									class="theme-button {theme === 'light' ? 'active' : ''}"
									on:click={() => updateTheme('light')}
								>
									<div class="theme-preview light-theme"></div>
									<span>Light</span>
								</button>
							</div>

							<div class="theme-option">
								<button
									class="theme-button {theme === 'dark' ? 'active' : ''}"
									on:click={() => updateTheme('dark')}
								>
									<div class="theme-preview dark-theme"></div>
									<span>Dark</span>
								</button>
							</div>

							<div class="theme-option">
								<button
									class="theme-button {theme === 'system' ? 'active' : ''}"
									on:click={() => updateTheme('system')}
								>
									<div class="theme-preview system-theme"></div>
									<span>System</span>
								</button>
							</div>
						</div>
					</div>
				</section>

				<!-- Notification section removed -->
			</div>
		</div>
	{/if}
</div>

<style>
	.settings-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 24px;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 400px;
	}

	.settings-header {
		margin-bottom: 32px;
	}

	.settings-header h1 {
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 8px;
		color: #0f172a;
	}

	.settings-header p {
		font-size: 16px;
		color: #64748b;
	}

	.settings-content {
		display: flex;
		gap: 32px;
	}

	.settings-sidebar {
		width: 240px;
		flex-shrink: 0;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
		position: sticky;
		top: 24px;
	}

	.nav-link {
		padding: 12px 16px;
		border-radius: 8px;
		font-weight: 500;
		color: #64748b;
		transition: all 0.2s;
	}

	.nav-link:hover {
		background-color: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.nav-link.active {
		background-color: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		font-weight: 600;
	}

	.settings-main {
		flex: 1;
	}

	.settings-section {
		margin-bottom: 48px;
	}

	.settings-section h2 {
		font-size: 24px;
		font-weight: 600;
		margin-bottom: 16px;
		color: #0f172a;
		padding-bottom: 8px;
		border-bottom: 1px solid #e2e8f0;
	}

	.card {
		background-color: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
		margin-bottom: 24px;
	}

	.card h3 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		color: #0f172a;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-label {
		display: block;
		margin-bottom: 8px;
		font-weight: 500;
		color: #475569;
	}

	.form-input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.2s;
	}

	.form-input:focus {
		border-color: #3b82f6;
		outline: none;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input:disabled {
		background-color: #f8fafc;
		color: #94a3b8;
		cursor: not-allowed;
	}

	.form-hint {
		font-size: 14px;
		color: #94a3b8;
		margin-top: 4px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 24px;
	}

	.btn {
		padding: 10px 16px;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.btn.primary {
		background-color: #3b82f6;
		color: white;
	}

	.btn.primary:hover {
		background-color: #2563eb;
	}

	.btn.primary:disabled {
		background-color: #93c5fd;
		cursor: not-allowed;
	}

	.btn.secondary {
		background-color: #f1f5f9;
		color: #475569;
	}

	.btn.secondary:hover {
		background-color: #e2e8f0;
	}

	.btn.danger {
		background-color: #ef4444;
		color: white;
	}

	.btn.danger:hover {
		background-color: #dc2626;
	}

	.btn.danger:disabled {
		background-color: #fca5a5;
		cursor: not-allowed;
	}

	.success-message {
		padding: 12px;
		background-color: rgba(16, 185, 129, 0.1);
		color: #10b981;
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.error-message {
		padding: 12px;
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.danger-zone {
		border: 1px solid #fca5a5;
	}

	.danger-zone h3 {
		color: #ef4444;
	}

	.danger-zone p {
		margin-bottom: 16px;
		color: #64748b;
	}

	.delete-confirm {
		background-color: #fee2e2;
		padding: 16px;
		border-radius: 6px;
		margin-top: 16px;
	}

	.delete-confirm p {
		margin-bottom: 12px;
		color: #b91c1c;
	}

	.delete-actions {
		display: flex;
		gap: 8px;
		margin-top: 16px;
	}

	/* Theme Selector */
	.theme-options {
		display: flex;
		gap: 16px;
	}

	.theme-option {
		flex: 1;
	}

	.theme-button {
		width: 100%;
		border: 2px solid transparent;
		border-radius: 8px;
		padding: 8px;
		background: none;
		transition: all 0.2s;
		cursor: pointer;
	}

	.theme-button.active {
		border-color: #3b82f6;
	}

	.theme-preview {
		height: 100px;
		border-radius: 4px;
		margin-bottom: 8px;
	}

	.light-theme {
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
	}

	.dark-theme {
		background-color: #1e293b;
		border: 1px solid #334155;
	}

	.system-theme {
		background: linear-gradient(to right, #f8fafc 50%, #1e293b 50%);
		border: 1px solid #e2e8f0;
	}

	.theme-button span {
		font-weight: 500;
	}

	/* Notification toggles removed */

	@media (prefers-color-scheme: dark) {
		.settings-header h1 {
			color: #f1f5f9;
		}

		.settings-header p {
			color: #94a3b8;
		}

		.settings-section h2 {
			color: #f1f5f9;
			border-bottom-color: #334155;
		}

		.card {
			background-color: #1e293b;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
		}

		.card h3 {
			color: #f1f5f9;
		}

		.form-label {
			color: #cbd5e1;
		}

		.form-input {
			background-color: #334155;
			border-color: #475569;
			color: #f1f5f9;
		}

		.form-input:focus {
			border-color: #60a5fa;
			box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
		}

		.form-input:disabled {
			background-color: #1f2937;
			color: #94a3b8;
		}

		.btn.secondary {
			background-color: #334155;
			color: #e2e8f0;
		}

		.btn.secondary:hover {
			background-color: #475569;
		}

		.delete-confirm {
			background-color: rgba(239, 68, 68, 0.2);
		}
	}

	@media (max-width: 768px) {
		.settings-content {
			flex-direction: column;
		}

		.settings-sidebar {
			width: 100%;
		}

		.sidebar-nav {
			flex-direction: row;
			overflow-x: auto;
			padding-bottom: 8px;
			margin-bottom: 24px;
			position: static;
		}

		.nav-link {
			white-space: nowrap;
		}

		.theme-options {
			flex-direction: column;
		}
	}
</style>
