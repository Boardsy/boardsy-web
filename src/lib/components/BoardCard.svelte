<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Board } from '$lib/types/models';
	import { formatDistanceToNow } from 'date-fns';
	
	export let board: Board;
	
	function navigateToBoard() {
		goto(`/boards/${board.id}`);
	}
	
	function getInitialColors() {
		if (board.backgroundColor) return board.backgroundColor;
		
		// Default board colors if no custom color is set
		const colors = [
			'#3B82F6', // Blue
			'#10B981', // Green
			'#8B5CF6', // Purple
			'#F59E0B', // Amber
			'#EF4444', // Red
			'#EC4899'  // Pink
		];
		
		// Use the board id to consistently pick the same color
		const index = board.id.charCodeAt(0) % colors.length;
		return colors[index];
	}
	
	$: cardStyle = `background-color: ${getInitialColors()};`;
	$: timeAgo = formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true });
</script>

<div class="board-card" style={cardStyle} on:click={navigateToBoard}>
	<div class="board-card-content">
		<h3 class="board-title">{board.title}</h3>
		{#if board.description}
			<p class="board-description">{board.description}</p>
		{/if}
	</div>
	<div class="board-card-footer">
		<span class="board-updated">Updated {timeAgo}</span>
	</div>
</div>

<style>
	.board-card {
		border-radius: var(--radius-lg);
		overflow: hidden;
		height: 140px;
		color: white;
		position: relative;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	
	.board-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}
	
	.board-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4));
		pointer-events: none;
	}
	
	.board-card-content {
		padding: var(--spacing-md);
		flex-grow: 1;
		position: relative;
	}
	
	.board-title {
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-xs);
		font-size: var(--font-size-lg);
	}
	
	.board-description {
		font-size: var(--font-size-sm);
		opacity: 0.9;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.board-card-footer {
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: rgba(0, 0, 0, 0.2);
		position: relative;
	}
	
	.board-updated {
		font-size: var(--font-size-xs);
		opacity: 0.8;
	}
</style>