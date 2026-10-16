// navigator.clipboard only exists on HTTPS or localhost. Reps open the app on
// their phone over the LAN (plain http), so fall back to the legacy copy path.
export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

export const canShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

// Opens the phone's share sheet (Messages, WhatsApp, email...).
export async function shareText(text, title) {
  try {
    await navigator.share({ title, text });
    return true;
  } catch {
    return false;
  }
}
