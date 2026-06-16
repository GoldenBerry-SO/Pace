# Issue tracker: Beads

Issues for this repo live in a [beads](https://github.com/gastownhall/beads) database under `.beads/` (a Dolt-backed SQLite alongside a JSONL export). Use the `bd` CLI for all operations.

## Conventions

- **Create an issue**: `bd create "<title>" -d "<description>" -t task -p 2`. Types are `task|bug|feature|epic|chore|decision`; priority is `0-4` (0 = highest). Use `--body-file -` or `--stdin` for multi-line descriptions; `--silent` prints only the new ID.
- **Read an issue**: `bd show <id>`. Comments come from `bd comments <id>`; notes are part of the issue body.
- **List issues**: `bd list --json` for machine-readable output. Filter with `--label`, `--status`, `--type`, `--assignee`. `bd list` defaults to open issues; pass `--all` to include closed.
- **Ready queue**: `bd ready` shows open issues with no active blockers — what an AFK agent should pick up next. `bd ready --claim --json` atomically grabs one.
- **Comment on an issue**: `bd comment <id> "..."` adds a threaded comment. `bd note <id> "..."` appends to the issue's notes field (shorthand for `bd update --append-notes`).
- **Apply / remove labels**: `bd label add <id> <label>` / `bd label remove <id> <label>`. Multiple labels: `bd update <id> --add-label foo --add-label bar`, or replace the whole set with `--set-labels`.
- **Status transitions**: `bd update <id> --status <status>`. Run `bd statuses` to see the valid set for this database (state machine is configurable). `bd defer <id> --until=<date>` puts an issue on ice without blocking it (`bd undefer` restores). `bd close <id> --reason "<why>"` closes (accepts multiple IDs).
- **Dependencies**: `bd dep add <issue> <depends-on>` records that `<issue>` is blocked by `<depends-on>`. `bd dep list <id>` shows the graph for one issue; `bd blocked` lists everything currently blocked. Skills like `to-issues` and `spec` should emit these edges when sub-issues have explicit ordering.
- **Sync model**: the `.beads/*.db` file IS the source of truth, synced peer-to-peer via Dolt commits on the `refs/dolt/data/*` git refs (and a JSONL export committed alongside for human-readable diffs). `git pull` brings teammates' issue changes; `bd` writes them locally. See the [beads docs](https://github.com/gastownhall/beads#sync) for the full model.

The active workspace is auto-discovered from `.beads/` upward from `$PWD`; override with `BEADS_DIR` or `bd -C <path>`.

## When a skill says "publish to the issue tracker"

Run `bd create` — pick the type (`task` for implementation work, `bug` for defects, `feature`/`epic` for user-facing scope, `decision` for ADR-style records). Add `--deps` or follow up with `bd dep add` when issues have ordering.

## When a skill says "fetch the relevant ticket"

Run `bd show <id>` and (if the conversation matters) `bd comments <id>`.
