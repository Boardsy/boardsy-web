import { writable } from 'svelte/store';
import type { User } from '$lib/types/models';
import { supabase, getCurrentUser } from '$lib/services/supabase';

export const user = writable<User | null>(null);
export const isLoading = writable(true);
export const isAuthenticated = writable(false);

export const initUserStore = async () => {
	isLoading.set(true);

	try {
		const {
			data: { user: currentUser },
			error
		} = await getCurrentUser();

		if (error) {
			throw error;
		}

		if (currentUser) {
			user.set({
				id: currentUser.id,
				email: currentUser.email || '',
				name: currentUser.user_metadata.name,
				avatarUrl: currentUser.user_metadata.avatar_url
			});
			isAuthenticated.set(true);
		} else {
			user.set(null);
			isAuthenticated.set(false);
		}
	} catch (error) {
		console.error('Error initializing user store:', error);
		user.set(null);
		isAuthenticated.set(false);
	} finally {
		isLoading.set(false);
	}

	supabase.auth.onAuthStateChange((event, session) => {
		if (event === 'SIGNED_IN' && session) {
			const currentUser = session.user;
			user.set({
				id: currentUser.id,
				email: currentUser.email || '',
				name: currentUser.user_metadata.name,
				avatarUrl: currentUser.user_metadata.avatar_url
			});
			isAuthenticated.set(true);
		} else if (event === 'SIGNED_OUT') {
			user.set(null);
			isAuthenticated.set(false);
		}
	});
};
