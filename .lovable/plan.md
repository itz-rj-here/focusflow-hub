# FocusFlow Gamification Plan

Turn FocusFlow from a focus tracker into a study RPG. Users earn **XP** (levels up their profile) and **Coins** (spendable currency) from focusing, completing tasks, hitting habits, and journaling. They unlock **Achievements**, collect **Stickers** from a shop, and build **Streaks** — with friends seeing levels & streaks while journals/habits stay private.

---

## 1. Core Economy: XP + Coins

**Earning rules** (server-side, anti-cheat):

| Action | XP | Coins |
|---|---|---|
| 1 min focused (saved session) | 1 XP | 0.2 coin |
| Complete a todo | 10 XP | 2 coins |
| Hit a habit on its scheduled day | 15 XP | 3 coins |
| Write a journal entry | 10 XP | 2 coins |
| Daily streak day (any activity) | +20 XP | +5 coins |
| First focus of the day | +5 XP bonus | — |
| Unlock an achievement | varies (25–500 XP) | varies (10–200 coins) |

**Leveling curve:** `xp_for_level(n) = 100 * n * (n+1) / 2` (level 1 → 100xp, 5 → 1500xp, 10 → 5500xp). Display as a progress bar in the sidebar header.

**Level perks:** every 5 levels unlocks a profile frame + sticker pack in the shop.

---

## 2. Achievements

A catalog of badges with categories: **Focus**, **Tasks**, **Habits**, **Journal**, **Social**, **Secret**.

Examples:
- *First Focus* — finish 1 saved session (25 XP, 10 coins)
- *Deep Diver* — 2-hour single session
- *Marathon Week* — 10h in one week
- *Centurion* — 100 sessions total
- *Habit Hero* — 30-day habit streak
- *Reflection* — 7 journal entries
- *Night Owl / Early Bird* — session before 6am / after midnight (secret)
- *Subject Master* — 50h in one subject

Each achievement has: icon, name, description, tier (bronze/silver/gold), progress bar, hidden flag.

UI: `/_app/achievements` route — grid of cards, locked ones grayscale with progress, unlocked shown with date earned and rarity %.

---

## 3. Habit Tracking

Supports all four scopes the user picked: **Study, Wellness, Custom, Negative**.

**Habit model:** name, icon emoji, category (study/wellness/custom/negative), frequency (`daily` | `weekly_n` with target count | `specific_days` like Mon/Wed/Fri), color, is_negative (flips the success logic — "stayed clean today").

**Daily check-in UI** (`/_app/habits`):
- Today's habits as toggle cards. Tap to check off → XP/coins animate up.
- Weekly grid view (last 7 days, GitHub-style).
- Streak counter per habit + "longest ever" record.
- Negative habits show "X days clean" with a single "I slipped" reset.

**Auto-suggestions** based on subjects (e.g. "Review Math notes 3×/week" when a Math subject exists).

---

## 4. Journal (All-Three Combined)

`/_app/journal` route with three entry modes:

1. **Daily Reflection** — auto-prompted card on dashboard each day with rotating prompts ("What did you learn today?", "What blocked you?", "One win"). One per day.
2. **Free-form** — full markdown editor, tag by subject + mood (emoji picker: 😄😐😔😤🔥), searchable.
3. **Post-session** — after ending a focus session, a small "Reflect on this session?" prompt appears, optional, attached to that session_id.

**Calendar view:** month grid; days with entries are colored by mood. Click → read/edit.

**Privacy:** journal is *always* private (not affected by social settings).

---

## 5. Sticker Shop & Inventory

Coins are spent in `/_app/shop`:

- **Sticker packs** (50–300 coins): themed sets — Animals, Space, Retro, Anime, Minimalist. ~6 stickers per pack.
- **Profile frames** (200 coins): borders around avatar (gold, neon, gradient).
- **Theme accents** (500 coins): custom accent colors beyond the defaults.
- **Streak freeze** (100 coins): consumable, protects a streak for 1 missed day. Max 3 in inventory.

**Inventory** at `/_app/inventory`: shows owned stickers grouped by pack.

**Where stickers appear:**
- React to friends' achievements/sessions with a sticker (DM/group chat).
- Decorate journal entries.
- Pin 3 favorites on your public profile.

---

## 6. Streaks

A unified **daily activity streak** (any of: focus session ≥10min, habit checked, journal entry).
- Shown as a 🔥 number in the sidebar.
- "Streak freeze" auto-consumes if user owned one and missed a day.
- Milestone bonuses at 3/7/14/30/100/365 days (chunky coin rewards + exclusive sticker).

Separate per-habit streaks live inside the Habits page.

---

## 7. Hybrid Social Visibility

- **Public to friends:** level, XP bar, total focus hours, current streak, unlocked achievements, pinned stickers.
- **Always private:** journal entries, habit list, habit check-ins, coin balance, inventory contents.
- **Leaderboard** gains a "Level" column next to total seconds.
- New **Friend Activity Feed** (`/_app/community` tab): "Alice unlocked *Centurion*", "Bob hit a 30-day streak". Opt-out toggle in Settings.
- **Cheer** button on feed items → costs 1 coin, sender's name shown to recipient.

---

## 8. UI Touchpoints

- **Sidebar header:** avatar + frame, level badge, XP bar, 🔥 streak, 🪙 coin balance.
- **New nav items:** Habits, Journal, Achievements, Shop.
- **Dashboard widgets:** Today's habits checklist, Daily reflection prompt, Next achievement progress.
- **Focus session end screen:** XP/coin earned animation, "Reflect?" prompt, achievement unlock toast.
- **Toasts:** Level-up modal (confetti), achievement unlock card, streak milestone celebration.

---

## 9. Technical Details

**New tables:**
- `user_stats` (user_id PK, xp, level, coins, current_streak, longest_streak, last_active_date, streak_freezes)
- `achievements` (id, key, name, description, category, tier, xp_reward, coin_reward, icon, is_secret, criteria jsonb) — seeded catalog
- `user_achievements` (user_id, achievement_id, unlocked_at, progress)
- `habits` (id, user_id, name, icon, category, frequency_type, frequency_config jsonb, color, is_negative, archived_at)
- `habit_logs` (id, habit_id, user_id, date, completed)
- `journal_entries` (id, user_id, type [daily/free/session], session_id nullable, subject_id nullable, mood, content, prompt, created_at)
- `sticker_packs` (id, name, price_coins, theme) + `stickers` (id, pack_id, name, image_url, rarity)
- `user_inventory` (user_id, item_type, item_id, quantity, acquired_at)
- `cosmetics` (frames, themes) + `user_cosmetics` (equipped flag)
- `activity_feed` (id, user_id, type, payload jsonb, created_at) — for friend feed
- `cheers` (id, from_user, to_user, activity_id, created_at)

All with RLS scoped to `auth.uid()`. Habits/journal: owner-only. user_stats: owner full + friends read of `level, current_streak, total_xp` via a `public_stats` view. user_achievements: owner full + friends read.

**Server functions (`createServerFn`):**
- `awardXp(action, metadata)` — single source of truth, called from session save, todo complete, habit check, journal save. Idempotent per `(user_id, action_key, date)` where applicable.
- `checkAchievements(user_id)` — runs after every award; evaluates `criteria` against user data, inserts unlocked rows, returns newly unlocked list for client toast.
- `tickStreak(user_id)` — runs daily on first activity; consumes freeze if needed.
- `purchaseItem(item_id)` — deducts coins, adds to inventory, atomic.
- `cheer(activity_id)` — deducts 1 coin, notifies recipient.

**Anti-cheat:** XP for focus sessions calculated server-side from `duration_seconds` of the saved row, not trusted from client. Reject sessions <60s or >6h.

**Seed data migration:** ~30 starter achievements + 5 sticker packs + 3 frames.

---

## 10. Build Order

1. **Foundation** — `user_stats` table, `awardXp` server fn, sidebar XP/level/coin widget, hook into existing focus session save + todo complete.
2. **Achievements** — catalog + seed + evaluator + `/achievements` page + unlock toasts.
3. **Habits** — full CRUD, daily check-in UI, weekly grid, streak per habit, XP integration.
4. **Journal** — three modes, calendar view, mood tagging, post-session prompt.
5. **Streaks & Daily flow** — unified streak, milestone rewards, dashboard "today" widget.
6. **Shop & Stickers** — packs, inventory, sticker reactions in chat, profile pinning, frames.
7. **Social layer** — activity feed, cheers, leaderboard level column, friend profile views.
8. **Polish** — level-up modal with confetti, sound effects (respecting focus_sound preference), animations throughout.

Each phase is shippable on its own and builds on the previous.
