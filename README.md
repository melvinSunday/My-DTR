# Daily Time Record (DTR) Web App

A modern, offline-first Daily Time Record web application built with Next.js, Tailwind CSS, and IndexedDB.

## Features

- 📅 **Monthly DTR Generation**: Automatically generates a complete monthly table (1-31 days) based on selected month and year
- ⏰ **Time Tracking**: Track A.M. arrival/departure, P.M. arrival/departure, and overtime hours/minutes
- 🚫 **Weekend Detection**: Automatically detects and disables weekends (Saturday & Sunday)
- 💾 **Offline Storage**: All data is stored locally using IndexedDB for offline functionality
- 📱 **Responsive Design**:
  - Desktop: Clean table view
  - Mobile: Card-based layout for better usability
- 📊 **Export to CSV**: Export monthly DTR data to CSV format
- 🗑️ **Data Management**: Clear all data with confirmation dialog
- 🎨 **Modern UI**: Clean, aesthetically pleasing interface with Tailwind CSS

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Database**: IndexedDB with `idb` library
- **Language**: TypeScript
- **Package Manager**: pnpm

## Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Run the development server**:

   ```bash
   pnpm dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000` (or the port shown in terminal)

## Usage

### Basic Operations

1. **Select Month/Year**: Use the dropdown selectors in the header to choose the desired month and year
2. **Enter Time Data**: Click on any time input field for weekdays to enter arrival/departure times
3. **Add Overtime**: Enter overtime hours and minutes in the respective fields
4. **Auto-Save**: All data is automatically saved to IndexedDB as you type

### Export Data

- Click the **"Export CSV"** button to download the current month's DTR data as a CSV file
- The exported file will be named `DTR_[Month]_[Year].csv`

### Clear Data

- Click the **"Clear Data"** button to remove all DTR entries from all months
- A confirmation dialog will appear to prevent accidental data loss

## Data Structure

Each DTR entry contains:

- Date (YYYY-MM-DD format)
- A.M. Arrival time
- A.M. Departure time
- P.M. Arrival time
- P.M. Departure time
- Overtime hours (0-23)
- Overtime minutes (0-59)
- Weekend flag (automatically set)

## Browser Compatibility

This app works in all modern browsers that support:

- IndexedDB
- ES6+ features
- CSS Grid and Flexbox

## Offline Functionality

The app is fully functional offline:

- All data is stored locally in IndexedDB
- No internet connection required after initial load
- Data persists between browser sessions

## Development

### Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── DTRHeader.tsx       # Header with controls
│   └── DTRTable.tsx        # Main DTR table/cards
└── lib/
    ├── db.ts               # IndexedDB operations
    └── utils.ts            # Utility functions
```

### Key Components

- **DTRHeader**: Month/year selector, export/clear buttons
- **DTRTable**: Responsive table/card view with time inputs
- **Database Layer**: IndexedDB operations with automatic save
- **Utilities**: Date handling, CSV export, weekend detection

## Build for Production

```bash
pnpm build
pnpm start
```

## License

This project is open source and available under the MIT License.
