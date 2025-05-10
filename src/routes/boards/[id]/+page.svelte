<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/userStore';
	import { currentBoard, fetchBoardDetails, createCard, moveCard, reorderCards } from '$lib/stores/boardStore';
	import Spinner from '$lib/components/Spinner.svelte';
	import Column from '$lib/components/Column.svelte';
	import AddColumnButton from '$lib/components/AddColumnButton.svelte';
	import { dndzone } from 'svelte-dnd-action';
	
	let isLoading = true;
	let errorMessage: string | null = null;
	
	// Get board ID from URL
	$: boardId = $page.params.id;
	
	// Redirect if not authenticated
	$: if (!$isAuthenticated && !isLoading) {
		goto('/login');
	}
	
	onMount(async () => {
		if (!boardId) {
			errorMessage = 'Invalid board ID';
			isLoading = false;
			return;
		}
		
		try {
			await fetchBoardDetails(boardId);
		} catch (error) {
			console.error('Error loading board:', error);
			errorMessage = 'Failed to load board';
		} finally {
			isLoading = false;
		}
	});
	
	function handleCardMove(event: CustomEvent<{ cardId: string; columnId: string; position: number }>) {
		const { cardId, columnId, position } = event.detail;
		moveCard(cardId, columnId, position);
	}
	
	function handleCardReorder(event: CustomEvent<{ columnId: string; cardIds: string[] }>) {
		const { columnId, cardIds } = event.detail;
		reorderCards(columnId, cardIds);
	}
</script>

<div class="board-page">
	{#if isLoading}
		<div class="loading-container">
			<Spinner size="large" />
		</div>
	{:else if errorMessage}
		<div class="error-container">
			<div class="error-message">
				<h2>Error</h2>
				<p>{errorMessage}</p>
				<a href="/boards" class="btn btn-primary">Go back to boards</a>
			</div>
		</div>
	{:else if $currentBoard}
		<div class="board-header" style={$currentBoard.backgroundColor ? `background-color: ${$currentBoard.backgroundColor}` : ''}>
			<div class="board-header-content">
				<h1>{$currentBoard.title}</h1>
				{#if $currentBoard.description}
					<p>{$currentBoard.description}</p>
				{/if}
			</div>
		</div>
		
		<div class="board-container">
			<div class="board-wrapper">
				{#each $currentBoard.columns as column (column.id)}
					<Column 
						{column} 
						on:cardMove={handleCardMove}
						on:cardReorder={handleCardReorder}
					/>
				{/each}
				
				<AddColumnButton boardId={$currentBoard.id} />
			</div>
		</div>
	{:else}
		<div class="error-container">
			<div class="error-message">
				<h2>Board not found</h2>
				<p>The board you're looking for doesn't exist or you don't have access to it.</p>
				<a href="/boards" class="btn btn-primary">Go back to boards</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.board-page {
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.loading-container,
	.error-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.error-message {
		text-align: center;
		background-color: var(--color-surface);
		padding: var(--spacing-xl);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		max-width: 400px;
	}
	
	.error-message h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-md);
		color: var(--color-error);
	}
	
	.error-message p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}
	
	.board-header {
		background-color: var(--color-primary);
		color: white;
		position: relative;
		z-index: 1;
	}
	
	.board-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3));
		z-index: -1;
	}
	
	.board-header-content {
		padding: var(--spacing-lg);
		max-width: 1280px;
		margin: 0 auto;
	}
	
	.board-header h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-xs);
	}
	
	.board-header p {
		font-size: var(--font-size-md);
		opacity: 0.9;
	}
	
	.board-container {
		flex: 1;
		overflow-x: auto;
		padding: var(--spacing-md);
	}
	
	.board-wrapper {
		display: flex;
		height: 100%;
	}
</style>