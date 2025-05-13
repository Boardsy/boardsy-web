<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/services/supabase';
	import { isAuthenticated } from '$lib/stores/userStore';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let isSubmitting = false;
	let errorMessage = '';
	let successMessage = '';

	onMount(() => {
		if ($isAuthenticated) {
			goto('/boards');
		}
	});

	async function handleRegister() {
		if (!email || !password || !confirmPassword) {
			errorMessage = 'Please fill out all required fields';
			return;
		}

		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			errorMessage = 'Password must be at least 6 characters long';
			return;
		}

		isSubmitting = true;
		errorMessage = '';
		successMessage = '';

		try {
			const { error } = await signUp(email, password);

			if (error) {
				errorMessage = error.message || 'Failed to sign up';
				return;
			}

			successMessage = 'Registration successful! Please check your email to confirm your account.';
			name = '';
			email = '';
			password = '';
			confirmPassword = '';

			setTimeout(() => {
				goto('/login');
			}, 3000);
		} catch (error) {
			console.error('Registration error:', error);
			errorMessage = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Create an account</h1>
			<p>Join Boardsy to organize your work and boost productivity.</p>
		</div>

		<form on:submit|preventDefault={handleRegister} class="auth-form">
			{#if errorMessage}
				<div class="auth-error">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="auth-success">
					{successMessage}
				</div>
			{/if}

			<div class="form-group">
				<label for="name" class="form-label">Name (optional)</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="form-input"
					placeholder="Enter your name"
					disabled={isSubmitting}
				/>
			</div>

			<div class="form-group">
				<label for="email" class="form-label">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="form-input"
					placeholder="Enter your email"
					disabled={isSubmitting}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password" class="form-label">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="form-input"
					placeholder="Create a password"
					disabled={isSubmitting}
					required
				/>
				<p class="form-hint">Must be at least 6 characters</p>
			</div>

			<div class="form-group">
				<label for="confirmPassword" class="form-label">Confirm Password</label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={confirmPassword}
					class="form-input"
					placeholder="Confirm your password"
					disabled={isSubmitting}
					required
				/>
			</div>

			<div class="form-terms">
				<p>
					By clicking the button below, you agree to our <a href="/terms">Terms of Service</a> and
					<a href="/privacy">Privacy Policy</a>.
				</p>
			</div>

			<button type="submit" class="btn btn-primary btn-full" disabled={isSubmitting}>
				{#if isSubmitting}
					<Spinner size="small" color="white" />
				{:else}
					Create account
				{/if}
			</button>
		</form>

		<div class="auth-footer">
			<p>Already have an account? <a href="/login">Log in</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 64px);
		padding: var(--spacing-md);
	}

	.auth-card {
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		width: 100%;
		max-width: 400px;
		padding: var(--spacing-xl);
	}

	.auth-header {
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.auth-header h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-xs);
		color: var(--color-text-primary);
	}

	.auth-header p {
		color: var(--color-text-secondary);
	}

	.auth-form {
		margin-bottom: var(--spacing-lg);
	}

	.auth-error {
		background-color: rgba(239, 68, 68, 0.1);
		color: var(--color-error);
		padding: var(--spacing-sm);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.auth-success {
		background-color: rgba(16, 185, 129, 0.1);
		color: var(--color-secondary);
		padding: var(--spacing-sm);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.form-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin-top: var(--spacing-xs);
	}

	.form-terms {
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.form-terms a {
		color: var(--color-primary);
	}

	.btn-full {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 42px;
	}

	.auth-footer {
		text-align: center;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.auth-footer a {
		color: var(--color-primary);
		font-weight: var(--font-weight-medium);
	}
</style>
