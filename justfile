# One-command interface (Pattern 6) for this docs repo.

# Regenerate README.md + patterns/README.md from patterns/
build:
    node scripts/build-readme.mjs

# Fail if README.md / patterns/README.md are out of sync with patterns/
check:
    node scripts/check-readme.mjs

# Run the assembly-library unit tests
test:
    node --test scripts/lib/
