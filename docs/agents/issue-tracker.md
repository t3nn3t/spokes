# Issue tracker: Local Markdown

Issues and specs for this repository live as Markdown files under `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The Spokes effort lives at `.scratch/spokes/`
- Its specification is `.scratch/spokes/spec.md`
- Implementation tickets are stored individually at `.scratch/spokes/issues/<NN>-<slug>.md`
- Tickets are numbered from `01`
- A `Status:` line records workflow state
- Comments and history are appended under `## Comments`

## Publishing

When a skill says “publish to the issue tracker,” create or update the appropriate file beneath `.scratch/<feature-slug>/`.

When a skill says “fetch the relevant ticket,” read the referenced ticket file in full.

## Blocking relationships

Each ticket declares `Blocked by: NN, NN` near the top. A ticket is unblocked when every listed ticket has been resolved.

## Ticket workflow

- New implementation-ready ticket: `Status: ready-for-agent`
- Claimed ticket: `Status: claimed`
- Completed ticket: `Status: resolved`
- Claim a ticket before beginning work
- Append the result under `## Outcome` before resolving it
