# Pull Request Template

## Summary

What does this PR do? One paragraph.

## Type of Change

- [ ] Feature (new functionality for founders)
- [ ] Fix (bug affecting founder workflow)
- [ ] Docs (documentation update)
- [ ] Refactor (code restructuring, no behavior change)
- [ ] Chore (tooling, deps, CI)
- [ ] ADR (new or updated Architecture Decision Record)
- [ ] Sprint (sprint deliverable)

## ADR Requirement

Does this change any of the following?

- Data model / schema
- Connector interface / Trust Pipeline stages
- LLM provider / Brain Interface contract
- Workspace isolation / locking / database
- Authentication / OAuth flows
- Local-first architecture (adding cloud dependency)
- Cost structure (new recurring cost)

If **YES** to any above:

- [ ] ADR created following `templates/ADR_TEMPLATE.md`
- [ ] ADR added to `company/DECISIONS.md` register
- [ ] ADR Status: `Accepted` (not `Proposed`)

## Testing

- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Manual test: [describe what you tested]
  - [ ] Workspace create → connect → chat → chart flow
  - [ ] Crash recovery (lock file handling)
  - [ ] Offline mode
- [ ] Affected packages tested individually

## Documentation Updates

- [ ] `spec.md` updated (if architecture changed)
- [ ] Relevant RFC in `docs/architecture/` updated
- [ ] `COMPANY_CONTEXT.md` glossary updated (if new terms)
- [ ] Marketing docs updated (if user-facing change)

## Checklist

- [ ] Commit messages follow conventional commits (`feat:`, `fix:`, `adr:`, etc.)
- [ ] No TODO/FIXME in accepted ADRs
- [ ] No console.log/debugger in production code
- [ ] No new dependencies without justification in PR description
- [ ] PR title follows conventional commits

## Screenshots / Demo

If UI change, add screenshots or link to Loom.

## Related Issues

Closes #XXX
