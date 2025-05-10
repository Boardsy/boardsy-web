// User types
export interface User {
	id: string;
	email: string;
	name?: string;
	avatarUrl?: string;
}

// Board types
export interface Board {
	id: string;
	title: string;
	description?: string;
	backgroundColor?: string;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
	columns: Column[];
}

export interface Column {
	id: string;
	title: string;
	boardId: string;
	position: number;
	createdAt: Date;
	updatedAt: Date;
	cards: Card[];
}

export interface Card {
	id: string;
	title: string;
	description?: string;
	columnId: string;
	position: number;
	dueDate?: Date;
	createdBy: string;
	assignedTo?: string;
	createdAt: Date;
	updatedAt: Date;
	labels: Label[];
}

export interface Label {
	id: string;
	name: string;
	color: string;
	boardId: string;
}

export interface BoardMember {
	id: string;
	boardId: string;
	userId: string;
	role: 'owner' | 'editor' | 'viewer';
	user?: User;
}

// Form types
export interface LoginForm {
	email: string;
	password: string;
}

export interface RegisterForm {
	email: string;
	password: string;
	confirmPassword: string;
	name?: string;
}

export interface BoardForm {
	title: string;
	description?: string;
	backgroundColor?: string;
}

export interface ColumnForm {
	title: string;
	boardId: string;
}

export interface CardForm {
	title: string;
	description?: string;
	columnId: string;
	dueDate?: Date;
	assignedTo?: string;
}

export interface LabelForm {
	name: string;
	color: string;
	boardId: string;
}
