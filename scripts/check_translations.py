#!/usr/bin/env python
"""Fail if the translation catalogs do not cover the source, or have gaps.

``pybabel update --check`` is not usable as a CI gate here: it compares the
``POT-Creation-Date`` header, which changes on every extraction, so it reports
"out of date" even when nothing has actually changed.

This checks the three things that genuinely matter:

1. every translatable string in the source has an entry in each catalog
2. no entry is left untranslated (empty ``msgstr``)
3. no entry is marked ``fuzzy`` (a guessed translation needing review)

Run via ``make i18n-check``.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from babel.messages.pofile import read_po

ROOT = Path(__file__).resolve().parent.parent
TRANSLATIONS = ROOT / "app" / "translations"
# Must match the Makefile: `_l` is the lazy_gettext alias and is not one of
# pybabel's default keywords.
EXTRACT = [
    "pybabel",
    "extract",
    "-F",
    "babel.cfg",
    "-k",
    "_l",
    "-k",
    "_",
    "-o",
]


def extract_source_ids():
    with tempfile.TemporaryDirectory() as tmp:
        pot = Path(tmp) / "messages.pot"
        subprocess.run(
            [*EXTRACT, str(pot), "."],
            cwd=ROOT,
            check=True,
            capture_output=True,
        )
        with pot.open(encoding="utf-8") as fh:
            return {m.id for m in read_po(fh) if m.id}


def main():
    source_ids = extract_source_ids()
    catalogs = sorted(TRANSLATIONS.glob("*/LC_MESSAGES/messages.po"))
    if not catalogs:
        print("No translation catalogs found under app/translations/.")
        return 1

    failed = False
    for po_path in catalogs:
        locale = po_path.relative_to(TRANSLATIONS).parts[0]
        with po_path.open(encoding="utf-8") as fh:
            catalog = read_po(fh)

        entries = {m.id: m for m in catalog if m.id}
        missing = sorted(source_ids - entries.keys())
        untranslated = sorted(i for i, m in entries.items() if not m.string)
        fuzzy = sorted(i for i, m in entries.items() if m.fuzzy)
        obsolete = sorted(entries.keys() - source_ids)

        problems = []
        if missing:
            problems.append(("not in the catalog (run `make i18n-update`)", missing))
        if untranslated:
            problems.append(("untranslated", untranslated))
        if fuzzy:
            problems.append(("fuzzy — needs review", fuzzy))

        if problems:
            failed = True
            for label, ids in problems:
                print(f"[{locale}] {len(ids)} string(s) {label}:")
                for i in ids[:20]:
                    print(f"    {i!r}")
                if len(ids) > 20:
                    print(f"    ... and {len(ids) - 20} more")
        else:
            print(f"[{locale}] OK — {len(source_ids)} strings, all translated.")

        # Obsolete entries are noise, not a failure: they cost nothing at
        # runtime and removing them is a cleanup, not a correctness fix.
        if obsolete:
            print(f"[{locale}] note: {len(obsolete)} obsolete entry(ies).")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
