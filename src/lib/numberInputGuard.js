/**
 * Stops the mouse wheel from silently editing `<input type="number">`.
 *
 * Browsers treat a wheel event over a *focused* number input as an increment /
 * decrement. In this app those fields are money and stock quantities — a
 * scroll past a focused Price Per Unit field would quietly rewrite the rate
 * and the order total, with nothing on screen to say it happened.
 *
 * Why blur instead of `preventDefault()`:
 * `preventDefault()` also cancels the page scroll, so the wheel would appear
 * dead whenever the cursor sat over the field — painful in a tall form like
 * the GRN modal. Blurring drops focus, which is the only thing that made the
 * value editable, and the scroll then proceeds normally.
 *
 * Why the capture phase:
 * capture listeners on `document` run before the target's own default action,
 * so focus is already gone by the time the increment would have applied.
 *
 * Registered once from `main.jsx`, so it covers every number input in the app
 * (Purchase, Inventory, Stock, HRMS, …) including plain `<input>` elements
 * that don't go through the shared `Input` component.
 */
export function installNumberInputWheelGuard() {
  if (typeof document === "undefined") return () => {};

  const handleWheel = (event) => {
    const el = event.target;
    if (
      el instanceof HTMLInputElement &&
      el.type === "number" &&
      document.activeElement === el
    ) {
      el.blur();
    }
  };

  document.addEventListener("wheel", handleWheel, {
    passive: true,
    capture: true,
  });

  return () =>
    document.removeEventListener("wheel", handleWheel, { capture: true });
}
