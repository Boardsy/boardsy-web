# FlowLine

![Docker Build Status](https://github.com/balionelis/flowline/actions/workflows/docker-build.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

FlowLine is a kanban board application designed to help you organize your work with simplicity and clarity. Built with SvelteKit and Supabase, it offers a clean, intuitive interface for task management and team collaboration.

![FlowLine Banner](static/flowline-banner.png)

## Architecture

FlowLine uses a modern web application architecture:

- **Frontend**: SvelteKit for the UI and client-side logic
- **Backend Services**: Supabase for authentication and data storage
- **Deployment**: Containerized with Docker for easy hosting

## Actual Features

- **Kanban Boards**: Create and organize boards with customizable columns
- **Card Management**: Create, edit, and move cards between columns using drag-and-drop
- **User Authentication**: Secure login, registration, and account management
- **Responsive Design**: Works across desktop and mobile devices
- **Multi-user Support**: Share boards with team members (via Supabase permissions)
- **Docker Deployment**: Easy deployment using Docker and Docker Compose

## Technology Stack

- **Frontend Framework**: SvelteKit
- **UI Components**: Custom components with responsive design
- **Styling**: CSS with variables for theming
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **API Integration**: Supabase client library
- **Deployment**: Docker

## Quick Setup

### 1. Create a Supabase Project

1. Sign up or login at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Supabase URL and anon key from Settings > API

### 2. Set Up the Database

FlowLine requires several tables in your Supabase project. We've made this easy with a setup script:

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a **New Query**
3. Copy and paste the entire contents of the [database-setup.sql](./database-setup.sql) file
4. Click **Run** to create all tables and security policies

That's it! Your database is now ready to use with FlowLine.

### 3. Run the Application

#### Using Docker:

```bash
docker pull blijonas/flowline:latest
docker run -p 3554:3554 \
  -e PUBLIC_SUPABASE_URL=your_supabase_url \
  -e PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  blijonas/flowline:latest
```

#### Or run locally:

```bash
# Clone the repository
git clone https://github.com/balionelis/flowline.git
cd flowline

# Install dependencies
npm install

# Create .env file with your Supabase credentials
echo "PUBLIC_SUPABASE_URL=your_supabase_url" > .env
echo "PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env

# Start the development server
npm run dev
```

Visit http://localhost:5173 (for local dev) or http://localhost:3554 (for Docker) in your browser.

## Detailed Setup Guide

### Database Structure

FlowLine uses the following tables:

| Table | Purpose |
|-------|---------|
| `boards` | Stores board information (title, description, owner) |
| `columns` | Contains columns for each board (title, position) |
| `cards` | Stores card details (title, description, position, due date) |
| `labels` | Defines labels that can be applied to cards |
| `card_labels` | Junction table connecting cards to labels |
| `board_members` | Manages sharing and permissions for boards |

The database setup script automatically:
- Creates all required tables
- Sets up relationships between tables
- Adds Row Level Security (RLS) policies for data protection
- Creates triggers to automatically update timestamps
- Enables proper access control based on user authentication

### Supabase Configuration

For optimal security, the database setup script configures Row Level Security (RLS) to ensure:

- Users can only see boards they own or are members of
- Data is properly isolated between different users
- Proper authorization checks for all operations

## Deployment Options

### Docker Compose

Use the provided `docker-compose.yml` file for an easy deployment:

```bash
# Create a .env file with your Supabase credentials first
docker-compose up -d
```

### Manual Deployment

Build the application:

```bash
npm run build
```

The built application will be in the `build` directory, which you can then serve with the Node.js adapter.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.