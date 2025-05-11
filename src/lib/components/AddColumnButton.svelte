<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/services/supabase';
	import { fetchBoardDetails } from '$lib/stores/boardStore';

	export let boardId: string;

	const dispatch = createEventDispatcher();

	let isAdding = false;
	let newColumnTitle = '';
	let isSubmitting = false;
	let errorMessage = '';

	function toggleAdding() {
		isAdding = !isAdding;
		if (isAdding) {
			setTimeout(() => {
				const input = document.getElementById('new-column-input');
				if (input) input.focus();
			}, 0);
		} else {
			newColumnTitle = '';
			errorMessage = '';
		}
	}

	async function handleAddColumn() {
		if (!newColumnTitle.trim()) {
			errorMessage = 'Title is required';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const { data: existingColumns, error: fetchError } = await supabase
				.from('columns')
				.select('position')
				.eq('board_id', boardId)
				.order('position', { ascending: false })
				.limit(1);

			if (fetchError) throw fetchError;

			const newPosition =
				existingColumns && existingColumns.length > 0 ? existingColumns[0].position + 1 : 0;

			const { error: insertError } = await supabase.from('columns').insert([
				{
					title: newColumnTitle,
					board_id: boardId,
					position: newPosition
				}
			]);

			if (insertError) throw insertError;

			await fetchBoardDetails(boardId);

			newColumnTitle = '';
			isAdding = false;
		} catch (error) {
			console.error('Error adding column:', error);
			errorMessage = 'Failed to add column';
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleAddColumn();
		} else if (event.key === 'Escape') {
			toggleAdding();
		}
	}
</script>

{#if isAdding}
	<div class="add-column-form">
		<div class="add-column-header">
			<h3>Add Column</h3>
			<button class="close-btn" on:click={toggleAdding} aria-label="Close"> &times; </button>
		</div>

		{#if errorMessage}
			<div class="error-message">{errorMessage}</div>
		{/if}

		<input
			id="new-column-input"
			type="text"
			class="form-input"
			placeholder="Enter column title"
			bind:value={newColumnTitle}
			on:keydown={handleKeyPress}
			disabled={isSubmitting}
		/>

		<div class="form-actions">
			<button
				type="button"
				class="btn btn-primary btn-sm"
				on:click={handleAddColumn}
				disabled={isSubmitting}
			>
				{isSubmitting ? 'Adding...' : 'Add Column'}
			</button>
		</div>
	</div>
{:else}
	<button class="add-column-button" on:click={toggleAdding}>
		<span class="add-icon">+</span>
		<span>Add a column</span>
	</button>
{/if}

<style>
	.add-column-button {
		min-width: 280px;
		height: fit-content;
		background-color: rgba(255, 255, 255, 0.1);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition:
			background-color 0.2s,
			color 0.2s;
		margin-right: var(--spacing-md);
	}

	.add-column-button:hover {
		background-color: rgba(59, 130, 246, 0.1);
		color: var(--color-primary);
	}

	.add-icon {
		font-size: 1.2rem;
		margin-right: var(--spacing-xs);
	}

	.add-column-form {
		min-width: 280px;
		max-width: 280px;
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: var(--spacing-md);
		box-shadow: var(--shadow-md);
		margin-right: var(--spacing-md);
	}

	.add-column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-md);
	}

	.add-column-header h3 {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-medium);
	}

	.close-btn {
		font-size: 1.5rem;
		line-height: 1;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	.error-message {
		color: var(--color-error);
		font-size: var(--font-size-xs);
		margin-bottom: var(--spacing-xs);
	}

	.form-actions {
		margin-top: var(--spacing-md);
		display: flex;
		justify-content: flex-end;
	}
</style>
