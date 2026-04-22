# Stony Point DECA Website

**Live site: [stpdeca.netlify.app](https://stpdeca.netlify.app)**

A React + Vite website for the Stony Point DECA chapter. Members can check upcoming events, look up their points, and access competition resources. Officers manage everything through a Google Apps Script backend.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Google Apps Script (calendar, Drive, Sheets)
- **Hosting:** Netlify (via stp-deca GitHub fork, auto-synced from `Ishan-Singhal/stpdecawebsite`)

---

## Project Structure

```
src/
├── components/
│   ├── AdminSettings.tsx     # Admin panel (config management)
│   ├── Contact.tsx           # Advisor info + contact methods
│   ├── Footer.tsx            # Footer with quick links
│   ├── Header.tsx            # Nav + admin login dropdown
│   ├── Hero.tsx              # Landing hero section
│   ├── JoinUs.tsx            # Membership steps
│   ├── PointsTracker.tsx     # Student points lookup
│   ├── Resources.tsx         # Google Drive file browser
│   ├── UpcomingEvents.tsx    # Google Calendar events
│   └── WhyJoinDeca.tsx       # Benefits section
├── lib/
│   └── DECAConfig.ts         # Centralized config fetcher (caches GAS URL)
├── hooks/
│   └── useWebhookConfig.tsx  # Legacy webhook context
└── pages/
    └── Index.tsx             # Page layout + admin section toggle
```

---

## Google Apps Script Integration

The site talks to one deployed Google Apps Script. That script handles:

| Endpoint (`?type=`) | What it returns |
|---|---|
| `events` | Upcoming calendar events (next 30 days) |
| `resources` | Files from the DECA Google Drive folder |
| `points` | All member points from Google Sheets |

**POST actions** (sent as JSON body):
- `get_config` — returns the current script URL and version
- `update_config` — updates the URL (admin password required)
- `test_connection` — health check
- `test_url` — tests a new URL before saving
- `set_admin_password` — changes the admin password stored in the script

### Setting Up the Script

1. Open [Google Apps Script](https://script.google.com) and create a new project
2. Paste the contents of `src/Google Script.txt` into the editor
3. At the top of the script, fill in your IDs:

```javascript
const CALENDAR_ID = 'your-calendar-id@group.calendar.google.com';
const DRIVE_FOLDER_ID = 'your-drive-folder-id';
const POINTS_SHEET_ID = 'your-google-sheet-id';
```

4. Deploy: **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the `/exec` URL
6. Open `src/lib/DECAConfig.ts` and replace `INITIAL_URL` with your URL:

```typescript
private static readonly INITIAL_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

### Google Sheets Format

The points sheet needs these columns in order:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Name | Student ID | Competition Points | Meeting Points | Community Points | Leadership Points | Total Points |

Row 1 is a header row. Data starts at row 2.

### Google Drive Resources

Files in the folder are auto-categorized:
- Names containing `competition`, `contest`, or `prep` → Competition Prep Materials
- Names containing `video`, `training`, or `workshop` → Training Videos
- Everything else → Study Guides & Materials

---

## Admin Access

The admin password lives in `src/components/Header.tsx`:

```typescript
const ADMIN_PASSWORD = "DECAofficer2024";
```

Change this before deploying. When logged in, officers see:
- The **Admin Settings** panel (to update the Google Apps Script URL)
- **Refresh** buttons on Events and Resources sections

The admin panel also lets you change the password stored in the Google Apps Script itself (for the config update action).

---

## Deployment

The site deploys automatically to Netlify via the `stp-deca/stpdecawebsite` GitHub fork. Every push to `main` on `Ishan-Singhal/stpdecawebsite` triggers a GitHub Action that syncs to the fork, which triggers Netlify.

```
Your push → GitHub Action → stp-deca/stpdecawebsite fork → Netlify build
```

The GitHub Action lives at `.github/workflows/sync-fork.yml` and requires a `DECA_SYNC_TOKEN` secret (a personal access token from `Ishan-Singhal` with `repo` and `workflow` scopes, set as a repository secret on the personal repo).

### Build Settings (Netlify)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 18+ |

---

## Customization

### Contact Info

Edit `src/components/Contact.tsx` — the `advisors` array holds names, emails, phones, and office locations.

### Remind Code

Search for `@stpdeca26` across the codebase. It appears in `Contact.tsx`, `JoinUs.tsx`, `Hero.tsx`, and `Footer.tsx`.

### Join Form URL

In `src/components/Hero.tsx` and `src/components/JoinUs.tsx`, update the Google Form links.

### School Calendar Embed

In `src/components/UpcomingEvents.tsx`, the "View Full Calendar" button links to a public Google Calendar embed URL. Replace the `src` parameter with your calendar's embed URL.

---

## Common Issues

**Events not showing up**
- Check that the Google Calendar is shared publicly (or with the script's service account)
- Verify `CALENDAR_ID` in the script matches your calendar
- Click "Refresh Events" in the admin panel

**Points lookup fails**
- Confirm the Sheets ID is correct and the sheet is accessible to the script
- Check that column order matches the format above (A=Name, B=Student ID, etc.)

**Resources not loading**
- Make sure the Drive folder is shared with "Anyone with the link can view"
- Verify `DRIVE_FOLDER_ID` in the script

**Netlify not deploying**
- Check the Actions tab on `Ishan-Singhal/stpdecawebsite` for sync errors
- Verify `DECA_SYNC_TOKEN` is still valid (tokens can expire)

**Admin config update fails**
- The admin password in the Google Apps Script defaults to what was set at deploy time
- Re-deploy the script if you've never set a password via the panel

---

## Development

To run the site locally:

```bash
npm install
npm run dev
```

Open `http://localhost:8080`.
