<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Column, Card } from '$lib/types/models';
	import { createCard, deleteColumn, updateColumnTitle } from '$lib/stores/boardStore';
	import CardItem from '$lib/components/CardItem.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import { dndzone } from 'svelte-dnd-action';

	export let column: Column;

	const dispatch = createEventDispatcher<{
		cardMove: { cardId: string; columnId: string; position: number };
		cardReorder: { columnId: string; cardIds: string[] };
	}>();

	let newCardTitle = '';
	let isAddingCard = false;
	let isTyping = false;
	let errorMessage = '';
	let showDeleteModal = false;
	let isEditingTitle = false;
	let editedTitle = column.title;

	function toggleAddCard() {
		isAddingCard = !isAddingCard;
		if (isAddingCard) {
			setTimeout(() => {
				const input = document.getElementById(`new-card-${column.id}`);
				if (input) input.focus();
			}, 0);
		} else {
			newCardTitle = '';
			errorMessage = '';
		}
	}

	async function handleAddCard() {
		if (!newCardTitle.trim()) {
			errorMessage = 'Title is required';
			return;
		}

		isTyping = true;
		errorMessage = '';

		try {
			await createCard(column.id, newCardTitle);
			newCardTitle = '';
			isAddingCard = false;
		} catch (error) {
			console.error('Error adding card:', error);
			errorMessage = 'Failed to add card';
		} finally {
			isTyping = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleAddCard();
		} else if (event.key === 'Escape') {
			toggleAddCard();
		}
	}
	
	function handleTitleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			saveColumnTitle();
		} else if (event.key === 'Escape') {
			cancelEditTitle();
		}
	}

	function handleDndConsider(e: CustomEvent<{ items: any[] }>) {
		const newItems = e.detail.items;
		column = { ...column, cards: newItems };
	}

	function handleDndFinalize(e: CustomEvent<{ items: any[] }>) {
		const newItems = e.detail.items;
		column = { ...column, cards: newItems };

		const cardIds = newItems.map((item) => item.id);
		dispatch('cardReorder', { columnId: column.id, cardIds });
	}
	
	function confirmDeleteColumn() {
		showDeleteModal = true;
	}
	
	async function handleDeleteColumn() {
		try {
			await deleteColumn(column.id);
			showDeleteModal = false;
		} catch (error) {
			console.error('Error deleting column:', error);
			errorMessage = 'Failed to delete column';
			showDeleteModal = false;
		}
	}
	
	function startEditTitle() {
		editedTitle = column.title;
		isEditingTitle = true;
		setTimeout(() => {
			const titleInput = document.getElementById(`column-title-${column.id}`);
			if (titleInput) titleInput.focus();
		}, 0);
	}
	
	async function saveColumnTitle() {
		if (editedTitle.trim() && editedTitle !== column.title) {
			try {
				await updateColumnTitle(column.id, editedTitle.trim());
			} catch (error) {
				console.error('Error updating column title:', error);
				editedTitle = column.title;
			}
		} else {
			editedTitle = column.title;
		}
		isEditingTitle = false;
	}
	
	function cancelEditTitle() {
		editedTitle = column.title;
		isEditingTitle = false;
	}
</script>

<div class="board-column">
	<div class="column-header">
		{#if isEditingTitle}
			<div class="column-title-edit">
				<input 
					id="column-title-{column.id}" 
					type="text" 
					bind:value={editedTitle} 
					on:blur={saveColumnTitle}
					on:keydown={handleTitleKeyPress}
					class="title-input"
				/>
			</div>
		{:else}
			<div class="column-title-container" on:dblclick={startEditTitle}>
				<h2 class="column-title">{column.title}</h2>
				<button class="edit-button" on:click={startEditTitle} aria-label="Edit column title">
					✏️
				</button>
			</div>
		{/if}
		<div class="column-header-actions">
			<span class="column-count">{column.cards.length}</span>
			<button class="delete-button" on:click={confirmDeleteColumn} aria-label="Delete column">
				🗑️
			</button>
		</div>
	</div>

	<div
		class="column-body"
		use:dndzone={{
			items: column.cards,
			type: 'card',
			dropFromOthersDisabled: false,
			dragDisabled: isAddingCard
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each column.cards as card (card.id)}
			<CardItem {card} columnId={column.id} />
		{/each}

		{#if isAddingCard}
			<div class="add-card-form">
				{#if errorMessage}
					<div class="error-message">{errorMessage}</div>
				{/if}

				<textarea
					id="new-card-{column.id}"
					class="form-input"
					placeholder="Enter a title for this card..."
					bind:value={newCardTitle}
					disabled={isTyping}
					on:keydown={handleKeyPress}
					rows="3"
				></textarea>

				<div class="add-card-actions">
					<button
						type="button"
						class="btn btn-primary btn-sm"
						on:click={handleAddCard}
						disabled={isTyping}
					>
						Add Card
					</button>
					<button
						type="button"
						class="btn btn-icon"
						on:click={toggleAddCard}
						disabled={isTyping}
						aria-label="Cancel"
					>
						&times;
					</button>
				</div>
			</div>
		{/if}
	</div>

	{#if !isAddingCard}
		<div class="add-card-btn" on:click={toggleAddCard}>+ Add a card</div>
	{/if}
</div>

{#if showDeleteModal}
	<DeleteConfirmModal 
		title="Delete Column" 
		message="Are you sure you want to delete this column? All cards within this column will be permanently deleted."
		confirmText="Delete Column"
		on:confirm={handleDeleteColumn}
		on:cancel={() => showDeleteModal = false}
	/>
{/if}

<style>
	.board-column {
		display: flex;
		flex-direction: column;
		min-width: 280px;
		max-width: 280px;
		background-color: var(--color-bg-light);
		border-radius: var(--radius-lg);
		margin-right: var(--spacing-md);
		height: fit-content;
		max-height: 100%;
		box-shadow: var(--shadow-sm);
	}

	@media (prefers-color-scheme: dark) {
		.board-column {
			background-color: var(--color-bg-dark);
		}
	}

	.column-header {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.column-title-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		cursor: pointer;
		padding: 2px 4px;
		border-radius: var(--radius-sm);
		transition: background-color 0.2s;
	}
	
	.column-title-container:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
	
	.column-title-edit {
		flex: 1;
	}
	
	.title-input {
		width: 100%;
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-medium);
		padding: 2px 4px;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-sm);
	}
	
	.column-header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.column-title {
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-md);
		margin: 0;
	}
	
	.edit-button {
		opacity: 0;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 2px;
		transition: opacity 0.2s;
	}
	
	.column-title-container:hover .edit-button {
		opacity: 0.7;
	}
	
	.edit-button:hover {
		opacity: 1 !important;
	}
	
	.delete-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		padding: 2px;
		opacity: 0.5;
		transition: opacity 0.2s;
	}
	
	.delete-button:hover {
		opacity: 1;
	}

	.column-count {
		background-color: var(--color-bg);
		color: var(--color-text-secondary);
		border-radius: 999px;
		padding: 0 8px;
		font-size: var(--font-size-xs);
	}

	.column-body {
		padding: var(--spacing-md);
		flex-grow: 1;
		overflow-y: auto;
		min-height: 50px;
		max-height: calc(100vh - 180px);
	}

	.add-card-btn {
		padding: var(--spacing-md);
		text-align: center;
		color: var(--color-text-secondary);
		transition: background-color 0.2s;
		border-top: 1px solid var(--color-border);
		cursor: pointer;
		border-bottom-left-radius: var(--radius-lg);
		border-bottom-right-radius: var(--radius-lg);
	}

	.add-card-btn:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: var(--color-text-primary);
	}

	.add-card-form {
		margin-bottom: var(--spacing-md);
	}

	.error-message {
		color: var(--color-error);
		font-size: var(--font-size-xs);
		margin-bottom: var(--spacing-xs);
	}

	.add-card-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-sm);
	}

	.btn-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		line-height: 1;
		border-radius: var(--radius-md);
		transition: background-color 0.2s;
	}

	.btn-icon:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
</style>