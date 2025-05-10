export interface Database {
	public: {
		Tables: {
			boards: {
				Row: BoardRow;
				Insert: Omit<BoardRow, 'id' | 'created_at' | 'updated_at'>;
				Update: Partial<Omit<BoardRow, 'id' | 'created_at' | 'updated_at'>>;
			};
			columns: {
				Row: ColumnRow;
				Insert: Omit<ColumnRow, 'id' | 'created_at' | 'updated_at'>;
				Update: Partial<Omit<ColumnRow, 'id' | 'created_at' | 'updated_at'>>;
			};
			cards: {
				Row: CardRow;
				Insert: Omit<CardRow, 'id' | 'created_at' | 'updated_at'>;
				Update: Partial<Omit<CardRow, 'id' | 'created_at' | 'updated_at'>>;
			};
			card_labels: {
				Row: CardLabelRow;
				Insert: Omit<CardLabelRow, 'id'>;
				Update: Partial<Omit<CardLabelRow, 'id'>>;
			};
			labels: {
				Row: LabelRow;
				Insert: Omit<LabelRow, 'id'>;
				Update: Partial<Omit<LabelRow, 'id'>>;
			};
			board_members: {
				Row: BoardMemberRow;
				Insert: Omit<BoardMemberRow, 'id'>;
				Update: Partial<Omit<BoardMemberRow, 'id'>>;
			};
		};
	};
}

export interface BoardRow {
	id: string;
	title: string;
	description: string | null;
	background_color: string | null;
	owner_id: string;
	created_at: string;
	updated_at: string;
}

export interface ColumnRow {
	id: string;
	title: string;
	board_id: string;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface CardRow {
	id: string;
	title: string;
	description: string | null;
	column_id: string;
	position: number;
	due_date: string | null;
	created_by: string;
	assigned_to: string | null;
	created_at: string;
	updated_at: string;
}

export interface LabelRow {
	id: string;
	name: string;
	color: string;
	board_id: string;
}

export interface CardLabelRow {
	id: string;
	card_id: string;
	label_id: string;
}

export interface BoardMemberRow {
	id: string;
	board_id: string;
	user_id: string;
	role: 'owner' | 'editor' | 'viewer';
}
