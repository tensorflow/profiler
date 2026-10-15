# `get_step_trace` Reference

This reference explains how to retrieve step-by-step execution breakdowns and
timing data for training and inference steps from an XProf session. Use this
tool to diagnose step time variance, identify communication overhead
(All-Reduce, Send/Recv), detect input pipeline stalls (Infeed), or inspect
specific step profiles.

## Prerequisites

-   You must have the log directory path (`<logdir>`) or session ID for the
    specific XProf run you are attempting to analyze.

## Instructions

1.  Use the `xprof` command-line tool, providing the log directory or session ID:

    ```bash
    xprof get_step_trace <logdir_or_session_id>
    ```

    Or with explicit named flags:

    ```bash
    xprof get_step_trace --session_id=<session_id>
    ```

2.  Optional arguments:

    -   `--step_num=<int>`: Filter and return breakdown for a specific step
        number.
    -   `--limit=<int>`: Maximum number of individual steps to include in
        `step_breakdown` (default: 20). Use 0 for no limit.
    -   `--device_core=<int>`: Filter metrics for a specific device core
        (defaults to averaging across cores).
    -   `--include_summary=<bool>`: Include aggregate summary statistics across
        steps (default: True).
    -   `--bypass_cache=<bool>`: Bypass cached metrics and recompute from raw
        trace data (default: False).

3.  Output Details (JSON):

    -   `summary`:
        -   `total_steps`: Number of steps captured (or `null` if individual
            step count is unavailable).
        -   `step_time_ms_average`, `step_time_ms_min`, `step_time_ms_max`,
            `step_time_ms_stddev`: Step duration and variance statistics in
            milliseconds.
        -   `compute_time_ms_average` and `compute_percent`: Time and
            percentage spent in device compute.
        -   `communication_time_ms_average` and `communication_percent`:
            Time and percentage spent in communication (All-Reduce, Send,
            Recv).
        -   `infeed_time_ms_average` and `infeed_percent`: Time and
            percentage spent in host infeed (data input).
        -   `outfeed_time_ms_average` and `outfeed_percent`: Time and
            percentage spent in host outfeed (data output).
        -   `idle_time_ms_average` and `idle_percent`: Time and percentage of
            the step that is idle or not attributed to any category above. The
            categories above plus idle account for the whole step, so a high
            `compute_percent` with a small non-zero `idle_percent` is expected
            on a compute-bound workload.
        -   `primary_bottleneck`: Main bottleneck across steps (e.g.
            `Compute`, `Send and Recv`, `All-Reduce`, `Input / Infeed`).
        -   `is_aggregate`: Boolean flag indicating whether metrics are
            aggregated across the session rather than from individual step
            traces.
        -   `note`: Optional note describing data availability or fallback mode.
    -   `step_breakdown`: A list of individual step breakdown objects
        containing `step_num`, `step_time_ms`, `compute_time_ms`,
        `compute_percent`, `communication_time_ms`, `communication_percent`,
        `communication_breakdown_ms` (`all_reduce_ms`, `send_ms`,
        `recv_ms`), `infeed_time_ms`, `outfeed_time_ms`, `idle_time_ms`,
        `idle_percent`, and `bottleneck`.
    -   `truncated`: `true` if `--limit` dropped steps from `step_breakdown`.
    -   `total_records`: Number of per-step breakdown records before `--limit`
        (`0` when `summary.is_aggregate` is `true` on the overview-page
        fallback, even when `summary.total_steps` is positive).
    -   `returned_records`: Number of per-step records in `step_breakdown`.

    Take the session step count (`total_steps`) and averages from `summary`,
    not by counting or summing `step_breakdown`, which holds at most `--limit`
    steps (and is empty when `summary.is_aggregate` is `true`). Use `truncated`,
    `total_records`, and `returned_records` to check whether `--limit` cut
    `step_breakdown`.

## Example Usage

### Example: Check Step Time Variance & Bottleneck

If the user asks: "What is the step time variance and primary bottleneck for
session /path/to/logdir?", you should:

1.  Run:

    ```bash
    xprof get_step_trace /path/to/logdir
    ```
2.  Extract `step_time_ms_average`, `step_time_ms_stddev`, min/max range, and
    `primary_bottleneck` from `summary`.
3.  Provide a concise summary to the user.

## Scalar Average Step Time

To get only the scalar average step time (in milliseconds) without the full
per-step breakdown, use `get_overview` (`steptime_ms_average`, see
[get_overview](get_overview.md)) or `get_kpi_metrics` (`step_time_ms`, see
[get_kpi_metrics](get_kpi_metrics.md)):

```bash
xprof get_overview <logdir>
xprof get_kpi_metrics <logdir>
```

For per-module timing from `XLA Modules` events (or traces without step markers,
such as inference and serving traces), run `xprof aggregate_xplane_events
<logdir> --event_regex="<module_name>" --filter='line == "XLA Modules"'` (see
[architecture_mapping](architecture_mapping.md)).

(`get_avg_step_time` is removed; it averaged every `XLA Modules` event rather
than training steps.)
