<script lang="ts">
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let color: 'primary' | 'white' = 'primary';
</script>

<div class="spinner-container {size}">
	<div class="spinner {color}"></div>
</div>

<style>
	.spinner-container {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		border-radius: 50%;
		border: 2px solid transparent;
		animation: spin 1s linear infinite;
	}

	.primary {
		border-top-color: var(--color-primary);
	}

	.white {
		border-top-color: white;
	}

	.small {
		width: 16px;
		height: 16px;
	}

	.small .spinner {
		width: 16px;
		height: 16px;
		border-width: 2px;
	}

	.medium {
		width: 24px;
		height: 24px;
	}

	.medium .spinner {
		width: 24px;
		height: 24px;
		border-width: 2px;
	}

	.large {
		width: 48px;
		height: 48px;
	}

	.large .spinner {
		width: 48px;
		height: 48px;
		border-width: 3px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
