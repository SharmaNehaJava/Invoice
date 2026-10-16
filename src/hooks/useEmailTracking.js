import { useEffect, useRef } from "react";
import { EMAIL_STATUSES, fetchEmailStatus, isFinalStatus } from "../lib/emailApi";

const POLL_MS = 60_000;
const TRACK_FOR_MS = 30 * 24 * 60 * 60 * 1000;

// Checks the latest tracking event for recent emails while the app is open,
// and tells the rep when a customer opens a quote.
export default function useEmailTracking(emails, setEmails, notify) {
  const emailsRef = useRef(emails);
  useEffect(() => {
    emailsRef.current = emails;
  }, [emails]);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const due = emailsRef.current.filter(
        (e) => !isFinalStatus(e.status) && Date.now() - new Date(e.sentAt).getTime() < TRACK_FOR_MS
      );
      for (const email of due) {
        try {
          const { status } = await fetchEmailStatus(email.id);
          if (cancelled || status === email.status) continue;
          const rank = (s) => EMAIL_STATUSES[s]?.rank ?? 0;
          // Ignore out-of-order events (e.g. "delivered" arriving after "opened").
          if (rank(status) < rank(email.status)) continue;

          setEmails((list) =>
            list.map((e) =>
              e.id === email.id
                ? { ...e, status, history: [...(e.history ?? []), { status, at: new Date().toISOString() }] }
                : e
            )
          );
          if (email.kind === "customer" && (status === "opened" || status === "clicked") && rank(email.status) < 3) {
            notify(`${email.customer} opened your quote ${email.quoteId}`);
          }
          if (status === "bounced") notify(`Email to ${email.to} bounced — check the address`, "error");
        } catch {
          // Offline or server not configured; try again on the next tick.
        }
      }
    };

    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [setEmails, notify]);
}
