
# Profile Collection Guide (`collect_profile`)

This guide explains how to capture XProf performance traces from accelerated ML
workloads across JAX, PyTorch (including Torch-XLA on Google Cloud TPU), and
TensorFlow, and prepare them for analysis with `xprof`.

--------------------------------------------------------------------------------

## 1. Overview & Storage Layout

XProf tools analyze trace data stored in standard TensorBoard profile directory
structures:

```
<logdir>/plugins/profile/<run_name>/
    ├── <worker0>.xplane.pb
    ├── <worker1>.xplane.pb
    └── ...
```

Traces can be collected using two primary paradigms:

1.  **Programmatic Tracing**: Embedded within the training script using
    framework-native profiler APIs.
2.  **On-Demand Remote Capture**: Running a lightweight profiler server on
    workers and capturing traces remotely via the XProf Web Server or client
    APIs without restarting workloads.

--------------------------------------------------------------------------------

## 2. JAX Workload Profiling

### Programmatic Tracing

Use `jax.profiler` directly in your Python code:

```python
import jax

# Option A: Context manager (recommended for specific loops or steps)
with jax.profiler.trace("/tmp/xprof_logs"):
  # Run 2-5 warm iterations
  for _ in range(5):
    step()

# Option B: Explicit start and stop
jax.profiler.start_trace("/tmp/xprof_logs")
step()
jax.profiler.stop_trace()
```

### Remote Profiling Server (On-Demand Capture)

Start a background profiler service inside your long-running JAX process:

```python
import jax

# Start profiler gRPC server on port 50051 before entering training loop
jax.profiler.start_server(port=50051)

while True:
  train_step()
```

### Low-Level Optimizer (LLO) & Custom Call Tracing (Cloud TPU)

To capture fine-grained VLIW instruction metrics and Low Level Optimizer (LLO)
disassembly for custom Pallas or Mosaic kernels, export `LIBTPU_INIT_ARGS`
**before importing JAX**:

```bash
export LIBTPU_INIT_ARGS="\
--xla_xprof_enable_custom_call_tracing=true \
--xla_xprof_register_llo_debug_info=true"
python your_jax_workload.py
```

--------------------------------------------------------------------------------

## 3. PyTorch & Torch-XLA Profiling

### Torch-XLA Remote Profiler Server (Cloud TPU)

For PyTorch workloads running on Cloud TPUs via Torch-XLA:

```python
import torch_xla.core.xla_model as xm
import torch_xla.debug.profiler as xp

# Start profiler server on master worker (port 50051)
server = xp.start_server(port=50051)

for step, batch in enumerate(dataloader):
  optimizer.zero_grad()
  loss = model(batch)
  loss.backward()
  xm.optimizer_step(optimizer)
```

### PyTorch Profiler Context Manager (GPU & CPU)

Use standard PyTorch profiler with TensorBoard trace output:

```python
import torch

with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    schedule=torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1),
    on_trace_ready=torch.profiler.tensorboard_trace_handler("/tmp/xprof_logs"),
    record_shapes=True,
    profile_memory=True,
    with_stack=True,
) as prof:
  for step, batch in enumerate(dataloader):
    train_step(batch)
    prof.step()
```

--------------------------------------------------------------------------------

## 4. TensorFlow Profiling

### Programmatic Tracing

```python
import tensorflow as tf

# Start trace
tf.profiler.experimental.start("/tmp/xprof_logs")

# Run 2-5 representative steps
for step in range(5):
  train_step()

# Stop trace and flush to disk
tf.profiler.experimental.stop()
```

### Remote Tracing via Client

Trigger a capture against a remote TensorFlow/JAX/Torch-XLA worker from Python:

```python
import tensorflow as tf

tf.profiler.experimental.client.trace(
    service_addr="localhost:50051",
    logdir="/tmp/xprof_logs",
    duration_ms=10000,
)
```

--------------------------------------------------------------------------------

## 5. XProf Server & Remote Web Capture

The `xprof` web server can capture profiles from any running profiler service
(JAX, PyTorch Torch-XLA, or TensorFlow):

### Step 1: Start XProf Server

```bash
xprof server --logdir=/tmp/xprof_logs --port=8791
```

### Step 2: Trigger Capture

-   **Via Web UI**: Open `http://localhost:8791`, click **Capture Profile**,
    enter `localhost:50051` in the Profile Service Address field, set Duration
    (e.g., `10000` ms), and click **Capture**.
-   **Via HTTP Endpoint**:

```bash
curl -X GET "http://localhost:8791/capture_profile?\
service_addr=localhost:50051&duration=10000"
```

The captured trace will be saved automatically to:
`/tmp/xprof_logs/plugins/profile/<run_name>/`.

--------------------------------------------------------------------------------

## 6. Analyzing Standalone Trace Files & Logdir Ingestion

If you already have a standalone `.xplane.pb` or `.trace.json.gz` file, you can
either analyze it directly or import it into a structured logdir.

### Direct File Analysis

You can pass the trace file path directly to any `xprof` CLI tool without
manual directory organization:

```bash
# Analyze a single trace file directly
xprof get_overview /path/to/trace.xplane.pb
xprof get_kpi_metrics /path/to/trace.xplane.pb
xprof get_roofline_model /path/to/trace.xplane.pb
```

### Ingestion into Logdir via `upload_trace`

To organize traces for multi-run comparisons or viewing in the XProf Web
Server UI, use `upload_trace` to import the trace into the standard
`<logdir>/plugins/profile/<run_name>/` hierarchy:

```bash
# Import a standalone trace file into a structured logdir
xprof upload_trace \
  --file_path=/path/to/trace.xplane.pb \
  --logdir=/tmp/xprof_logs \
  --run_name=run_01

# Start the Web Server to visualize all imported runs
xprof server --logdir=/tmp/xprof_logs --port=8791
```

Alternatively, you can manually copy files:

```bash
mkdir -p /tmp/xprof_logs/plugins/profile/run_01
cp /path/to/trace.xplane.pb /tmp/xprof_logs/plugins/profile/run_01/
xprof server --logdir=/tmp/xprof_logs --port=8791
```

--------------------------------------------------------------------------------

## 7. Best Practices & Mitigating Trace Drops

-   **Capture Steady State**: Avoid capturing during the first step (initial
    compilation and weight allocation can distort step metrics). Wait for step
    10 or higher.
-   **Trace Duration**: Profile 2–5 steps (typically 5–10 seconds). Capturing
    too many steps can exceed the on-device trace buffer size and trigger
    dropped events.
-   **Trace Buffer Dropped Events**: If the UI shows "Trace Buffer Dropped" or
    events appear truncated:
    1.  Reduce `--duration_ms` (e.g. from `30000` to `5000`).
    2.  Profile fewer chips per task if multi-chip tracing.
    3.  Lower host or python tracer levels if memory-constrained.

--------------------------------------------------------------------------------

## 8. Downstream Analysis Workflow

Once a profile is captured and available in `<logdir>`, analyze it using the
core deterministic tools:

```bash
# High-level breakdown (compute vs host vs communication)
xprof get_overview /tmp/xprof_logs

# Key performance indicators (step time, duty cycle, roofline)
xprof get_kpi_metrics /tmp/xprof_logs

# Program & op-level roofline analysis (compute vs memory bounds)
xprof get_roofline_model /tmp/xprof_logs

# Top operations by self-time
xprof get_top_hlo_ops /tmp/xprof_logs --limit=10

# Fine-grained timeline events
xprof list_xplane_events /tmp/xprof_logs --max_events=200000
```

See [SKILL.md](../SKILL.md) for the complete list of supported tools and
workflows.
