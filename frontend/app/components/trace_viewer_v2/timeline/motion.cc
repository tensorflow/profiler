#include "frontend/app/components/trace_viewer_v2/timeline/motion.h"

#include <algorithm>
#include <cmath>

namespace traceviewer::motion {
namespace {

// Evaluates one coordinate of a cubic Bezier curve with end points 0 and 1 and
// control points `p1` and `p2` at parameter `s`.
float Bezier(float p1, float p2, float s) {
  const float u = 1.0f - s;
  return 3.0f * u * u * s * p1 + 3.0f * u * s * s * p2 + s * s * s;
}

// The derivative of `Bezier` with respect to `s`.
float BezierDerivative(float p1, float p2, float s) {
  const float u = 1.0f - s;
  return 3.0f * u * u * p1 + 6.0f * u * s * (p2 - p1) + 3.0f * s * s * (1 - p2);
}

}  // namespace

float CubicBezier(float x1, float y1, float x2, float y2, float t) {
  t = std::clamp(t, 0.0f, 1.0f);
  if (t == 0.0f || t == 1.0f) return t;

  // Solve Bezier_x(s) = t for s. Newton's method converges in a few steps for
  // the well-behaved curves used for UI easing; bisection is the fallback when
  // the slope is too flat for Newton to be reliable.
  float s = t;
  for (int i = 0; i < 8; ++i) {
    const float error = Bezier(x1, x2, s) - t;
    if (std::abs(error) < 1e-5f) return Bezier(y1, y2, s);
    const float slope = BezierDerivative(x1, x2, s);
    if (std::abs(slope) < 1e-6f) break;
    s = std::clamp(s - error / slope, 0.0f, 1.0f);
  }
  float low = 0.0f;
  float high = 1.0f;
  s = t;
  for (int i = 0; i < 32; ++i) {
    const float x = Bezier(x1, x2, s);
    if (std::abs(x - t) < 1e-5f) break;
    if (x < t) {
      low = s;
    } else {
      high = s;
    }
    s = (low + high) * 0.5f;
  }
  return Bezier(y1, y2, s);
}

float Approach(float value, float target, float rate, float delta_time,
               float tolerance) {
  if (rate <= 0.0f || delta_time <= 0.0f) {
    return std::abs(target - value) <= tolerance ? target : value;
  }
  const float next =
      value + (target - value) * (1.0f - std::exp(-rate * delta_time));
  return std::abs(target - next) <= tolerance ? target : next;
}

}  // namespace traceviewer::motion
