# Mission Document: Timezone‑Aware Live Session Scheduling

## 1. Overview
The platform must support live‑class sessions that work correctly for participants (students and teachers) across different time zones. The current implementation suffers from a 2‑hour offset because the front‑end `datetime‑local` input is interpreted in the browser’s local time while the backend stores timestamps in UTC.

## 2. Goals
- Store **all** timestamps in **UTC** in the database.
- Convert dates entered by users in the UI to UTC before sending them to the server.
- Preserve the original local time for display to each participant according to their own time zone.
- Ensure the scheduling logic (access window ±10 minutes) works consistently regardless of the participant’s location.

## 3. Scope
| Area | In‑Scope | Out‑of‑Scope |
|------|----------|--------------|
| Backend (Laravel) | Adjust model fields, controller parsing, and token generation to use UTC. | Migration of historic data (handled later). |
| Front‑end (React) | Convert `datetime‑local` values to ISO‑8601 UTC strings before POST. | UI redesign unrelated to scheduling. |
| Testing | Unit & integration tests for timezone conversion, end‑to‑end UI tests. | Load‑testing for massive concurrent sessions. |

## 4. Technical Approach
### 4.1 Backend
1. Ensure the `sessions.start_time` and `sessions.end_time` columns are `datetime` stored in UTC (Laravel defaults to UTC).
2. In `LiveKitController.php`:
   - Parse incoming timestamps with `Carbon::parse($request->input('start'))->timezone('UTC')`.
   - Use the same UTC values when computing the ±10 minute access window.
3. When generating the LiveKit access token, set `setName($participantName)` so the participant label appears correctly.

### 4.2 Front‑end
1. In the form component (`resources/js/Pages/Courses/Show.jsx` or similar):
   - Capture the value from `<input type="datetime-local" ...>`.
   - Create a `Date` object, then call `toISOString()` which yields an UTC string (e.g., `2026‑05‑22T14:30:00.000Z`).
   - Send this string in the request payload.
2. When displaying existing session times, convert the UTC value back to the user’s local zone using `new Date(utcString).toLocaleString()`.

### 4.3 Testing Strategy
- **Unit tests** for the controller’s timezone parsing.
- **React component tests** verifying that the payload sent to the API contains an ISO‑8601 UTC string.
- **End‑to‑end test**: create a session as a user in a known time zone (e.g., Europe/Paris) and verify the scheduled time matches the expected UTC value.

## 5. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Legacy data stored with local offsets | Incorrect schedule for older sessions | Write a migration script that assumes current data is in the server’s default time zone and converts to UTC. |
| Client clocks out of sync | Tokens generated with wrong time window | Use server‑side validation of the access window; rely on server time for the ±10 min check. |
| Different browsers handling of `datetime‑local` | Inconsistent payloads | Normalize on the client side using `Date` object and `toISOString()` as described. |

## 6. Timeline (example)
| Week | Activity |
|------|----------|
| 1 | Backend date‑parsing changes, unit tests |
| 2 | Front‑end conversion logic, component tests |
| 3 | Integration tests, CI pipeline updates |
| 4 | Documentation updates, rollout to staging |

---
*Prepared as a guiding document for the upcoming implementation.*
