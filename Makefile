# Translation (i18n) workflow.
#
# The `-k _l` is essential: the codebase aliases flask_babel.lazy_gettext to
# `_l`, which is NOT one of pybabel's default keywords. Omitting it silently
# extracts only the templates and drops every form label, validation message,
# and error-page string. Always go through these targets.

BABEL_KEYWORDS := -k _l -k _
TRANSLATIONS   := app/translations

.PHONY: i18n-extract i18n-update i18n-compile i18n-check i18n-add

## Regenerate messages.pot from the source.
i18n-extract:
	pybabel extract -F babel.cfg $(BABEL_KEYWORDS) -o messages.pot \
		--project="Nursing Executive Administration System" --version="1.0" \
		--copyright-holder="Jazan Specialty Hospital" .

## Merge new/changed source strings into the existing catalogs.
i18n-update: i18n-extract
	pybabel update -i messages.pot -d $(TRANSLATIONS)

## Build the .mo files the application reads at runtime.
i18n-compile:
	pybabel compile -d $(TRANSLATIONS)

## Fail if the catalogs miss a source string, or have untranslated/fuzzy
## entries (used by CI). Deliberately not `pybabel update --check`, which only
## compares the POT-Creation-Date header and so always reports "out of date".
i18n-check:
	python scripts/check_translations.py

## Start a catalog for a new language, e.g. `make i18n-add LANG=fr`.
i18n-add: i18n-extract
	pybabel init -i messages.pot -d $(TRANSLATIONS) -l $(LANG)
