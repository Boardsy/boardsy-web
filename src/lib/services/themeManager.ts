export type Theme = 'light' | 'dark' | 'system';

export function initTheme(): Theme {
	if (typeof window === 'undefined') return 'system';

	const savedTheme = localStorage.getItem('theme') as Theme;
	if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
		applyTheme(savedTheme);
		return savedTheme;
	}

	applyTheme('system');
	return 'system';
}

export function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;

	const htmlElement = document.documentElement;

	localStorage.setItem('theme', theme);

	if (theme === 'dark') {
		htmlElement.style.setProperty('color-scheme', 'dark');

		htmlElement.style.setProperty('--color-bg', 'var(--color-bg-dark)');
		htmlElement.style.setProperty('--color-surface', 'var(--color-surface-dark)');
		htmlElement.style.setProperty('--color-border', 'var(--color-border-dark)');
		htmlElement.style.setProperty('--color-text-primary', 'var(--color-text-primary-dark)');
		htmlElement.style.setProperty('--color-text-secondary', 'var(--color-text-secondary-dark)');
		htmlElement.style.setProperty('--color-text-tertiary', 'var(--color-text-tertiary-dark)');

		document.body.classList.add('theme-dark');
		document.body.classList.remove('theme-light');
	} else if (theme === 'light') {
		htmlElement.style.setProperty('color-scheme', 'light');

		htmlElement.style.setProperty('--color-bg', 'var(--color-bg-light)');
		htmlElement.style.setProperty('--color-surface', 'var(--color-surface-light)');
		htmlElement.style.setProperty('--color-border', 'var(--color-border-light)');
		htmlElement.style.setProperty('--color-text-primary', 'var(--color-text-primary-light)');
		htmlElement.style.setProperty('--color-text-secondary', 'var(--color-text-secondary-light)');
		htmlElement.style.setProperty('--color-text-tertiary', 'var(--color-text-tertiary-light)');

		htmlElement.style.setProperty('--force-text-color', 'var(--color-text-primary-light)');

		document.body.classList.add('theme-light');
		document.body.classList.remove('theme-dark');
	} else {
		htmlElement.style.removeProperty('color-scheme');

		htmlElement.style.removeProperty('--color-bg');
		htmlElement.style.removeProperty('--color-surface');
		htmlElement.style.removeProperty('--color-border');
		htmlElement.style.removeProperty('--color-text-primary');
		htmlElement.style.removeProperty('--color-text-secondary');
		htmlElement.style.removeProperty('--color-text-tertiary');
		htmlElement.style.removeProperty('--force-text-color');

		document.body.classList.remove('theme-light');
		document.body.classList.remove('theme-dark');

		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			htmlElement.style.setProperty('color-scheme', 'dark');
			document.body.classList.add('theme-dark');
		} else {
			document.body.classList.add('theme-light');
		}
	}
}

export function setupThemeListener(): () => void {
	if (typeof window === 'undefined') return () => {};

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	const listener = () => {
		const currentTheme = localStorage.getItem('theme') as Theme;
		if (currentTheme === 'system') {
			applyTheme('system');
		}
	};

	mediaQuery.addEventListener('change', listener);

	return () => mediaQuery.removeEventListener('change', listener);
}
