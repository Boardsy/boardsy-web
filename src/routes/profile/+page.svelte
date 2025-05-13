<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, user } from '$lib/stores/userStore';
	import { supabase } from '$lib/services/supabase';
	import Spinner from '$lib/components/Spinner.svelte';
	import { boards } from '$lib/stores/boardStore';

	let isLoading = true;
	let isSaving = false;
	let showSuccessMessage = false;
	let errorMessage = '';
	let successMessage = '';

	let displayName = $user?.name || '';
	let avatarUrl = $user?.avatarUrl || '';
	let email = $user?.email || '';

	let totalBoards = 0;
	let joinDate = '';

	onMount(async () => {
		if (!$isAuthenticated) {
			goto('/login');
			return;
		}

		try {
			isLoading = true;

			displayName = $user?.name || '';
			avatarUrl = $user?.avatarUrl || '';
			email = $user?.email || '';

			totalBoards = $boards.length;

			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (!userError && userData) {
				const createdAt = new Date(userData.user.created_at);
				joinDate = createdAt.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});
			}
		} catch (error) {
			console.error('Error loading profile:', error);
			errorMessage = 'Failed to load profile data';
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="profile-container">
	{#if isLoading}
		<div class="loading-container">
			<Spinner size="large" />
		</div>
	{:else}
		<div class="profile-header">
			<h1>Profile</h1>
			<p>View and update your personal information</p>
		</div>

		<div class="profile-content">
			<div class="card">
				<div class="profile-section">
					<div class="profile-avatar">
						{#if avatarUrl}
							<img src={avatarUrl} alt="Your profile" class="avatar-image" />
						{:else}
							<div class="avatar-placeholder">
								{displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
							</div>
						{/if}
					</div>

					<div class="profile-details">
						<div class="form-group">
							<label for="displayName" class="form-label">Display Name</label>
							<input
								id="displayName"
								type="text"
								bind:value={displayName}
								class="form-input"
								placeholder="Your name"
								disabled={isSaving}
							/>
						</div>

						<div class="form-group">
							<label for="email" class="form-label">Email</label>
							<input id="email" type="email" value={email} class="form-input" disabled />
							<p class="form-hint">Email cannot be changed</p>
						</div>

						{#if successMessage}
							<div class="success-message">{successMessage}</div>
						{/if}

						{#if errorMessage}
							<div class="error-message">{errorMessage}</div>
						{/if}

						<div class="form-actions">
							<button class="btn primary" disabled={isSaving}>
								{#if isSaving}
									<Spinner size="small" color="white" />
								{:else}
									Save Changes
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="card">
				<h2>Account Info</h2>
				<div class="account-info">
					<div class="info-item">
						<span class="info-label">Member Since</span>
						<span class="info-value">{joinDate}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Total Boards</span>
						<span class="info-value">{totalBoards}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-container {
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

	.profile-header {
		margin-bottom: 32px;
	}

	.profile-header h1 {
		font-size: 32px;
		font-weight: 700;
		margin-bottom: 8px;
		color: var(--color-text-primary);
	}

	.profile-header p {
		font-size: 16px;
		color: var(--color-text-secondary);
	}

	.profile-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 800px;
		margin: 0 auto;
	}

	.card {
		background-color: var(--color-surface);
		border-radius: 12px;
		padding: 24px;
		box-shadow: var(--shadow-md);
		margin-bottom: 24px;
	}

	.card h2 {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		color: var(--color-text-primary);
		padding-bottom: 8px;
		border-bottom: 1px solid var(--color-border);
	}

	.profile-section {
		display: flex;
		gap: 24px;
	}

	.profile-avatar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.avatar-image,
	.avatar-placeholder {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		border: 3px solid var(--color-border);
		margin-top: 50px;
	}

	.avatar-image {
		object-fit: cover;
	}

	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-primary);
		color: white;
		font-size: 48px;
		font-weight: 500;
	}

	.profile-details {
		flex: 1;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.success-message {
		padding: 12px;
		background-color: rgba(16, 185, 129, 0.1);
		color: var(--color-secondary);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.error-message {
		padding: 12px;
		background-color: rgba(239, 68, 68, 0.1);
		color: var(--color-error);
		border-radius: 6px;
		margin-bottom: 16px;
	}

	.account-info {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--color-border);
	}

	.info-label {
		color: var(--color-text-secondary);
		font-size: 14px;
	}

	.info-value {
		font-weight: 500;
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
		background-color: var(--color-primary);
		color: white;
	}

	.btn.primary:hover {
		background-color: var(--color-primary-dark);
	}

	.btn.primary:disabled {
		background-color: var(--color-primary-light);
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.profile-section {
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.profile-details {
			width: 100%;
		}

		.form-actions {
			display: flex;
			justify-content: center;
		}
	}
</style>
