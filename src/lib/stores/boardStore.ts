import { writable, derived, get } from 'svelte/store';
import type { Board, Column, Card } from '$lib/types/models';
import { supabase } from '$lib/services/supabase';

// Stores
export const boards = writable<Board[]>([]);
export const currentBoard = writable<Board | null>(null);
export const isLoading = writable(false);
export const error = writable<string | null>(null);

// Helper function to convert database data to our model format
const mapBoard = (boardData: any): Board => {
  return {
    id: boardData.id,
    title: boardData.title,
    description: boardData.description,
    backgroundColor: boardData.background_color,
    ownerId: boardData.owner_id,
    createdAt: new Date(boardData.created_at),
    updatedAt: new Date(boardData.updated_at),
    columns: [],
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
    cards: [],
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
    labels: [],
  };
};

// API functions
export const fetchUserBoards = async (userId: string) => {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Fetch boards where user is a member
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
    
    const boardIds = boardMembers.map(bm => bm.board_id);
    
    // Fetch board details
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
    // Fetch board
    const { data: boardData, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();
    
    if (boardError) throw boardError;
    if (!boardData) throw new Error('Board not found');
    
    const board = mapBoard(boardData);
    
    // Fetch columns
    const { data: columnsData, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position');
    
    if (columnsError) throw columnsError;
    
    const columns = columnsData ? columnsData.map(mapColumn) : [];
    
    // Fetch cards for each column
    for (const column of columns) {
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('column_id', column.id)
        .order('position');
      
      if (cardsError) throw cardsError;
      
      column.cards = cardsData ? cardsData.map(mapCard) : [];
      
      // Fetch labels for each card
      for (const card of column.cards) {
        const { data: cardLabels, error: labelsError } = await supabase
          .from('card_labels')
          .select('labels(*)')
          .eq('card_id', card.id);
        
        if (labelsError) throw labelsError;
        
        if (cardLabels) {
          card.labels = cardLabels.map(cl => {
            // Type assertion to help TypeScript understand the structure
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

export const createBoard = async (title: string, description?: string, backgroundColor?: string) => {
  isLoading.set(true);
  error.set(null);
  
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Create board
    const { data: boardData, error: boardError } = await supabase
      .from('boards')
      .insert([
        {
          title,
          description,
          background_color: backgroundColor,
          owner_id: userId
        }
      ])
      .select()
      .single();
    
    if (boardError) throw boardError;
    if (!boardData) throw new Error('Failed to create board');
    
    // Add creator as board member (owner)
    const { error: memberError } = await supabase
      .from('board_members')
      .insert([
        {
          board_id: boardData.id,
          user_id: userId,
          role: 'owner'
        }
      ]);
    
    if (memberError) throw memberError;
    
    // Create default columns
    const defaultColumns = [
      { title: 'To Do', position: 0 },
      { title: 'In Progress', position: 1 },
      { title: 'Done', position: 2 }
    ];
    
    for (const column of defaultColumns) {
      await supabase
        .from('columns')
        .insert([
          {
            title: column.title,
            board_id: boardData.id,
            position: column.position
          }
        ]);
    }
    
    // Refresh boards list
    fetchUserBoards(userId);
    
    return boardData.id;
  } catch (err) {
    console.error('Error creating board:', err);
    error.set('Failed to create board');
    return null;
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
    
    // Get current maximum position in column
    const { data: maxPositionData } = await supabase
      .from('cards')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1);
    
    const newPosition = maxPositionData && maxPositionData.length > 0 
      ? maxPositionData[0].position + 1 
      : 0;
    
    // Insert new card
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
    
    // Refresh current board
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

export const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Update card position
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        column_id: newColumnId,
        position: newPosition
      })
      .eq('id', cardId);
    
    if (updateError) throw updateError;
    
    // Refresh current board
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

// Reorder cards in a column
export const reorderCards = async (columnId: string, cardIds: string[]) => {
  isLoading.set(true);
  error.set(null);
  
  try {
    // Update positions in batches
    for (let i = 0; i < cardIds.length; i++) {
      const { error: updateError } = await supabase
        .from('cards')
        .update({ position: i })
        .eq('id', cardIds[i]);
      
      if (updateError) throw updateError;
    }
    
    // Refresh current board
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