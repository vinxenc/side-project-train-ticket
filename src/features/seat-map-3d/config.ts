// The 3D hero is built but switched off. No 3D pixels were drawn on the iOS 26.5
// simulator in two builds (transparent, then opaque canvas), there is no physical
// device to test on, and the render loop kept the CPU near 100% after the detail
// screen was left. To re-enable, set this to true and update the flag test (see the
// Round 3 logs in docs/journey-detail-checklist.md). Not exported from the barrel.
export const HERO_3D_ENABLED = false;
