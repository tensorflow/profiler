#ifndef THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_MOTION_H_
#define THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_MOTION_H_

namespace traceviewer::motion {

// Evaluates the CSS timing function `cubic-bezier(x1, y1, x2, y2)` at time `t`
// in [0, 1] and returns the eased progress. Like CSS, `x1` and `x2` must be in
// [0, 1]; `y1` and `y2` may overshoot. `t` is clamped to [0, 1].
float CubicBezier(float x1, float y1, float x2, float y2, float t);

// Material 3 "emphasized decelerate" easing: a fast start that settles gently.
// Used for content entering the screen (e.g. expanding a track).
inline float EmphasizedDecelerate(float t) {
  return CubicBezier(0.05f, 0.7f, 0.1f, 1.0f, t);
}

// Material 3 "standard" easing, used for content that stays on screen but
// changes (e.g. collapsing a track).
inline float Standard(float t) {
  return CubicBezier(0.2f, 0.0f, 0.0f, 1.0f, t);
}

// Moves `value` towards `target` with exponential smoothing at `rate` (in 1/s)
// over `delta_time` seconds. Frame-rate independent: two steps of dt/2 give the
// same result as one step of dt. Returns `target` once within `tolerance`.
float Approach(float value, float target, float rate, float delta_time,
               float tolerance = 0.004f);

}  // namespace traceviewer::motion

#endif  // THIRD_PARTY_XPROF_FRONTEND_APP_COMPONENTS_TRACE_VIEWER_V2_TIMELINE_MOTION_H_
