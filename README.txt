Digiwork Condition B — Interruption MVP
=======================================

FILES:
  index.html       Host on GitHub Pages. Contains an email, a calendar, Yes/No buttons, and window.postMessage to Qualtrics.
  qualtrics_B1.js  Add to the existing Question B1 JavaScript. DO NOT replace its chatbot code.

GITHUB:
  1. New public repository: digiwork-interruption
  2. Add file -> Upload files -> index.html -> Commit changes.
  3. Settings -> Pages -> Deploy from a branch -> main -> /(root) -> Save.
  4. Copy the resulting HTTPS URL ending in /digiwork-interruption/index.html

QUALTRICS:
  1. Survey Flow: before Condition B, create Embedded Data:
       interrupt_B1_log, interrupt_B2_log, interrupt_B3_log, interrupt_B4_log
     Leave values empty.
  2. In Survey Builder choose B1 -> JavaScript. Keep the existing AI chatbot JavaScript.
  3. Paste the ENTIRE qualtrics_B1.js after the existing last closing });
  4. Replace PAGE_URL with the actual GitHub Pages URL.
  5. Save and preview the WHOLE survey. Every 30 seconds an in-page notification appears.
  6. Click Open email. Answer Yes (Monday 09:00 is free) in hosted calendar and return to unfinished B1.
  7. Test a second notification. Check Data & Analysis for interrupt_B1_log.
  8. Repeat B2-B4 by changing only TRIAL (e.g., var TRIAL="B2").

IMPORTANT NOTES:
  - The content is a SINGLE prototype appointment/calendar repeated across notifications. Before an actual experiment, design a pool of multiple comparable interruption items and an allocation strategy.
  - Desktop notification permission is optional and browser/device-dependent. In-survey alerts are reliable within a visible survey page.
  - JS timers may be delayed/throttled when the tab is backgrounded. Require a foreground survey tab for standardized timing.
  - Logs may be lost if a response is abandoned or if the page is closed before Qualtrics records data.
  - The popup is a full-page overlay INSIDE Qualtrics; the GitHub Pages content is loaded in an iframe. Qualtrics remains the main controller.
  - Do NOT put API keys or participant data into GitHub Pages HTML or public repository. This MVP sends only the trial label and an event token to the hosted page.
  - This needs full-surface testing in your institution's Qualtrics survey. Browser security/CSP may restrict iframing; if so, use a Qualtrics-native modal as a fallback.
