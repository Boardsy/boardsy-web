<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let title = 'Confirm Deletion';
	export let message = 'Are you sure you want to delete this item?';
	export let confirmText = 'Delete';

	const dispatch = createEventDispatcher();

	function handleConfirm() {
		dispatch('confirm');
	}

	function handleCancel() {
		dispatch('cancel');
	}
</script>

<div class="modal-backdrop" on:click={handleCancel}>
	<div class="modal-content" on:click|stopPropagation>
		<div class="modal-header">
			<h2>{title}</h2>
			<button class="close-button" on:click={handleCancel} aria-label="Close"> &times; </button>
		</div>

		<div class="modal-body">
			<p>{message}</p>
		</div>

		<div class="modal-footer">
			<button class="btn btn-outlined" on:click={handleCancel}> Cancel </button>
			<button class="btn btn-danger" on:click={handleConfirm}>
				{confirmText}
			</button>
		</div>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal);
		padding: var(--spacing-md);
	}

	.modal-content {
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 400px;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
		margin: 0;
	}

	.close-button {
		font-size: 1.5rem;
		line-height: 1;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.modal-body {
		padding: var(--spacing-lg);
	}

	.modal-body p {
		margin: 0;
		color: var(--color-text-secondary);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
		padding: var(--spacing-md) var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.btn-danger {
		background-color: var(--color-error);
		color: white;
	}

	.btn-danger:hover {
		background-color: #dc2626; /* Darker red */
	}
</style>
