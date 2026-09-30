# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Beads-specific mapping

When the issue tracker is [beads](https://github.com/gastownhall/beads), "applying a label" is `bd label add <id> <label>` (or `bd update <id> --add-label <label>`). The role-to-command mapping:

| Role               | Command                                                  | Notes                                                                                                                              |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `needs-triage`     | `bd label add <id> needs-triage`                         | Default for incoming work.                                                                                                         |
| `needs-info`       | `bd label add <id> needs-info`                           | Pair with `bd comment <id> "<question for reporter>"`.                                                                             |
| `ready-for-agent`  | `bd label add <id> ready-for-agent`                      | Issues with this label and no open blockers will surface in `bd ready`, which is what AFK agents poll.                             |
| `ready-for-human`  | `bd label add <id> human`                                | Beads has a native "human" queue: `bd human list` shows them, `bd human respond <id>` closes one with a comment.                   |
| `wontfix`          | `bd close <id> --reason wontfix`                         | Closing is the wontfix signal in beads; the label is optional and only useful for filtering closed issues later.                   |

The "snooze" / defer role used by the `triage` state machine maps to `bd defer <id> --until=<date>` (and `bd undefer <id>` to restore). Deferred issues stay visible in `bd list` but drop out of `bd ready`, which is exactly the semantics the triage skill expects.
