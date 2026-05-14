# Daily Brief — Expo Go Setup Guide

Follow these 5 steps once and the app runs on your iPhone forever.
Total time: ~10 minutes.

---

## Step 1 — Install Node.js on your PC

1. Go to **nodejs.org**
2. Download the **LTS** version (big green button)
3. Run the installer — click Next through everything, keep all defaults
4. When done, open **PowerShell** (search "powershell" in the Start menu) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x` — that means it worked.

---

## Step 2 — Create the Expo project

In PowerShell, run these commands **one by one**:

```
npx create-expo-app@latest DailyBrief --template blank
```
*(It will ask "Ok to proceed?" — type `y` and press Enter)*

```
cd DailyBrief
```

```
npx expo install expo-notifications expo-device @react-native-async-storage/async-storage expo-linear-gradient
```

---

## Step 3 — Copy the app files

1. Open the folder that was just created:
   `C:\Users\YourName\DailyBrief\`
   *(replace YourName with your actual Windows username)*

2. **Replace** the file `App.js` in that folder with the `App.js` from `d:\news app\`
3. **Replace** the file `app.json` in that folder with the `app.json` from `d:\news app\`

---

## Step 4 — Run the app

Back in PowerShell (make sure you're in the DailyBrief folder), run:

```
npx expo start
```

A QR code will appear in the terminal.

---

## Step 5 — Open on your iPhone

1. Download **Expo Go** from the App Store (it's free)
2. Open the **Camera** app on your iPhone
3. Point it at the QR code in the PowerShell window
4. Tap the yellow banner that appears
5. The app opens in Expo Go!

**When asked "Allow notifications?" — tap Allow.**
You'll get a notification every day at 12 PM.

---

## Step 6 — Add your OpenAI key (for AI summaries)

1. Go to **platform.openai.com** → sign up → click your profile → **API keys**
2. Click **Create new secret key** → copy it
3. In the app, tap ⚙️ (top right) → paste your key → tap **Save & Refresh**

> **Cost:** About $0.01–0.02 per day. Add a $5 credit and it lasts months.

---

## Make it feel like a real app (optional but recommended)

In Expo Go, long-press the app and tap **"Add shortcut"** — or on newer iOS, the app already appears in your home screen shortcuts.

For a true home screen icon like a native app, you'd need to build a standalone version (we can do this later via `eas build` — free tier available).

---

## Daily usage

- **Notifications**: Every day at 12 PM you'll get a push notification
- **Pull to refresh**: Swipe down on any tab to reload news
- **Tabs**: Switch between 🤖 AI, 🏀 NBA, 🎾 Padel, 👟 Sneakers
- **Read article**: Tap any card to open it in your browser
- **Cache**: News is cached for 6 hours so it loads instantly when you reopen

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` not found | Restart PowerShell after installing Node.js |
| QR code not scanning | Make sure your phone and PC are on the same WiFi |
| App shows "No articles" | Pull down to refresh; check your internet connection |
| No AI summary | Tap ⚙️ and add your OpenAI key |
| Notifications not arriving | Make sure you tapped "Allow" when the app first asked |
| Expo Go closes the app | Keep the `npx expo start` terminal window open |

---

## Keeping the app running

The app only works while `npx expo start` is running on your PC **and** your PC and iPhone are on the same WiFi.

To use it anywhere (not just home WiFi), run:
```
npx expo start --tunnel
```
This creates a public tunnel so you can use it on mobile data too.
