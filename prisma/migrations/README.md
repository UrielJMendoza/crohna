# Prisma migrations

This directory tracks the schema history for the Crohna database. **All
schema changes** must ship as a migration here — never edit the database with
`prisma db push` against a production environment.

## Workflow

- **Local dev:** `npx prisma migrate dev --name <change-description>` after
  editing `prisma/schema.prisma`. This generates a new `<timestamp>_<name>/`
  folder and applies it to the local database.
- **CI:** `npx prisma migrate deploy` runs against the target environment as
  part of the deploy pipeline. It is non-interactive and only applies
  migrations — it never creates or modifies them.

## Baselining an existing production database

The `20260513000000_init` migration is the schema baseline. For databases
that were originally created via `prisma db push` (i.e., without a migration
history), mark the baseline as already applied **once**:

```bash
npx prisma migrate resolve --applied 20260513000000_init
```

After that, `prisma migrate deploy` will only apply subsequent migrations.
Skipping this step on a populated database will cause `migrate deploy` to try
to recreate tables that already exist.
