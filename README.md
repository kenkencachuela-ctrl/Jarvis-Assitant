# J.A.R.V.I.S. 2.0 — Android-friendly personal assistant

## Included
- Futuristic responsive interface and dashboard
- Voice input (browser speech recognition, where supported)
- Spoken replies (browser text-to-speech)
- Website launch commands: YouTube, Google, Gmail, Wikipedia, Facebook, TikTok, Instagram
- Google web search command
- Local notes, saved in this browser
- Device date/time and system status
- Installable PWA shell with offline caching

## Try it
Type or say:
- "What time is it?"
- "Open YouTube"
- "Search for space exploration"
- "Save a note buy a notebook"
- "Show system status"
- "Open notes"

## Run locally
From this folder:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`. For Android installation and microphone support, host it on HTTPS and open it in Chrome.

## Install on Android
1. Upload the folder contents to an HTTPS static host.
2. Open the HTTPS address in Chrome on Android.
3. Use Chrome menu → Install app / Add to Home screen.

## Important limitations
This is a web app, not a compiled APK. It cannot silently control Android settings, read private notifications, make calls, or run a permanent background wake word. Browsers may require a user tap before microphone access and voice recognition may vary by device/browser. The wake phrase "Hey JARVIS" is not always listening in this version.

## Connect a real AI brain
The front end sends `POST /api/chat` with `{ "message": "..." }` and expects `{ "reply": "..." }`. Dashboard checks `GET /api/health`.
Implement these routes on a trusted server and keep all provider API keys there. Never put secret keys in `app.js`.
