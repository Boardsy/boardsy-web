<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Card } from '$lib/types/models';
	import { format } from 'date-fns';
	import { deleteCard, updateCard } from '$lib/stores/boardStore';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';

	export let card: Card;
	export let columnId: string;

	let isEditing = false;
	let editedTitle = card.title;
	let editedDescription = card.description || '';
	let showDeleteModal = false;
	let showCardMenu = false;

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
			cancelEditing();
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
				document.addEventListener('click', handleOutsideClick);
			}, 0);
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.card-menu') && !target.closest('.menu-button')) {
			showCardMenu = false;
			document.removeEventListener('click', handleOutsideClick);
		}
	}

	function handleCardClick() {
		if (!isEditing) {
			startEditing();
		}
	}
</script>

{#if isEditing}
	<!-- Edit Mode -->
	<div class="card card-edit">
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
			<button class="btn primary" on:click={saveChanges}>Save</button>
			<button class="btn secondary" on:click={cancelEditing}>Cancel</button>
		</div>
		<p class="hint">Press Ctrl+Enter to save or Esc to cancel</p>
	</div>
{:else}
	<!-- View Mode with drag and drop support -->
	<div class="card" on:dblclick={handleCardClick} role="button" tabindex="0">
		<!-- Labels Section -->
		{#if card.labels && card.labels.length > 0}
			<div class="labels">
				{#each card.labels as label}
					<div class="label" style="background-color: {label.color}">
						{label.name}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Card Content -->
		<h3 class="title">{card.title}</h3>

		{#if card.description}
			<p class="description">{card.description}</p>
		{/if}

		<!-- Card Footer -->
		<div class="footer">
			{#if formattedDueDate}
				<div class="due-date" class:overdue={isOverdue}>
					<span class="icon">🗓️</span>
					<span>{formattedDueDate}</span>
				</div>
			{/if}

			{#if card.assignedTo}
				<div class="assigned">
					<div class="avatar">
						{card.assignedTo.charAt(0).toUpperCase()}
					</div>
				</div>
			{/if}
		</div>

		<!-- Card Actions -->
		<div class="actions">
			<button class="menu-button" on:click={toggleCardMenu} aria-label="Card menu">
				<span class="dots">⋮</span>
			</button>

			{#if showCardMenu}
				<div class="menu card-menu">
					<button class="menu-item" on:click|stopPropagation={startEditing}>
						<span class="menu-icon">✏️</span>
						<span>Edit</span>
					</button>
					<button class="menu-item delete" on:click|stopPropagation={confirmDeleteCard}>
						<span class="menu-icon">🗑️</span>
						<span>Delete</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
	<DeleteConfirmModal
		title="Delete Card"
		message="Are you sure you want to delete this card? This action cannot be undone."
		confirmText="Delete Card"
		on:confirm={handleDeleteCard}
		on:cancel={() => (showDeleteModal = false)}
	/>
{/if}

<style>
	/* Card Base Styles */
	.card {
		background-color: white;
		border-radius: 8px;
		padding: 12px;
		margin-bottom: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		position: relative;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		cursor: pointer;
		border: 1px solid rgba(0, 0, 0, 0.04);
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
	}

	@media (prefers-color-scheme: dark) {
		.card {
			background-color: #2d3748;
		}
	}

	/* Labels */
	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-bottom: 8px;
	}

	.label {
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 4px;
		color: white;
		font-weight: 500;
	}

	/* Card Content */
	.title {
		font-weight: 500;
		margin: 0 0 8px 0;
		font-size: 16px;
		color: var(--color-text-primary);
	}

	.description {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin: 0 0 12px 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Card Footer */
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		color: #9ca3af;
		margin-bottom: 20px; /* Space for the menu button */
	}

	.due-date {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.due-date.overdue {
		color: #ef4444;
	}

	.avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background-color: #60a5fa;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		font-weight: 500;
	}

	/* Card Actions */
	.actions {
		position: absolute;
		bottom: 8px;
		right: 8px;
	}

	.menu-button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		line-height: 1;
		color: #9ca3af;
		padding: 2px 4px;
		border-radius: 4px;
		opacity: 0.6;
		transition: all 0.2s;
	}

	.card:hover .menu-button {
		opacity: 1;
	}

	.menu-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
		color: #4b5563;
	}

	/* Menu */
	.menu {
		position: absolute;
		bottom: 100%;
		right: 0;
		background-color: white;
		border-radius: 6px;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		z-index: 100;
		min-width: 150px;
		border: 1px solid #e5e7eb;
		overflow: hidden;
		transform: translateY(-4px);
	}

	@media (prefers-color-scheme: dark) {
		.menu {
			background-color: #1f2937;
			border-color: #374151;
		}
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		padding: 8px 16px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.menu-item:hover {
		background-color: #f9fafb;
	}

	.menu-item.delete {
		color: #ef4444;
	}

	.menu-item.delete:hover {
		background-color: #fee2e2;
	}

	@media (prefers-color-scheme: dark) {
		.menu-item:hover {
			background-color: #374151;
		}

		.menu-item.delete:hover {
			background-color: rgba(239, 68, 68, 0.2);
		}
	}

	/* Edit Mode */
	.card-edit {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.card-edit-title {
		font-size: 16px;
		font-weight: 500;
		padding: 8px;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		width: 100%;
	}

	.card-edit-description {
		font-size: 14px;
		padding: 8px;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		width: 100%;
		resize: vertical;
	}

	.card-edit-actions {
		display: flex;
		gap: 8px;
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

	.btn.secondary {
		background-color: transparent;
		border: 1px solid #e5e7eb;
	}

	.btn.secondary:hover {
		background-color: #f9fafb;
	}

	.hint {
		font-size: 12px;
		color: #9ca3af;
		margin-top: 4px;
	}

	@media (prefers-color-scheme: dark) {
		.card-edit-title,
		.card-edit-description {
			background-color: #1f2937;
			border-color: #374151;
			color: #f9fafb;
		}

		.btn.secondary {
			border-color: #374151;
			color: #d1d5db;
		}

		.btn.secondary:hover {
			background-color: #374151;
		}

		.description {
			color: #d1d5db;
		}
	}
</style>
