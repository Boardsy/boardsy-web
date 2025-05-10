<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/stores/userStore';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated) {
			goto('/boards');
		}
	});
</script>

<div class="home-container">
	<section class="hero">
		<div class="container">
			<div class="hero-content">
				<h1>FlowLine - Organize Anything</h1>
				<p>
					An open-source, self-hosted kanban board application to move your work forward with
					simplicity and clarity.
				</p>
				<div class="hero-buttons">
					<a href="/register" class="btn btn-primary btn-lg">Get Started</a>
					<a href="/login" class="btn btn-outlined btn-lg">Log In</a>
				</div>
			</div>
			<div class="hero-image">
				<img src="/hero-image.svg" alt="FlowLine board visualization" />
			</div>
		</div>
	</section>

	<section class="features">
		<div class="container">
			<h2>Features</h2>
			<div class="feature-grid">
				<div class="feature-card">
					<div class="feature-icon">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								x="4"
								y="4"
								width="6"
								height="6"
								rx="1"
								stroke="currentColor"
								stroke-width="2"
							/>
							<rect
								x="4"
								y="14"
								width="6"
								height="6"
								rx="1"
								stroke="currentColor"
								stroke-width="2"
							/>
							<rect
								x="14"
								y="4"
								width="6"
								height="6"
								rx="1"
								stroke="currentColor"
								stroke-width="2"
							/>
							<rect
								x="14"
								y="14"
								width="6"
								height="6"
								rx="1"
								stroke="currentColor"
								stroke-width="2"
							/>
						</svg>
					</div>
					<h3>Flexible organization</h3>
					<p>Build boards to track anything with anyone, from simple to complex workflows.</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M12 4V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
							<path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					</div>
					<h3>Offline support</h3>
					<p>
						Keep working even without an internet connection. Changes sync when you're back online.
					</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M18 9L12 15L6 9"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<h3>Cross-platform</h3>
					<p>Use FlowLine on the web, desktop, and mobile devices - your data syncs everywhere.</p>
				</div>
			</div>
		</div>
	</section>

	<section class="open-source">
		<div class="container">
			<h2>100% Open Source</h2>
			<p>
				FlowLine is completely open source and self-hosted. You own your data and control your
				instance.
			</p>
			<div class="open-source-features">
				<div class="open-source-feature">
					<h3>Self-hosted</h3>
					<p>
						Host FlowLine on your own server or deploy it to any platform that supports SvelteKit.
					</p>
				</div>
				<div class="open-source-feature">
					<h3>Own Your Data</h3>
					<p>
						All your data stays on your infrastructure. No tracking, no analytics, no third parties.
					</p>
				</div>
				<div class="open-source-feature">
					<h3>Customize It</h3>
					<p>Modify the code to fit your exact needs. Add features or customize the appearance.</p>
				</div>
			</div>
			<div class="github-link">
				<a
					href="https://github.com/Balionelis/Flowline"
					class="btn btn-outlined"
					target="_blank"
					rel="noopener noreferrer"
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 4.312 2.798 7.969 6.698 9.257.49.09.67-.213.67-.475 0-.237-.01-1.017-.014-1.845-2.728.591-3.307-1.16-3.307-1.16-.446-1.133-1.086-1.433-1.086-1.433-.89-.608.067-.595.067-.595.984.069 1.5 1.01 1.5 1.01.874 1.5 2.294 1.067 2.853.815.09-.633.342-1.067.621-1.313-2.17-.244-4.447-1.085-4.447-4.83 0-1.067.381-1.941 1.01-2.625-.101-.248-.438-1.245.095-2.594 0 0 .823-.263 2.696 1.005.783-.218 1.624-.328 2.459-.332.835.004 1.676.114 2.46.332 1.87-1.268 2.693-1.005 2.693-1.005.535 1.35.198 2.347.097 2.594.628.684 1.01 1.558 1.01 2.625 0 3.752-2.28 4.583-4.46 4.823.353.304.668.903.668 1.82 0 1.314-.012 2.373-.012 2.697 0 .264.177.57.675.473 3.895-1.29 6.69-4.944 6.69-9.255 0-5.385-4.365-9.75-9.75-9.75z"
							fill="currentColor"
						/>
					</svg>
					View on GitHub
				</a>
			</div>
		</div>
	</section>

	<section class="get-started">
		<div class="container">
			<h2>Ready to get started?</h2>
			<p>Set up your own FlowLine instance or try out the demo.</p>
			<div class="get-started-buttons">
				<a href="/register" class="btn btn-primary btn-lg">Create Account</a>
				<a
					href="https://github.com/yourusername/flowline#installation"
					class="btn btn-outlined btn-lg"
					target="_blank"
					rel="noopener noreferrer">Installation Guide</a
				>
			</div>
		</div>
	</section>

	<footer>
		<div class="container">
			<div class="footer-content">
				<div class="footer-logo">
					<img src="/logo.svg" alt="FlowLine Logo" width="32" height="32" />
					<span>FlowLine</span>
				</div>
				<div class="footer-links">
					<div class="footer-links-column">
						<h4>Project</h4>
						<ul>
							<li>
								<a
									href="https://github.com/yourusername/flowline"
									target="_blank"
									rel="noopener noreferrer">GitHub</a
								>
							</li>
							<li>
								<a
									href="https://github.com/yourusername/flowline/issues"
									target="_blank"
									rel="noopener noreferrer">Issues</a
								>
							</li>
							<li>
								<a
									href="https://github.com/yourusername/flowline/blob/main/CONTRIBUTING.md"
									target="_blank"
									rel="noopener noreferrer">Contributing</a
								>
							</li>
						</ul>
					</div>
					<div class="footer-links-column">
						<h4>Resources</h4>
						<ul>
							<li>
								<a
									href="https://github.com/yourusername/flowline/wiki"
									target="_blank"
									rel="noopener noreferrer">Documentation</a
								>
							</li>
							<li>
								<a
									href="https://github.com/yourusername/flowline/blob/main/SELF-HOSTING.md"
									target="_blank"
									rel="noopener noreferrer">Self-Hosting Guide</a
								>
							</li>
							<li>
								<a
									href="https://github.com/yourusername/flowline/discussions"
									target="_blank"
									rel="noopener noreferrer">Community</a
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="footer-bottom">
				<p>&copy; {new Date().getFullYear()} FlowLine. Open source under MIT License.</p>
				<div class="footer-legal">
					<a
						href="https://github.com/yourusername/flowline/blob/main/LICENSE"
						target="_blank"
						rel="noopener noreferrer">MIT License</a
					>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	.home-container {
		overflow-y: auto;
		height: 100%;
	}

	.hero {
		padding: var(--spacing-2xl) 0;
		background-color: var(--color-bg);
	}

	.hero .container {
		display: flex;
		align-items: center;
		gap: var(--spacing-2xl);
	}

	.hero-content {
		flex: 1;
	}

	.hero-image {
		flex: 1;
		display: none;
	}

	.hero h1 {
		font-size: 2.5rem;
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}

	.hero p {
		font-size: var(--font-size-xl);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
		max-width: 500px;
	}

	.hero-buttons {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.features {
		padding: var(--spacing-2xl) 0;
		background-color: var(--color-surface);
	}

	.features h2 {
		text-align: center;
		margin-bottom: var(--spacing-xl);
		font-size: 2rem;
		font-weight: var(--font-weight-bold);
	}

	.feature-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-lg);
	}

	.feature-card {
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		background-color: var(--color-bg);
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.3s,
			box-shadow 0.3s;
	}

	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: var(--shadow-md);
	}

	.feature-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: var(--radius-md);
		background-color: var(--color-primary-light);
		color: var(--color-primary-dark);
		margin-bottom: var(--spacing-md);
	}

	.feature-card h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-sm);
	}

	.feature-card p {
		color: var(--color-text-secondary);
	}

	.open-source {
		padding: var(--spacing-2xl) 0;
		background-color: var(--color-bg);
	}

	.open-source h2 {
		text-align: center;
		margin-bottom: var(--spacing-sm);
		font-size: 2rem;
		font-weight: var(--font-weight-bold);
	}

	.open-source > .container > p {
		text-align: center;
		max-width: 600px;
		margin: 0 auto var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.open-source-features {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.open-source-feature {
		padding: var(--spacing-lg);
		background-color: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.open-source-feature h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-sm);
		color: var(--color-primary);
	}

	.github-link {
		display: flex;
		justify-content: center;
	}

	.github-link .btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.get-started {
		padding: var(--spacing-2xl) 0;
		background-color: var(--color-primary);
		color: white;
		text-align: center;
	}

	.get-started h2 {
		font-size: 2rem;
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--spacing-sm);
	}

	.get-started p {
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-lg);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.get-started-buttons {
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.get-started .btn-primary {
		background-color: white;
		color: var(--color-primary);
	}

	.get-started .btn-primary:hover {
		background-color: rgba(255, 255, 255, 0.9);
	}

	.get-started .btn-outlined {
		border-color: white;
		color: white;
	}

	.get-started .btn-outlined:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	footer {
		background-color: var(--color-bg);
		padding: var(--spacing-xl) 0;
		border-top: 1px solid var(--color-border);
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
		margin-bottom: var(--spacing-xl);
	}

	.footer-logo {
		display: flex;
		align-items: center;
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		font-size: var(--font-size-lg);
	}

	.footer-logo img {
		margin-right: var(--spacing-xs);
	}

	.footer-links {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--spacing-lg);
	}

	.footer-links-column h4 {
		font-weight: var(--font-weight-medium);
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}

	.footer-links-column ul {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.footer-links-column a {
		color: var(--color-text-secondary);
		transition: color 0.2s;
	}

	.footer-links-column a:hover {
		color: var(--color-primary);
	}

	.footer-bottom {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.footer-legal {
		display: flex;
		gap: var(--spacing-md);
	}

	.footer-legal a {
		color: var(--color-text-secondary);
		transition: color 0.2s;
	}

	.footer-legal a:hover {
		color: var(--color-primary);
	}

	@media (min-width: 768px) {
		.hero .container {
			flex-direction: row;
		}

		.hero-image {
			display: block;
		}

		.feature-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.open-source-features {
			grid-template-columns: repeat(3, 1fr);
		}

		.footer-content {
			flex-direction: row;
			justify-content: space-between;
		}

		.footer-bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
