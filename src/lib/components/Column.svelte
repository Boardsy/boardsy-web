<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Column, Card } from '$lib/types/models';
	import { createCard } from '$lib/stores/boardStore';
	import CardItem from '$lib/components/CardItem.svelte';
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
</script>

<div class="board-column">
	<div class="column-header">
		<h2 class="column-title">{column.title}</h2>
		<span class="column-count">{column.cards.length}</span>
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
			<CardItem {card} />
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

	.column-title {
		font-weight: var(--font-weight-medium);
		font-size: var(--font-size-md);
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
		min-height: 50px; /* For empty columns */
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
