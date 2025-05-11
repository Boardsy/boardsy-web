import { writable, derived, get } from 'svelte/store';
import type { Board, Column, Card } from '$lib/types/models';
import { supabase } from '$lib/services/supabase';

export const boards = writable<Board[]>([]);
export const currentBoard = writable<Board | null>(null);
export const isLoading = writable(false);
export const error = writable<string | null>(null);

const mapBoard = (boardData: any): Board => {
	return {
		id: boardData.id,
		title: boardData.title,
		description: boardData.description,
		backgroundColor: boardData.background_color,
		ownerId: boardData.owner_id,
		createdAt: new Date(boardData.created_at),
		updatedAt: new Date(boardData.updated_at),
		columns: []
	};
};

const mapColumn = (columnData: any): Column => {
	return {
		id: columnData.id,
		title: columnData.title,
		boardId: columnData.board_id,
		position: columnData.position,
		createdAt: new Date(columnData.created_at),
		updatedAt: new Date(columnData.updated_at),
		cards: []
	};
};

const mapCard = (cardData: any): Card => {
	return {
		id: cardData.id,
		title: cardData.title,
		description: cardData.description,
		columnId: cardData.column_id,
		position: cardData.position,
		dueDate: cardData.due_date ? new Date(cardData.due_date) : undefined,
		createdBy: cardData.created_by,
		assignedTo: cardData.assigned_to,
		createdAt: new Date(cardData.created_at),
		updatedAt: new Date(cardData.updated_at),
		labels: []
	};
};

export const fetchUserBoards = async (userId: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { data: boardMembers, error: memberError } = await supabase
			.from('board_members')
			.select('board_id')
			.eq('user_id', userId);

		if (memberError) throw memberError;

		if (!boardMembers || boardMembers.length === 0) {
			boards.set([]);
			isLoading.set(false);
			return;
		}

		const boardIds = boardMembers.map((bm) => bm.board_id);

		const { data: boardsData, error: boardsError } = await supabase
			.from('boards')
			.select('*')
			.in('id', boardIds);

		if (boardsError) throw boardsError;

		if (boardsData) {
			boards.set(boardsData.map(mapBoard));
		}
	} catch (err) {
		console.error('Error fetching boards:', err);
		error.set('Failed to load boards');
	} finally {
		isLoading.set(false);
	}
};

export const fetchBoardDetails = async (boardId: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { data: boardData, error: boardError } = await supabase
			.from('boards')
			.select('*')
			.eq('id', boardId)
			.single();

		if (boardError) throw boardError;
		if (!boardData) throw new Error('Board not found');

		const board = mapBoard(boardData);

		const { data: columnsData, error: columnsError } = await supabase
			.from('columns')
			.select('*')
			.eq('board_id', boardId)
			.order('position');

		if (columnsError) throw columnsError;

		const columns = columnsData ? columnsData.map(mapColumn) : [];

		for (const column of columns) {
			const { data: cardsData, error: cardsError } = await supabase
				.from('cards')
				.select('*')
				.eq('column_id', column.id)
				.order('position');

			if (cardsError) throw cardsError;

			column.cards = cardsData ? cardsData.map(mapCard) : [];

			for (const card of column.cards) {
				const { data: cardLabels, error: labelsError } = await supabase
					.from('card_labels')
					.select('labels(*)')
					.eq('card_id', card.id);

				if (labelsError) throw labelsError;

				if (cardLabels) {
					card.labels = cardLabels.map((cl) => {
						const labelData = cl.labels as unknown as {
							id: string;
							name: string;
							color: string;
							board_id: string;
						};

						return {
							id: labelData.id,
							name: labelData.name,
							color: labelData.color,
							boardId: labelData.board_id
						};
					});
				}
			}
		}

		board.columns = columns;
		currentBoard.set(board);
	} catch (err) {
		console.error('Error fetching board details:', err);
		error.set('Failed to load board details');
	} finally {
		isLoading.set(false);
	}
};

export const createBoard = async (
	title: string,
	description?: string,
	backgroundColor?: string
) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { data: userData, error: userError } = await supabase.auth.getUser();

		if (userError) {
			throw new Error('User not authenticated: ' + userError.message);
		}

		const userId = userData.user?.id;

		if (!userId) {
			throw new Error('User not authenticated');
		}

		console.log('Creating board with user ID:', userId);

		console.log('Attempting to create board with data:', {
			title,
			description: description || null,
			background_color: backgroundColor || null,
			owner_id: userId
		});

		const { data: boardData, error: boardError } = await supabase
			.from('boards')
			.insert([
				{
					title,
					description: description || null,
					background_color: backgroundColor || null,
					owner_id: userId
				}
			])
			.select();

		if (boardError) {
			console.error('Board creation error:', boardError);
			throw boardError;
		}

		if (!boardData || boardData.length === 0) {
			throw new Error('Failed to create board: No data returned');
		}

		const newBoardId = boardData[0].id;
		console.log('Board created successfully:', boardData[0]);

		const { error: memberError } = await supabase.from('board_members').insert([
			{
				board_id: newBoardId,
				user_id: userId,
				role: 'owner'
			}
		]);

		if (memberError) {
			console.error('Error adding board member:', memberError);
		}

		const defaultColumns = [
			{ title: 'To Do', position: 0 },
			{ title: 'In Progress', position: 1 },
			{ title: 'Done', position: 2 }
		];

		for (const column of defaultColumns) {
			const { error: columnError } = await supabase.from('columns').insert([
				{
					title: column.title,
					board_id: newBoardId,
					position: column.position
				}
			]);

			if (columnError) {
				console.error('Error creating column:', columnError);
			}
		}

		await fetchUserBoards(userId);

		return newBoardId;
	} catch (err: unknown) {
		console.error('Error creating board:', err);
		error.set('Failed to create board: ' + (err instanceof Error ? err.message : 'Unknown error'));
		return null;
	} finally {
		isLoading.set(false);
	}
};

export const deleteBoard = async (boardId: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { data: userData } = await supabase.auth.getUser();
		const userId = userData.user?.id;

		if (!userId) {
			throw new Error('User not authenticated');
		}

		const { data: boardData, error: boardError } = await supabase
			.from('boards')
			.select('owner_id')
			.eq('id', boardId)
			.single();

		if (boardError) {
			throw boardError;
		}

		if (!boardData || boardData.owner_id !== userId) {
			throw new Error('You do not have permission to delete this board');
		}

		const { error: deleteError } = await supabase
			.from('boards')
			.delete()
			.eq('id', boardId);

		if (deleteError) {
			throw deleteError;
		}

		boards.update((currentBoards) => {
			return currentBoards.filter((board) => board.id !== boardId);
		});
		
		currentBoard.set(null);

	} catch (err) {
		console.error('Error deleting board:', err);
		error.set('Failed to delete board');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const createCard = async (columnId: string, title: string, description?: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { data: userData } = await supabase.auth.getUser();
		const userId = userData.user?.id;

		if (!userId) {
			throw new Error('User not authenticated');
		}

		const { data: maxPositionData } = await supabase
			.from('cards')
			.select('position')
			.eq('column_id', columnId)
			.order('position', { ascending: false })
			.limit(1);

		const newPosition =
			maxPositionData && maxPositionData.length > 0 ? maxPositionData[0].position + 1 : 0;

		const { data: cardData, error: cardError } = await supabase
			.from('cards')
			.insert([
				{
					title,
					description,
					column_id: columnId,
					position: newPosition,
					created_by: userId
				}
			])
			.select()
			.single();

		if (cardError) throw cardError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			fetchBoardDetails(boardValue.id);
		}

		return cardData.id;
	} catch (err) {
		console.error('Error creating card:', err);
		error.set('Failed to create card');
		return null;
	} finally {
		isLoading.set(false);
	}
};

export const updateCard = async (cardId: string, updates: { title?: string; description?: string | null }) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { error: updateError } = await supabase
			.from('cards')
			.update(updates)
			.eq('id', cardId);

		if (updateError) throw updateError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			await fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error updating card:', err);
		error.set('Failed to update card');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const deleteCard = async (cardId: string, columnId: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { error: deleteError } = await supabase
			.from('cards')
			.delete()
			.eq('id', cardId);

		if (deleteError) throw deleteError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			await fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error deleting card:', err);
		error.set('Failed to delete card');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { error: updateError } = await supabase
			.from('cards')
			.update({
				column_id: newColumnId,
				position: newPosition
			})
			.eq('id', cardId);

		if (updateError) throw updateError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error moving card:', err);
		error.set('Failed to move card');
	} finally {
		isLoading.set(false);
	}
};

export const reorderCards = async (columnId: string, cardIds: string[]) => {
	isLoading.set(true);
	error.set(null);

	try {
		for (let i = 0; i < cardIds.length; i++) {
			const { error: updateError } = await supabase
				.from('cards')
				.update({ position: i })
				.eq('id', cardIds[i]);

			if (updateError) throw updateError;
		}

		const boardValue = get(currentBoard);
		if (boardValue) {
			fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error reordering cards:', err);
		error.set('Failed to reorder cards');
	} finally {
		isLoading.set(false);
	}
};

export const deleteColumn = async (columnId: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { error: deleteError } = await supabase
			.from('columns')
			.delete()
			.eq('id', columnId);

		if (deleteError) throw deleteError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			await fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error deleting column:', err);
		error.set('Failed to delete column');
		throw err;
	} finally {
		isLoading.set(false);
	}
};

export const updateColumnTitle = async (columnId: string, newTitle: string) => {
	isLoading.set(true);
	error.set(null);

	try {
		const { error: updateError } = await supabase
			.from('columns')
			.update({ title: newTitle })
			.eq('id', columnId);

		if (updateError) throw updateError;

		const boardValue = get(currentBoard);
		if (boardValue) {
			await fetchBoardDetails(boardValue.id);
		}
	} catch (err) {
		console.error('Error updating column title:', err);
		error.set('Failed to update column title');
		throw err;
	} finally {
		isLoading.set(false);
	}
};