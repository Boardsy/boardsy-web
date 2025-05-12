<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let boardName: string;
	
	const dispatch = createEventDispatcher<{
		close: void;
		confirm: void;
	}>();

	function close() {
		dispatch('close');
	}

	function confirm() {
		dispatch('confirm');
	}
</script>

<div class="modal-backdrop" on:click={close}>
	<div class="modal-content" on:click|stopPropagation>
		<div class="modal-header">
			<h2>Delete Board</h2>
			<button class="close-button" on:click={close} aria-label="Close"> &times; </button>
		</div>

		<div class="modal-body">
			<p>Are you sure you want to delete <strong>{boardName}</strong>?</p>
			<p class="warning">This action cannot be undone. All columns and cards associated with this board will be permanently deleted.</p>
		</div>

		<div class="modal-footer">
			<button type="button" class="btn btn-outlined" on:click={close}>
				Cancel
			</button>
			<button type="button" class="btn btn-danger" on:click={confirm}>
				Delete Board
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
		max-width: 500px;
		max-height: 90vh;
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
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
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

	.warning {
		color: var(--color-error);
		background-color: rgba(239, 68, 68, 0.1);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-top: var(--spacing-md);
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