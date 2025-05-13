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
</script>

<div class="column">
	<!-- Column Header -->
	<div class="column-header">
		{#if isEditingTitle}
			<div class="title-edit">
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
			<div class="title-container" on:dblclick={startEditTitle}>
				<h2 class="column-title">{column.title}</h2>
				<button class="edit-button" on:click={startEditTitle} aria-label="Edit column title">
					<span>✏️</span>
				</button>
			</div>
		{/if}

		<div class="header-actions">
			<span class="column-count">{column.cards.length}</span>
			<button class="delete-button" on:click={confirmDeleteColumn} aria-label="Delete column">
				<span>🗑️</span>
			</button>
		</div>
	</div>

	<!-- Column Body / Cards Area -->
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
					class="card-textarea"
					placeholder="Enter a title for this card..."
					bind:value={newCardTitle}
					disabled={isTyping}
					on:keydown={handleKeyPress}
					rows="3"
				></textarea>

				<div class="form-actions">
					<button type="button" class="btn primary" on:click={handleAddCard} disabled={isTyping}>
						Add Card
					</button>
					<button
						type="button"
						class="btn-icon"
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

	<!-- Add Card Button -->
	{#if !isAddingCard}
		<div class="add-card-btn" on:click={toggleAddCard}>
			<span class="plus-icon">+</span>
			<span>Add a card</span>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<DeleteConfirmModal
		title="Delete Column"
		message="Are you sure you want to delete this column? All cards within this column will be permanently deleted."
		confirmText="Delete Column"
		on:confirm={handleDeleteColumn}
		on:cancel={() => (showDeleteModal = false)}
	/>
{/if}

<style>
	/* Column Base */
	.column {
		display: flex;
		flex-direction: column;
		min-width: 280px;
		max-width: 280px;
		background-color: white;
		border-radius: 8px;
		margin-right: 16px;
		height: fit-content;
		max-height: 100%;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		.column {
			background-color: #1e293b;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		}
	}

	/* Column Header */
	.column-header {
		padding: 12px 16px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #f8fafc;
	}

	@media (prefers-color-scheme: dark) {
		.column-header {
			background-color: #2d3748;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		}
	}

	.title-container {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.title-container:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.column-title {
		font-weight: 600;
		font-size: 16px;
		margin: 0;
		color: #0f172a;
	}

	@media (prefers-color-scheme: dark) {
		.column-title {
			color: #f1f5f9;
		}
	}

	.title-edit {
		flex: 1;
	}

	.title-input {
		width: 100%;
		font-size: 16px;
		font-weight: 600;
		padding: 6px;
		border: 1px solid #3b82f6;
		border-radius: 4px;
		background-color: white;
		color: #0f172a;
	}

	@media (prefers-color-scheme: dark) {
		.title-input {
			background-color: #334155;
			color: #f1f5f9;
			border-color: #60a5fa;
		}
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.column-count {
		background-color: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		border-radius: 16px;
		padding: 1px 8px;
		font-size: 12px;
		font-weight: 500;
	}

	@media (prefers-color-scheme: dark) {
		.column-count {
			background-color: rgba(59, 130, 246, 0.2);
		}
	}

	.edit-button,
	.delete-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 14px;
		padding: 2px;
		opacity: 0.6;
		transition: opacity 0.2s;
		border-radius: 4px;
	}

	.edit-button {
		opacity: 0;
	}

	.title-container:hover .edit-button {
		opacity: 0.6;
	}

	.edit-button:hover,
	.delete-button:hover {
		opacity: 1;
		background-color: rgba(0, 0, 0, 0.05);
	}

	@media (prefers-color-scheme: dark) {
		.edit-button:hover,
		.delete-button:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}
	}

	/* Column Body */
	.column-body {
		padding: 12px;
		flex-grow: 1;
		overflow-y: auto;
		min-height: 50px;
		max-height: calc(100vh - 170px);
		background-color: white;
	}

	@media (prefers-color-scheme: dark) {
		.column-body {
			background-color: #1e293b;
		}
	}

	/* Add Card Form */
	.add-card-form {
		background-color: white;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	@media (prefers-color-scheme: dark) {
		.add-card-form {
			background-color: #2d3748;
		}
	}

	.error-message {
		color: #ef4444;
		font-size: 12px;
		margin-bottom: 8px;
		padding: 4px 8px;
		background-color: rgba(239, 68, 68, 0.1);
		border-radius: 4px;
	}

	.card-textarea {
		width: 100%;
		border: 1px solid #e2e8f0;
		border-radius: 4px;
		padding: 8px;
		font-size: 14px;
		resize: vertical;
		margin-bottom: 8px;
		background-color: white;
		color: #0f172a;
	}

	@media (prefers-color-scheme: dark) {
		.card-textarea {
			background-color: #1e293b;
			border-color: #4b5563;
			color: #f1f5f9;
		}
	}

	.form-actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	/* Add Card Button */
	.add-card-btn {
		padding: 10px 12px;
		margin: 0 12px 12px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		gap: 6px;
		color: #475569;
		font-size: 14px;
		transition:
			background-color 0.2s,
			color 0.2s;
		cursor: pointer;
	}

	.add-card-btn:hover {
		background-color: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	@media (prefers-color-scheme: dark) {
		.add-card-btn {
			color: #94a3b8;
		}

		.add-card-btn:hover {
			background-color: rgba(59, 130, 246, 0.2);
			color: #60a5fa;
		}
	}

	.plus-icon {
		font-size: 18px;
		font-weight: 600;
	}

	/* Buttons */
	.btn {
		padding: 6px 12px;
		font-size: 14px;
		border-radius: 4px;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: background-color 0.2s;
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

	.btn-icon {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		border-radius: 4px;
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.btn-icon:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.btn-icon:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-color-scheme: dark) {
		.btn-icon {
			color: #94a3b8;
		}

		.btn-icon:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}
	}
</style>
