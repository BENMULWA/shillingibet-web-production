
# Jackpot Dashboard Implementation

This document describes how to implement the user-facing Jackpot feature on the dashboard.

The admin dashboard is handled separately, so this spec only covers the logged-in player experience.

## Goal

Add a Jackpot section to the dashboard where a user can:

1. View the active draw.
2. Select 7 match picks.
3. Place a bet.
4. See recent settled results.
5. View draw winners.
6. Track their own bet history.
7. Open a single bet for full detail.

## Suggested Routes

- `/jackpot`
- `/jackpot/results`
- `/jackpot/results/:drawId`
- `/jackpot/my-bets`
- `/jackpot/my-bets/:betId`

## Suggested Sidebar Entry

Add a Jackpot item in the authenticated sidebar so users can reach the feature quickly.

Recommended label:

- `Jackpot`

Recommended icon:

- trophy or medal icon

Suggested placement:

- near `Sports`
- before or after `Aviator`

## API Endpoints

Use these user endpoints from the Jackpot API:

- `GET /jackpot/active`
- `POST /jackpot/bet`
- `GET /jackpot/results?limit=10`
- `GET /jackpot/results/:drawId`
- `GET /jackpot/winners/:drawId`
- `GET /jackpot/my-bets?page=1&limit=20`
- `GET /jackpot/my-bets/bet/:betId`
- `GET /jackpot/my-bets/:drawId`

All requests require a Bearer token.

## Data Flow

### 1. Active draw

Load the current open draw on page mount.

Display:

- draw number
- draw day
- close time
- bet amount
- prize tiers
- total bets
- 7 matches

If no draw is open, show a friendly empty state.

### 2. Place bet

The user must select exactly 7 picks.

Allowed values:

- `H` for home win
- `D` for draw
- `A` for away win

Before submitting:

- ensure the draw is open
- ensure all 7 matches are selected
- ensure the user is authenticated

After success:

- show a success toast
- refresh wallet balance
- refresh jackpot queries
- redirect to bet history or stay on the page

### 3. Recent results

Show recent settled draws in a compact list or card stack.

Each row should show:

- draw number
- draw day
- settlement time
- total bets
- total paid out
- prize tiers

### 4. Draw detail

When a draw result is opened:

- show all 7 matches
- show each match result
- show winners for that draw
- show prize breakdown

### 5. Bet history

Show the current user’s jackpot bets with:

- draw number
- created time
- score
- prize
- payout status

### 6. Bet detail

Show the full match-by-match breakdown:

- match number
- teams
- kickoff time
- user pick
- result
- correctness

## Recommended File Structure

- `src/services/JackpotService.js`
- `src/hooks/useJackpot.js`
- `src/features/jackpot/jackpotUtils.js`
- `src/features/jackpot/JackpotPage.jsx`
- `src/features/jackpot/JackpotResultsPage.jsx`
- `src/features/jackpot/JackpotDrawDetailPage.jsx`
- `src/features/jackpot/JackpotHistoryPage.jsx`
- `src/features/jackpot/JackpotBetDetailPage.jsx`

## Reuse Existing App Patterns

Follow the patterns already used in the app:

- `fetchAPI` for authenticated requests
- `BaseClass` for token and user access
- React Query for fetching and mutations
- `Loader` for loading states
- `GoBack` for mobile navigation
- `SidebarItem` for dashboard navigation

## UX Requirements

### Loading

Show a loader while:

- active draw is loading
- results are loading
- bet history is loading
- a bet submission is in progress

### Empty states

Show clear empty states when:

- there is no active draw
- there are no recent results
- the user has no bets yet

### Validation

Frontend validation should block:

- fewer than 7 picks
- more than 7 picks
- invalid pick values
- submission when the draw is closed

### Mobile behavior

Keep the Jackpot pages readable on small screens:

- stack cards vertically
- make match buttons large enough to tap
- avoid fixed widths that force horizontal scrolling

## State Management Notes

Use query keys that are easy to invalidate:

- `jackpot-active-draw`
- `jackpot-recent-results`
- `jackpot-draw-results`
- `jackpot-winners`
- `jackpot-my-bets`
- `jackpot-my-bet-detail`

Invalidate relevant queries after placing a bet.

Also refresh the wallet balance after a successful bet.

## Acceptance Criteria

The feature is complete when:

1. A user can open Jackpot from the sidebar.
2. The active draw is visible on the dashboard.
3. The user can pick all 7 matches and place a bet.
4. Results and winners can be viewed.
5. Bet history works.
6. Single bet detail works.
7. The UI behaves well on mobile and desktop.

## Notes

- Keep admin functionality out of this dashboard feature.
- Keep the card on the home page as a lightweight entry point.
- If the API returns no active draw, do not show a broken form.
- If the user is not logged in, redirect to login before allowing a bet.
