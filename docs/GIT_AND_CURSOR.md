# Git and Cursor: "Local changes (working tree)" and wrong account

## Why you see "For local changes (working tree)" everywhere

That message **is not a code error**. It comes from **Git integration in Cursor/VS Code**:

- **Working tree** = your uncommitted changes (edited files).
- The editor labels modified lines or files with this phrase (in the gutter, Source Control view, or hovers).

If almost every file is modified or untracked, that label can appear in many places and feel like "errors." It’s just Git saying: "this line/file has local changes."

## If the repo is on a different Git account

Your project may be cloned from (or pushed to) a **different** Git account than the one connected in Cursor. You can fix that in one of these ways:

### Option A: Push this project to the connected account (new repo)

1. Create a **new empty repo** on the Git account you want (e.g. GitHub account connected to Cursor).
2. In this project folder, check the current remote:
   ```bash
   git remote -v
   ```
3. Either add the new repo as a new remote, or replace the existing one:
   ```bash
   git remote add origin https://github.com/YOUR_CONNECTED_ACCOUNT/ai-recruiting-platform.git
   ```
   Or if `origin` already exists and you want to switch it:
   ```bash
   git remote set-url origin https://github.com/YOUR_CONNECTED_ACCOUNT/ai-recruiting-platform.git
   ```
4. Push your branch:
   ```bash
   git push -u origin main
   ```
   (Use your actual branch name if it’s not `main`.)

### Option B: Keep using the other account

- Leave the remote as is and keep using the other account for push/pull.
- The "local changes (working tree)" messages will still appear for uncommitted edits; they’re unrelated to which account is connected.

### Option C: Reduce Git UI noise in Cursor

- **Turn off gutter decorations:** File → Preferences → Settings (or `.vscode/settings.json`), set `"git.decorations.enabled": false`. That hides the change markers in the left gutter.
- **GitLens:** If you use GitLens, you can disable "Current line" blame/hover so it doesn’t show "Local changes (working tree)" on every line: in Settings search for "GitLens current line" and turn it off.
- **Source Control:** Use the Source Control view to commit and push; the same "working tree" wording there is normal.

## Summary

| What you see              | What it is                         | What to do                                      |
|---------------------------|-------------------------------------|-------------------------------------------------|
| "For local changes (working tree)" | Git labeling uncommitted changes   | Ignore, or turn off git/GitLens decorations     |
| Repo on "wrong" account   | Remote URL points to another user  | Add/set `origin` to the repo on the right account and push |

Your app code is fine; these are Git/editor labels, not build or runtime errors.
