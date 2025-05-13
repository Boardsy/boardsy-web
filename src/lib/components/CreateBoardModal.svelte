<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { createBoard } from '$lib/stores/boardStore';
	import Spinner from '$lib/components/Spinner.svelte';

	const dispatch = createEventDispatcher<{
		close: void;
		boardCreated: { id: string };
	}>();

	let title = '';
	let description = '';
	let selectedColor = '#3B82F6'; // Default to blue
	let isCreating = false;
	let errorMessage = '';
	let colorPickerInput: HTMLInputElement;

	const predefinedColors = [
		{ value: '#3B82F6', name: 'Blue' },
		{ value: '#10B981', name: 'Green' },
		{ value: '#8B5CF6', name: 'Purple' },
		{ value: '#F59E0B', name: 'Amber' },
		{ value: '#EF4444', name: 'Red' },
		{ value: '#EC4899', name: 'Pink' }
	];

	function close() {
		dispatch('close');
	}

	function openColorPicker() {
		if (colorPickerInput) {
			colorPickerInput.click();
		}
	}

	async function handleSubmit() {
		if (!title.trim()) {
			errorMessage = 'Board title is required';
			return;
		}

		isCreating = true;
		errorMessage = '';

		try {
			const boardId = await createBoard(title, description, selectedColor);

			if (boardId) {
				dispatch('boardCreated', { id: boardId });
			} else {
				errorMessage = 'Failed to create board';
			}
		} catch (error) {
			console.error('Error creating board:', error);
			errorMessage = 'An unexpected error occurred';
		} finally {
			isCreating = false;
		}
	}
</script>

<div class="modal-backdrop" on:click={close}>
	<div class="modal-content" on:click|stopPropagation>
		<div class="modal-header">
			<h2>Create new board</h2>
			<button class="close-button" on:click={close} aria-label="Close"> &times; </button>
		</div>

		<form on:submit|preventDefault={handleSubmit}>
			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			<div class="form-group">
				<label for="title" class="form-label">Board title</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					class="form-input"
					placeholder="Enter board title"
					disabled={isCreating}
					required
				/>
			</div>

			<div class="form-group">
				<label for="description" class="form-label">Description (optional)</label>
				<textarea
					id="description"
					bind:value={description}
					class="form-input"
					placeholder="Add a description"
					rows="3"
					disabled={isCreating}
				></textarea>
			</div>

			<div class="form-group">
				<label class="form-label">Background color</label>

				<!-- Hidden color input that's controlled via the rainbow button -->
				<input
					type="color"
					bind:value={selectedColor}
					bind:this={colorPickerInput}
					class="hidden-color-input"
				/>

				<div class="color-options">
					{#each predefinedColors as color}
						<button
							type="button"
							class="color-option"
							class:selected={selectedColor === color.value}
							style={`background-color: ${color.value};`}
							on:click={() => (selectedColor = color.value)}
							disabled={isCreating}
							aria-label={`Select ${color.name}`}
						></button>
					{/each}

					<!-- Rainbow color picker button -->
					<button
						type="button"
						class="color-option rainbow-option"
						on:click={openColorPicker}
						aria-label="Choose custom color"
						title="Choose custom color"
					></button>
				</div>

				<!-- Show the current color value -->
				<div class="color-value-display">
					Current color: <span class="color-code">{selectedColor}</span>
				</div>
			</div>

			<div class="preview-section">
				<label class="form-label">Preview</label>
				<div class="board-preview" style={`background-color: ${selectedColor};`}>
					<div class="preview-content">
						<h3>{title || 'Board Title'}</h3>
						{#if description}
							<p>{description}</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-outlined" on:click={close} disabled={isCreating}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary" disabled={isCreating}>
					{#if isCreating}
						<Spinner size="small" color="white" />
					{:else}
						Create
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal);
		padding: var(--spacing-md);
	}

	.modal-content {
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-header h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
	}

	.close-button {
		font-size: 1.5rem;
		line-height: 1;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-secondary);
	}

	form {
		padding: var(--spacing-lg);
	}

	.error-message {
		background-color: rgba(239, 68, 68, 0.1);
		color: var(--color-error);
		padding: var(--spacing-sm);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.color-options {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		margin-top: var(--spacing-xs);
	}

	.color-option {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		border: 2px solid transparent;
		transition: transform 0.2s;
	}

	.color-option:hover {
		transform: scale(1.1);
	}

	.color-option.selected {
		border-color: var(--color-text-primary);
		transform: scale(1.1);
	}

	.rainbow-option {
		background: linear-gradient(
			to right,
			#ff0000,
			#ff7f00,
			#ffff00,
			#00ff00,
			#0000ff,
			#4b0082,
			#9400d3
		);
		position: relative;
	}

	.rainbow-option::after {
		content: '+';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
		font-weight: bold;
	}

	.hidden-color-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.color-value-display {
		margin-top: var(--spacing-xs);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.color-code {
		font-family: monospace;
		font-weight: var(--font-weight-medium);
	}

	.preview-section {
		margin-top: var(--spacing-lg);
	}

	.board-preview {
		height: 120px;
		border-radius: var(--radius-md);
		margin-top: var(--spacing-xs);
		color: white;
		position: relative;
		overflow: hidden;
	}

	.board-preview::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4));
		pointer-events: none;
	}

	.preview-content {
		padding: var(--spacing-md);
		position: relative;
	}

	.preview-content h3 {
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-xs);
	}

	.preview-content p {
		font-size: var(--font-size-sm);
		opacity: 0.9;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}
</style>
