# `get_hlo_stats` Reference

Fetches detailed performance statistics for individual HLO operations from the
`hlo_stats` database, including self time, total time, occurrence count, FLOPs,
memory bandwidth, roofline bottleneck classification (`bound_by`), and source
code provenance (`source_file`, `source_line`).

## Prerequisites

-   You must have the log directory path (`<logdir>`), direct run directory, or
    session ID for the specific XProf run you are attempting to analyze.

## Instructions

Run the CLI command with optional sorting, filtering, and row limits:

```bash
xprof get_hlo_stats <logdir> \
   [--limit=<LIMIT>] \
   [--sort_by=<METRIC>] \
   [--category_filter=<CATEGORY>] \
   [--include_nested=True]
```

### Arguments

-   `<logdir>` or `--session_id`: The XProf log directory or session ID.
-   `--limit` (optional): Maximum number of HLO operation records to return
    (default: `20`).
-   `--sort_by` (optional): Metric used to order operations in descending order.
    Supported values: `'self_time'`, `'total_time'`, `'occurrences'`, `'flops'`,
    and `'bandwidth'` (default: `'self_time'`).
-   `--category_filter` (optional): Substring filter on `hlo_category` (e.g.
    `'custom-call'`, `'convolution fusion'`, `'loop fusion'`).
-   `--include_nested` (optional): Also return nested operations (default:
    `False`). See [Nested operations](#nested-operations).
-   `--bypass_cache` (optional): Recompute metrics without reading from cache
    (default: `False`).

## Output

A JSON object. `records` holds the operations, sorted by `--sort_by` and cut to
`--limit` rows. Each row includes `rank`, `self_time_percent`, `core_type`
(`TensorCore` or `SparseCore`) and `parent_op_name`.

### Truncation and totals

`--limit` keeps only the top rows, so the sum of `records` is not a total. The
object also has these fields, computed before `--limit` drops rows:

-   `truncated`: `true` if `--limit` dropped rows.
-   `total_records`: Number of matching rows in the table before `--limit`
    (includes nested rows when `--include_nested=True`).
-   `top_level_records`: Number of matching top-level (non-nested) rows before
    `--limit`, which is the exact count summed into
    `total_self_time_ms_all_records`.
-   `returned_records`: Number of rows in `records`.
-   `total_self_time_ms_all_records`: Self time of all matching top-level rows,
    in ms. Nested rows are excluded (see below).

Take totals from `total_self_time_ms_all_records`, never by summing `records`.
For example, with the default `--limit=20` the 20 rows can hold about half of
the total self time. To see every row, pass `--limit=0`.

A trace with no matching operations returns
`{"status": "NO_DATA", "records": [], ...}` with `truncated: false` and zeroed
truncation fields (`total_records`, `top_level_records`, `returned_records`, and
`total_self_time_ms_all_records`) instead. Cached runs add `"__cached__": true`
and `"__cache_age_s__"` to the JSON object while preserving indentation.

### Nested operations

On TPUs with SparseCore offload (e.g. v7x collectives), a TensorCore offload op
starts work on a SparseCore (e.g. `reduce-scatter.542` under
`reduce-scatter.543.cloned.1.call-start`). The SparseCore op is listed as a
nested op: it has a non-empty `parent_op_name`, `core_type: SparseCore`,
`rank: 0` and `self_time_percent: 0`. Its time is SparseCore time, not part of
the TensorCore device time that top-level rows are ranked against, so it is not
ranked and must never be added to top-level rows. Whether the parent's
`async-done`/`call-done` also covers that time depends on whether the
TensorCore waits for the SparseCore; it can be far shorter than the nested op.

Nested ops are hidden by default, so the default output does not show
SparseCore busy time. stderr gets one `xprof-note: hid N nested operation(s)`
line when any were hidden. Pass `--include_nested=True` to see them. With
`--include_nested=True`, nested rows count against `--limit`, so raise `--limit`
if you still need the full top-N of top-level ops.

## Example Usage

1.  **Top 10 Operations by Self Time**:

    ```bash
    xprof get_hlo_stats /path/to/logdir --limit=10 --sort_by=self_time
    ```

2.  **Filter Custom Call Operations by Memory Bandwidth**:

    ```bash
    xprof get_hlo_stats /path/to/logdir --category_filter="custom-call" --sort_by=bandwidth
    ```

3.  **SparseCore Collectives Inside Offload Ops**:

    ```bash
    xprof get_hlo_stats /path/to/logdir --include_nested=True --category_filter="reduce-scatter"
    ```
