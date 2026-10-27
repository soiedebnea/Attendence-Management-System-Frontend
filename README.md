# Attendance Management System: Frontend

Web app for taking daily attendance, managing students, and viewing reports. Built with **React and Vite**. It talks to the separate `attendance-backend` API.

## Features
- Sign in, with first-run administrator setup
- **Today** dashboard: counts and the list of absent students with guardian phone
- **Mark attendance**: class roster with Present, Absent, Late, Excused and optional notes
- **Students**: add, edit, search (admins can delete)
- **Reports**: attendance summary per student (below 75% highlighted), absence log, CSV download
- Works on phones and desktops

## Requirements
- Node.js 18 or newer
- The backend running (see the backend README)

## Folder structure
```
attendance-frontend/
├── .env                  # your settings (create from .env.example)
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # React entry point
    ├── App.jsx           # layout, navigation, route protection
    ├── api.js            # API calls and token handling
    ├── styles.css
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Students.jsx
        ├── MarkAttendance.jsx
        └── Reports.jsx
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a file named `.env` in this folder (copy `.env.example`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   If your backend uses another port, change it here.
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173`.

Build for production with `npm run build`. The output goes to the `dist/` folder, and `npm run preview` serves it locally.

After changing `.env`, stop the dev server (`Ctrl + C`) and start it again.

## Using the app

1. **Create the admin account.** On a fresh database the first screen asks for your name, email and a password (6 characters or more).
2. **Add students** under *Students*. Give every student a class name such as `Grade 8-A`. Roll numbers must be unique within a class.
3. **Mark attendance.** Pick the date and class. Everyone starts as Present, so change only the exceptions, add notes if needed, and press *Save attendance*. Saving the same date again updates the earlier records.
4. **Check Today** for live counts and absentees.
5. **Open Reports** to pick a date range and class. Switch between the summary and the absence log, or download a CSV.

Attendance percentage counts Late as attended. Percentages below 75% are highlighted. You can change the threshold in `src/pages/Reports.jsx`.

## Troubleshooting
| Problem | Fix |
|---|---|
| `Failed to resolve import "./pages/MarkAttendance.jsx"` | A file name is misspelled or has the wrong case. The five files in `src/pages` must be named exactly `Login.jsx`, `Dashboard.jsx`, `Students.jsx`, `MarkAttendance.jsx` and `Reports.jsx`. `App.jsx` must also start with a capital A. |
| Blank page and `React is not defined` in the console | Vite isn't applying the React plugin. Use the `vite.config.js` below and run `npm install -D @vitejs/plugin-react`. As a fallback, add `import React from 'react';` as the first line of every `.jsx` file in `src`. |
| Login says "Failed to fetch" or a network error | The backend isn't running, or `VITE_API_URL` is wrong. Check that `http://localhost:5000/api/health` opens. |
| A CORS error in the console | `CLIENT_URL` in the backend `.env` must match this app's address (`http://localhost:5173`). |
| Signed out unexpectedly | The login session lasts 7 days. Sign in again. To clear old data, run `localStorage.clear()` in the browser console and refresh. |
| `npm` is blocked in PowerShell | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. |

Working `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

If you copy commands from a guide into PowerShell, paste one line at a time. The `>>` marks PowerShell prints on continued lines are not part of the command.

## Notes
- Never commit `.env` or `node_modules/`.
- To deploy, set `VITE_API_URL` to your live backend address before running `npm run build`, and set `CLIENT_URL` in the backend to your live frontend address.
