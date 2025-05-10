<script lang="ts">
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/services/supabase';
	import { isAuthenticated } from '$lib/stores/userStore';
	import Spinner from '$lib/components/Spinner.svelte';
	import { onMount } from 'svelte';
	
	let email = '';
	let password = '';
	let isSubmitting = false;
	let errorMessage = '';
	
	onMount(() => {
		if ($isAuthenticated) {
			goto('/boards');
		}
	});
	
	async function handleLogin() {
		if (!email || !password) {
			errorMessage = 'Please enter both email and password';
			return;
		}
		
		isSubmitting = true;
		errorMessage = '';
		
		try {
			const { error } = await signIn(email, password);
			
			if (error) {
				errorMessage = error.message || 'Failed to sign in';
				return;
			}
			
			goto('/boards');
		} catch (error) {
			console.error('Login error:', error);
			errorMessage = 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>Log in to FlowLine</h1>
			<p>Welcome back! Enter your details to continue.</p>
		</div>
		
		<form on:submit|preventDefault={handleLogin} class="auth-form">
			{#if errorMessage}
				<div class="auth-error">
					{errorMessage}
				</div>
			{/if}
			
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
				<div class="password-label">
					<label for="password" class="form-label">Password</label>
					<a href="/forgot-password" class="forgot-password">Forgot password?</a>
				</div>
				<input 
					id="password"
					type="password" 
					bind:value={password}
					class="form-input"
					placeholder="Enter your password"
					disabled={isSubmitting}
					required
				/>
			</div>
			
			<button 
				type="submit" 
				class="btn btn-primary btn-full" 
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<Spinner size="small" color="white" />
				{:else}
					Log in
				{/if}
			</button>
		</form>
		
		<div class="auth-footer">
			<p>Don't have an account? <a href="/register">Sign up</a></p>
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
	
	.password-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.forgot-password {
		font-size: var(--font-size-sm);
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