<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, user } from '$lib/stores/userStore';
	import { boards, fetchUserBoards, createBoard, deleteBoard } from '$lib/stores/boardStore';
	import Spinner from '$lib/components/Spinner.svelte';
	import BoardCard from '$lib/components/BoardCard.svelte';
	import CreateBoardModal from '$lib/components/CreateBoardModal.svelte';
	import BoardDeleteModal from '$lib/components/BoardDeleteModal.svelte';
	import EditBoardModal from '$lib/components/EditBoardModal.svelte';
	import type { Board } from '$lib/types/models';

	let isLoading = true;
	let showCreateModal = false;
	let showDeleteModal = false;
	let showEditModal = false;
	let boardToDelete = { id: '', title: '' };
	let boardToEdit: Board | null = null;
	let isDeleting = false;
	let deleteError = '';

	$: if (!$isAuthenticated && !isLoading) {
		goto('/login');
	}

	onMount(async () => {
		if ($isAuthenticated && $user) {
			await fetchUserBoards($user.id);
		}
		isLoading = false;
	});

	function handleCreateBoard() {
		showCreateModal = true;
	}

	function handleCloseModal() {
		showCreateModal = false;
		showEditModal = false;
	}

	async function handleBoardCreated(event: CustomEvent<{ id: string }>) {
		showCreateModal = false;
		goto(`/boards/${event.detail.id}`);
	}
	
	function handleDeleteBoard(event: CustomEvent<{ id: string, title: string }>) {
		boardToDelete = event.detail;
		showDeleteModal = true;
	}
	
	function handleEditBoard(event: CustomEvent<Board>) {
		boardToEdit = event.detail;
		showEditModal = true;
	}
	
	async function handleBoardUpdated() {
		showEditModal = false;
		
		if ($user) {
			await fetchUserBoards($user.id);
		}
		
		boardToEdit = null;
	}
	
	async function confirmDeleteBoard() {
		isDeleting = true;
		deleteError = '';
		
		try {
			await deleteBoard(boardToDelete.id);
			showDeleteModal = false;
			if ($user) {
				await fetchUserBoards($user.id);
			}
		} catch (error) {
			console.error('Error deleting board:', error);
			deleteError = 'Failed to delete board. Please try again.';
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="boards-container">
	<div class="boards-header">
		<h1>Your Boards</h1>
		<button class="btn btn-primary" on:click={handleCreateBoard}>
			<span class="icon">+</span>
			Create Board
		</button>
	</div>

	{#if isLoading}
		<div class="loading-container">
			<Spinner size="large" />
		</div>
	{:else}
		<div class="boards-grid">
			{#if $boards.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg
							width="64"
							height="64"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="4"
								y="4"
								width="16"
								height="16"
								rx="2"
								stroke="currentColor"
								stroke-width="2"
							/>
							<path d="M9 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
							<path d="M9 14H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					</div>
					<h2>No boards yet</h2>
					<p>Create your first board to get started with FlowLine.</p>
					<button class="btn btn-primary" on:click={handleCreateBoard}>
						Create your first board
					</button>
				</div>
			{:else}
				{#each $boards as board (board.id)}
					<BoardCard 
						{board} 
						on:deleteBoard={handleDeleteBoard}
						on:editBoard={handleEditBoard}
					/>
				{/each}
				<div class="board-card create-board-card" on:click={handleCreateBoard}>
					<div class="create-board-content">
						<span class="create-icon">+</span>
						<span>Create new board</span>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if showCreateModal}
	<CreateBoardModal on:close={handleCloseModal} on:boardCreated={handleBoardCreated} />
{/if}

{#if showDeleteModal}
	<BoardDeleteModal 
		boardName={boardToDelete.title}
		on:close={() => showDeleteModal = false}
		on:confirm={confirmDeleteBoard}
	/>
{/if}

{#if showEditModal && boardToEdit}
	<EditBoardModal 
		board={boardToEdit}
		on:close={handleCloseModal}
		on:boardUpdated={handleBoardUpdated}
	/>
{/if}

<style>
	.boards-container {
		padding: var(--spacing-lg);
		max-width: 1280px;
		margin: 0 auto;
	}

	.boards-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.boards-header h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}

	.boards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--spacing-md);
	}

	.empty-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--spacing-2xl) var(--spacing-lg);
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		color: var(--color-text-tertiary);
		margin-bottom: var(--spacing-md);
	}

	.empty-state h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
		max-width: 400px;
	}

	.create-board-card {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-surface);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		height: 140px;
		cursor: pointer;
		transition:
			border-color 0.2s,
			transform 0.2s;
	}

	.create-board-card:hover {
		border-color: var(--color-primary);
		transform: translateY(-4px);
	}

	.create-board-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--color-text-secondary);
	}

	.create-icon {
		font-size: 2rem;
		margin-bottom: var(--spacing-xs);
	}

	.icon {
		margin-right: var(--spacing-xs);
	}

	@media (max-width: 640px) {
		.boards-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.boards-grid {
			grid-template-columns: 1fr;
		}
	}
</style>