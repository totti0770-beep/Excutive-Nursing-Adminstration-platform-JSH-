"""CSV export helper."""

import csv
import io

from flask import Response


def csv_response(filename, header, rows):
    """Build a downloadable CSV Response.

    A UTF-8 BOM is prepended so Excel renders Arabic correctly.
    `header` is a list of column titles; `rows` an iterable of value lists.
    """
    buffer = io.StringIO()
    buffer.write("﻿")  # BOM for Excel
    writer = csv.writer(buffer)
    writer.writerow(header)
    for row in rows:
        writer.writerow(row)

    return Response(
        buffer.getvalue(),
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
