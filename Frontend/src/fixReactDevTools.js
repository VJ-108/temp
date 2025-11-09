// Prevent "Invalid argument not valid semver" crash from React DevTools

if (typeof window !== "undefined") {
  try {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      // Disable or safely stub methods to stop version check errors
      for (const key in hook) {
        if (typeof hook[key] === "function") {
          hook[key] = function () {};
        }
      }
    }
  } catch (err) {
    console.warn("React DevTools patch applied to prevent semver crash.");
  }
}
