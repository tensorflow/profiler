#include "frontend/app/components/trace_viewer_v2/timeline/motion.h"

#include <gtest/gtest.h>

namespace traceviewer::motion {
namespace {

TEST(MotionTest, CubicBezierEndpoints) {
  EXPECT_FLOAT_EQ(CubicBezier(0.05f, 0.7f, 0.1f, 1.0f, 0.0f), 0.0f);
  EXPECT_FLOAT_EQ(CubicBezier(0.05f, 0.7f, 0.1f, 1.0f, 1.0f), 1.0f);
}

TEST(MotionTest, CubicBezierClampsInput) {
  EXPECT_FLOAT_EQ(CubicBezier(0.2f, 0.0f, 0.0f, 1.0f, -1.0f), 0.0f);
  EXPECT_FLOAT_EQ(CubicBezier(0.2f, 0.0f, 0.0f, 1.0f, 2.0f), 1.0f);
}

TEST(MotionTest, LinearCurveIsIdentity) {
  // cubic-bezier(1/3, 1/3, 2/3, 2/3) is CSS `linear`.
  for (float t = 0.0f; t <= 1.0f; t += 0.125f) {
    EXPECT_NEAR(CubicBezier(1.0f / 3, 1.0f / 3, 2.0f / 3, 2.0f / 3, t), t,
                1e-4f);
  }
}

TEST(MotionTest, CssEaseMatchesReferenceValue) {
  // CSS `ease` = cubic-bezier(0.25, 0.1, 0.25, 1); browsers give ~0.8024 at
  // t = 0.5.
  EXPECT_NEAR(CubicBezier(0.25f, 0.1f, 0.25f, 1.0f, 0.5f), 0.8024f, 1e-3f);
}

TEST(MotionTest, CubicBezierFallsBackToBisectionWhenInitialSlopeIsFlat) {
  // For x1 = x2 = 0, Bezier_x(s) = s^3 and its derivative 3*s^2 is < 1e-6 at
  // the initial guess s = t = 1e-4, exercising the bisection fallback.
  // At s = cbrt(1e-4), Bezier_y(0, 1, s) = 3*(1-s)*s^2 + s^3 ~= 0.006265.
  EXPECT_NEAR(CubicBezier(0.0f, 0.0f, 0.0f, 1.0f, 1e-4f), 0.006265f, 1e-3f);
}

TEST(MotionTest, DeceleratingCurvesAreMonotonicAndFrontLoaded) {
  float previous_emphasized = 0.0f;
  float previous_standard = 0.0f;
  for (int i = 1; i <= 100; ++i) {
    const float t = i / 100.0f;
    const float emphasized = EmphasizedDecelerate(t);
    const float standard = Standard(t);
    EXPECT_GE(emphasized, previous_emphasized);
    EXPECT_GE(standard, previous_standard);
    previous_emphasized = emphasized;
    previous_standard = standard;
  }
  // Decelerating curves cover most of the distance early.
  EXPECT_GT(EmphasizedDecelerate(0.25f), 0.7f);
  EXPECT_GT(Standard(0.5f), 0.75f);
}

TEST(MotionTest, ApproachMovesTowardsTargetAndSnaps) {
  float value = 0.0f;
  value = Approach(value, 1.0f, /*rate=*/20.0f, /*delta_time=*/1.0f / 60.0f);
  EXPECT_GT(value, 0.0f);
  EXPECT_LT(value, 1.0f);
  for (int i = 0; i < 120; ++i) {
    value = Approach(value, 1.0f, 20.0f, 1.0f / 60.0f);
  }
  EXPECT_FLOAT_EQ(value, 1.0f);
}

TEST(MotionTest, ApproachIsFrameRateIndependent) {
  const float one_step = Approach(0.0f, 1.0f, 12.0f, 0.1f, /*tolerance=*/0.0f);
  const float two_steps = Approach(Approach(0.0f, 1.0f, 12.0f, 0.05f, 0.0f),
                                   1.0f, 12.0f, 0.05f, 0.0f);
  EXPECT_NEAR(one_step, two_steps, 1e-5f);
}

TEST(MotionTest, ApproachWithZeroTimeDoesNotMove) {
  EXPECT_FLOAT_EQ(Approach(0.25f, 1.0f, 20.0f, 0.0f), 0.25f);
}

}  // namespace
}  // namespace traceviewer::motion
