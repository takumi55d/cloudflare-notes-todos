# Notes & Todos - Cloudflare Pages Application

A modern, full-stack note-taking and todo management application built with Next.js 14, deployed on Cloudflare Pages with D1 database integration.

## Features

- 📝 **Note Management**: Create, edit, view, and delete notes with a rich text editor
- ✅ **Todo Lists**: Manage tasks with completion tracking
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS and shadcn/ui components
- ⚡ **Edge Runtime**: Fast performance with Cloudflare Pages Functions
- 📱 **Responsive**: Mobile-friendly interface
- 🔒 **Secure**: Built-in security with Cloudflare infrastructure
- 📊 **Database**: Persistent data storage with Cloudflare D1 SQLite

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Cloudflare Pages Functions (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Deployment**: Cloudflare Pages
- **Icons**: Lucide React

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (dashboard)
│   ├── notes/[id]/        # Individual note page
│   └── todos/             # Todo management page
├── pages/api/             # API routes (Cloudflare Functions)
│   ├── notes/             # Notes CRUD operations
│   └── todos/             # Todos CRUD operations
├── lib/                   # Utility functions
│   ├── db.ts             # Database helpers
│   ├── api.ts            # API client functions
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
├── components/ui/         # UI components (shadcn/ui)
├── schema.sql            # Database schema
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account
- Wrangler CLI

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 3. Authenticate with Cloudflare

```bash
wrangler auth login
```

### 4. Create D1 Database

```bash
wrangler d1 create notes-db
```

This will output a database ID. Update the `wrangler.toml` file with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "notes-db"
database_id = "your-database-id-here"
```

### 5. Initialize Database Schema

For local development:
```bash
npm run db:generate
```

For production:
```bash
npm run db:generate:remote
```

### 6. Development

Start the local development server:
```bash
npm run dev
```

To test with Cloudflare Pages locally:
```bash
npm run preview
```

## API Endpoints

### Notes API
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Todos API
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/[id]` - Get specific todo
- `PUT /api/todos/[id]` - Update todo (task and/or completion status)
- `DELETE /api/todos/[id]` - Delete todo

## Database Schema

The application uses two main tables:

### Notes Table
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table
```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Deploy to Cloudflare Pages

1. Build the application:
```bash
npm run pages:build
```

2. Deploy to Cloudflare Pages:
```bash
npm run deploy
```

### Alternative: Connect GitHub Repository

1. Push your code to GitHub
2. Go to Cloudflare Dashboard > Pages
3. Connect your repository
4. Set build command: `npm run pages:build`
5. Set output directory: `.vercel/output/static`
6. Add environment variable bindings for D1 database

### Environment Setup

Make sure to:
1. Bind your D1 database in Cloudflare Pages settings
2. Run the production database migration:
   ```bash
   npm run db:generate:remote
   ```

## Features Overview

### Dashboard
- Overview of recent notes and todos
- Quick stats and progress tracking
- Tabbed interface for easy navigation

### Notes Management
- Create rich-text notes with titles and content
- Edit existing notes with auto-save indicators
- Delete notes with confirmation
- Responsive card-based layout
- Search and filter capabilities

### Todo Management
- Create and manage tasks
- Mark todos as complete/incomplete
- Edit tasks inline
- Visual separation of pending/completed tasks
- Bulk operations support

### UI/UX Features
- Dark/light mode support
- Responsive design for all devices
- Loading states and error handling
- Toast notifications for user feedback
- Keyboard shortcuts (Ctrl+S for save)

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run preview` - Preview with Cloudflare Pages locally
- `npm run deploy` - Deploy to Cloudflare Pages
- `npm run db:generate` - Initialize local database
- `npm run db:generate:remote` - Initialize production database

## Troubleshooting

### Common Issues

1. **Database binding not found**
   - Ensure D1 database is properly configured in `wrangler.toml`
   - Verify the database ID matches your created database

2. **API routes not working**
   - Check that files are in the `pages/api/` directory
   - Ensure `runtime = 'edge'` is set for each API route

3. **Build errors**
   - Run `npm run pages:build` to check for build issues
   - Ensure all dependencies are properly installed

### Performance Tips

- The application uses edge runtime for optimal performance
- D1 database provides low-latency data access
- Static assets are served via Cloudflare CDN
- API routes are optimized for serverless execution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run preview`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).