# `get_llo_static_analysis` Reference

This reference explains how to run static analyses over the Low Level Optimizer
(LLO) schedule that the compiler records in a trace. Use it to drill into a
custom kernel (for example Pallas or Mosaic) after `get_llo_analysis` has
confirmed the trace carries LLO data.

> [!IMPORTANT]
> All results describe the compiler's **static, modelled schedule**, not
> measured hardware counters. Every payload carries
> `"semantics": "static_modelled_schedule"`; say so when you report numbers.

## Prerequisites

-   A trace captured with `--xla_xprof_register_llo_debug_info=true` (see the
    LLO section of `SKILL.md`).
-   An `xprof` build with embedded LLO analysis support. Official `xprof`
    wheels on PyPI are built with it. Builds from the public source do not
    include the embedded library and return `"status": "UNAVAILABLE"` (see
    [Status values](#status-values)).
-   A single trace: pass a `.xplane.pb` file, or a directory whose first
    `*.xplane.pb` file (in sorted order) is the one to analyze. `--host` is not
    supported.

## Instructions

1.  List the LLO modules in the trace:

    ```bash
    xprof get_llo_static_analysis <trace_or_dir> --mode=list_ops
    ```

2.  Pick a module with `--hlo_op=<substring>`. It matches the HLO instruction
    name or the kernel name; the first match wins. Without `--hlo_op` the first
    module is used.

    ```bash
    xprof get_llo_static_analysis <trace_or_dir> --mode=bundle_util \
        --hlo_op=custom-call.3
    ```

3.  Read `data` from the JSON payload. `get_llo_dump_analysis` is an alias that
    takes the same arguments.

## Modes

| Mode | Answers | Key fields in `data` |
| :--- | :--- | :--- |
| `list_ops` | Which kernels have LLO data? | `ops` |
| `region_tree` | How is the kernel structured (loops, regions)? | `root`, `hlo_module_name` |
| `bundle_util` | How full is each VLIW bundle? | `bundles[]` (`util_pct`, `<unit>_used` / `<unit>_avail`, `spill`, `fill`, `region_path`), `total_bundles`, `truncated` |
| `opcodes` | Which instructions dominate? | `top_opcodes`, `categories`, `total_instructions` |
| `register_pressure` | Where are the most registers live? | `peak_by_register_type`, `hottest_bundles` |
| `spills` | Does the kernel spill, and where? | `summary` (`total_spill_bytes`, `static_spill_bundles`, ...), `allocations`, `spill_fill_instructions` |
| `bdi_stalls` | Which instructions carry bundle dependency interlock codes? | `code_histogram`, `instructions[]` (`bundle`, `codes`, `region`) |
| `target_info` | What target was it compiled for? | `key_fields`, `catalog_only_fields` |
| `source_for_bundle` | Which source lines produced bundle N? | `sources[].frames`, `region_path` (pass `--bundle=<N>`) |

`bdi_stalls` reports the compiler's raw single-letter interlock codes
(`O`, `R`, `A`, `H`, `F`, `B`) as they appear in the schedule; do not invent
descriptions for them.

## Status values

| `status` | Meaning | What to do |
| :--- | :--- | :--- |
| `OK` | The analysis ran. | Read `data`. |
| `ERROR` | The analysis could not run (unreadable file, no module matches `--hlo_op`). | Fix the input; use `--mode=list_ops` to see valid names. |
| `UNIMPLEMENTED` | Unknown `--mode`. | Pick a mode from the table above. |
| `UNAVAILABLE` | This `xprof` build has no embedded LLO analysis support (`reason: LLO_STATIC_ANALYSIS_UNSUPPORTED_IN_BUILD`). | Install an `xprof` wheel from PyPI, or fall back to `get_llo_analysis` and `get_llo_debug_string`. |

## Example Usage

If the user asks "Is my Pallas kernel spilling?", you should:

1.  Confirm LLO data is present with `xprof get_llo_analysis <trace>`.
2.  Find the kernel:
    `xprof get_llo_static_analysis <trace> --mode=list_ops`.
3.  Run `xprof get_llo_static_analysis <trace> --mode=spills
    --hlo_op=<kernel>` and report `summary.total_spill_bytes` and
    `summary.static_spill_bundles`.
4.  If it spills, run `--mode=register_pressure` on the same kernel and point
    at the `hottest_bundles`, then use `--mode=source_for_bundle --bundle=<N>`
    to map the worst bundle back to source lines.
