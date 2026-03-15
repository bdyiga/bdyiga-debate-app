# Privacy Policy — LD Debate Tournament Manager

## Ballot Privacy

This application enforces strict ballot privacy at both the API and UI levels:

### What Students Can See
- Students can **only** view ballots for pairings in which they participated (as either the affirmative or negative debater).
- The API endpoint `/api/ballots` filters results server-side based on the authenticated student's ID, ensuring no ballot data from other students' pairings is ever sent to the client.
- The student dashboard shows judge comments, speaker points, and win/loss results exclusively for the student's own rounds.

### What Students Cannot See
- Ballots from pairings they did not participate in.
- Other students' speaker points or judge feedback.
- Internal manager notes (if any).

### What Judges Can See
- Judges can only see pairings they are assigned to and ballots they submitted.

### What Managers Can See
- Managers have full visibility into all tournaments, rounds, pairings, and ballots.
- Managers can export all ballot data to CSV.

## How a Manager Can Redact Information

If a manager needs to redact judge comments or other sensitive information from a ballot:

1. **Direct Database Edit**: Connect to the SQLite database and update the `Ballot` record:
   ```bash
   npx prisma studio
   ```
   This opens a visual database editor. Navigate to the `Ballot` table, find the relevant record, and clear or edit the `comments` field.

2. **API-Level Redaction**: A manager could extend the `/api/ballots` endpoint to support PATCH/PUT operations for editing ballot comments. This is not included in the MVP but is straightforward to add.

3. **Delete and Re-submit**: As a last resort, delete the ballot record via Prisma Studio and have the judge re-submit with corrected information.

## Data Storage

- All data is stored locally in a SQLite database file (`prisma/dev.db`).
- No data is sent to external services or cloud providers.
- Passwords are hashed with bcrypt before storage.
- Sessions are encrypted using iron-session with a server-side secret.

## Recommendations for Production

- Change the `SESSION_SECRET` in `.env` to a strong, unique value.
- Consider adding rate limiting to auth endpoints.
- Add HTTPS if deploying beyond localhost.
- Implement audit logging for ballot submissions and edits.
