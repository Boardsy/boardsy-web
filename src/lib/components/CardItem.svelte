<script lang="ts">
	import { createEventDispatcher, onMount, tick } from 'svelte';
	import type { Card } from '$lib/types/models';
	import { format } from 'date-fns';
	import { deleteCard, updateCard } from '$lib/stores/boardStore';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';

	export let card: Card;
	export let columnId: string;

	const dispatch = createEventDispatcher();

	let isEditing = false;
	let editedTitle = card.title;
	let editedDescription = card.description || '';
	let showDeleteModal = false;
	let showCardMenu = false;
	let cardActionsRef: HTMLDivElement;

	$: formattedDueDate = card.dueDate ? format(new Date(card.dueDate), 'MMM d, yyyy') : null;
	$: isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() : false;
	
	function startEditing() {
		editedTitle = card.title;
		editedDescription = card.description || '';
		isEditing = true;
		showCardMenu = false;
		
		setTimeout(() => {
			const titleInput = document.getElementById(`card-title-${card.id}`);
			if (titleInput) titleInput.focus();
		}, 0);
	}
	
	async function saveChanges() {
		if (editedTitle.trim()) {
			try {
				await updateCard(card.id, {
					title: editedTitle.trim(),
					description: editedDescription.trim() || null
				});
				isEditing = false;
			} catch (error) {
				console.error('Error updating card:', error);
			}
		} else {
			editedTitle = card.title;
			editedDescription = card.description || '';
		}
	}
	
	function cancelEditing() {
		editedTitle = card.title;
		editedDescription = card.description || '';
		isEditing = false;
	}
	
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault();
			saveChanges();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			cancelEditing();
		}
	}
	
	function confirmDeleteCard() {
		showCardMenu = false;
		showDeleteModal = true;
	}
	
	async function handleDeleteCard() {
		try {
			await deleteCard(card.id, columnId);
			showDeleteModal = false;
		} catch (error) {
			console.error('Error deleting card:', error);
		}
	}
	
	function toggleCardMenu(event: MouseEvent) {
		event.stopPropagation();
		showCardMenu = !showCardMenu;
		
		if (showCardMenu) {
			setTimeout(() => {
				const closeMenuHandler = (e: MouseEvent) => {
					const target = e.target as HTMLElement;
					if (!target.closest('.card-menu') && !target.closest('.card-menu-button')) {
						showCardMenu = false;
						document.removeEventListener('click', closeMenuHandler);
					}
				};
				document.addEventListener('click', closeMenuHandler);
			}, 0);
		}
	}

	function handleCardClick() {
		if (!isEditing) {
			startEditing();
		}
	}
</script>

<div class="task-card override-border" on:dblclick={handleCardClick} role="button" tabindex="0" style="border-left: none !important;">
	{#if isEditing}
		<div class="card-edit-form">
			<input 
				id="card-title-{card.id}"
				type="text" 
				class="card-edit-title"
				bind:value={editedTitle}
				placeholder="Enter card title"
				on:keydown={handleKeyPress}
			/>
			
			<textarea
				class="card-edit-description"
				bind:value={editedDescription}
				placeholder="Add a description (optional)"
				rows="3"
				on:keydown={handleKeyPress}
			></textarea>
			
			<div class="card-edit-actions">
				<button class="btn btn-primary btn-sm" on:click={saveChanges}>Save</button>
				<button class="btn btn-outlined btn-sm" on:click={cancelEditing}>Cancel</button>
			</div>
			<p class="card-edit-hint">Press Ctrl+Enter to save or Esc to cancel</p>
		</div>
	{:else}
		<div class="card-header">
			{#if card.labels && card.labels.length > 0}
				<div class="task-labels">
					{#each card.labels as label}
						<div class="task-label" style={`background-color: ${label.color}`}>
							{label.name}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<h3 class="task-card-title">{card.title}</h3>

		{#if card.description}
			<p class="task-card-description">{card.description}</p>
		{/if}

		<div class="task-card-footer">
			{#if formattedDueDate}
				<div class="due-date" class:overdue={isOverdue}>
					<span class="icon">🗓️</span>
					{formattedDueDate}
				</div>
			{/if}

			{#if card.assignedTo}
				<div class="assigned-to">
					<div class="avatar-small">
						{card.assignedTo.charAt(0).toUpperCase()}
					</div>
				</div>
			{/if}
		</div>
		
		<div class="card-actions" bind:this={cardActionsRef}>
			<button class="card-menu-button" on:click={toggleCardMenu} aria-label="Card menu">⋮</button>
			
			{#if showCardMenu}
				<div class="card-menu">
					<button class="menu-item" on:click|stopPropagation={startEditing}>
						<span class="menu-icon">✏️</span>Edit
					</button>
					<button class="menu-item menu-item-danger" on:click|stopPropagation={confirmDeleteCard}>
						<span class="menu-icon">🗑️</span>Delete
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showDeleteModal}
	<DeleteConfirmModal 
		title="Delete Card" 
		message="Are you sure you want to delete this card? This action cannot be undone."
		confirmText="Delete Card"
		on:confirm={handleDeleteCard}
		on:cancel={() => showDeleteModal = false}
	/>
{/if}

<style>
	.task-card {
		background-color: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
		box-shadow: var(--shadow-sm);
		position: relative;
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
	}

	/* Class specifically to override any border styles */
	.override-border {
		border: none !important;
		border-left: none !important;
		border-right: none !important;
		border-top: none !important;
		border-bottom: none !important;
	}

	.task-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}
	
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-xs);
	}
	
	.card-actions {
		position: absolute;
		bottom: var(--spacing-xs);
		right: var(--spacing-xs);
	}
	
	.card-menu-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		color: var(--color-text-tertiary);
		padding: 2px 4px;
		border-radius: var(--radius-sm);
		opacity: 0.5;
		transition: all 0.2s;
	}
	
	.task-card:hover .card-menu-button {
		opacity: 1;
	}
	
	.card-menu-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: var(--color-text-primary);
	}
	
	.card-menu {
		position: absolute;
		bottom: 100%;
		right: 0;
		background-color: var(--color-surface);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 100;
		min-width: 150px;
		border: 1px solid var(--color-border);
		overflow: hidden;
		transform: translateY(-4px);
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		padding: var(--spacing-sm) var(--spacing-md);
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.menu-item:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
	
	.menu-item-danger {
		color: var(--color-error);
	}
	
	.menu-item-danger:hover {
		background-color: rgba(239, 68, 68, 0.1);
	}
	
	.menu-icon {
		font-size: 1rem;
	}

	.task-labels {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-xs);
	}

	.task-label {
		font-size: var(--font-size-xs);
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		color: white;
		font-weight: var(--font-weight-medium);
	}

	.task-card-title {
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-xs);
		font-size: var(--font-size-md);
	}

	.task-card-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.task-card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin-bottom: 24px; /* Added space for the menu button */
	}

	.due-date {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.due-date.overdue {
		color: var(--color-error);
	}

	.icon {
		font-size: var(--font-size-sm);
	}

	.avatar-small {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: var(--color-primary-light);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}
	
	.card-edit-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}
	
	.card-edit-title {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-medium);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		width: 100%;
	}
	
	.card-edit-description {
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		width: 100%;
		resize: vertical;
	}
	
	.card-edit-actions {
		display: flex;
		gap: var(--spacing-xs);
	}
	
	.card-edit-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin-top: var(--spacing-xs);
	}
	
	.btn-sm {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
	}
</style>