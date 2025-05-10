<script lang="ts">
	import type { Card } from '$lib/types/models';
	import { format } from 'date-fns';
	
	export let card: Card;
	
	let showCardDetails = false;
	
	function toggleCardDetails() {
		showCardDetails = !showCardDetails;
	}
	
	$: formattedDueDate = card.dueDate 
		? format(new Date(card.dueDate), 'MMM d, yyyy') 
		: null;
		
	$: isOverdue = card.dueDate 
		? new Date(card.dueDate) < new Date() 
		: false;
</script>

<div class="task-card" on:click={toggleCardDetails}>
	{#if card.labels && card.labels.length > 0}
		<div class="task-labels">
			{#each card.labels as label}
				<div class="task-label" style={`background-color: ${label.color}`}>
					{label.name}
				</div>
			{/each}
		</div>
	{/if}
	
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
</div>

<style>
	.task-card {
		background-color: var(--color-surface);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-sm);
		box-shadow: var(--shadow-sm);
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
		border-left: 3px solid var(--color-primary);
	}
	
	.task-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
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
</style>