# 📱 PWA Installation Guide - Web Push Notifications

Die App nutzt jetzt **Web Push Notifications**, die auf allen Plattformen funktionieren - auch auf iOS!

## ✅ Was funktioniert jetzt:

### Android (Chrome, Firefox, Edge)
- ✅ Push-Benachrichtigungen im Browser
- ✅ Push-Benachrichtigungen wenn als PWA installiert
- ✅ Funktioniert auch wenn Browser geschlossen ist

### iOS (Safari - ab iOS 16.4)
- ✅ Push-Benachrichtigungen **wenn als PWA installiert**
- ❌ Funktioniert NICHT im Browser direkt
- **Wichtig:** App muss auf dem Home Screen sein!

### Desktop (alle Browser)
- ✅ Push-Benachrichtigungen in allen modernen Browsern
- ✅ Funktioniert auch wenn Browser minimiert ist

---

## 📲 Installation auf iOS (iPhone/iPad)

### Schritt 1: Öffne die App in Safari
- Navigiere zu deiner App-URL
- **Wichtig:** Nur Safari unterstützt PWA Installation auf iOS!

### Schritt 2: Zum Home-Bildschirm hinzufügen
1. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben)
2. Scrolle nach unten und tippe auf **"Zum Home-Bildschirm"**
3. Gib einen Namen ein (z.B. "Earnings")
4. Tippe auf **"Hinzufügen"**

### Schritt 3: App vom Home Screen öffnen
- ❌ Öffne die App NICHT mehr über Safari
- ✅ Öffne sie vom Home Screen Icon
- Jetzt funktionieren Push-Benachrichtigungen!

### Schritt 4: Benachrichtigungen aktivieren
1. Gehe in der App zu **Settings**
2. Aktiviere **"Enable Notifications"**
3. iOS fragt nach Berechtigung → **"Erlauben"**
4. Aktiviere die gewünschten Features:
   - **Daily Earnings (6 AM)** - Tägliche Benachrichtigungen
   - **Change Detection** - Bei Änderungen in nächsten 7 Tagen

---

## 🤖 Installation auf Android

### Option 1: Im Browser nutzen (empfohlen)
1. Öffne die App in Chrome/Firefox/Edge
2. Klicke auf **"Enable Notifications"** in den Settings
3. Erlaube Push-Benachrichtigungen
4. Fertig! Funktioniert auch ohne Installation

### Option 2: Als PWA installieren
1. Tippe auf das **Menü** (3 Punkte oben rechts)
2. Wähle **"App installieren"** oder **"Zum Startbildschirm hinzufügen"**
3. Bestätige die Installation
4. App läuft jetzt wie eine native App!

---

## 💻 Installation auf Desktop

### Chrome/Edge/Brave
1. Klicke auf das **Install-Icon** in der Adressleiste (⊕ oder Download-Symbol)
2. Oder: Menü → "App installieren"
3. Bestätige die Installation

### Firefox
1. Öffne die Seite
2. Klicke auf das **Home-Icon** in der Adressleiste
3. Wähle "Zur Startseite hinzufügen"

### Safari (macOS)
1. Datei → "Zum Dock hinzufügen"
2. Oder als Lesezeichen speichern

---

## 🔔 Features der Push-Benachrichtigungen

### 1. Tägliche Earnings (6 Uhr morgens)
- Zeigt alle Earnings des Tages an
- Format: "5 Earnings Today - AAPL, MSFT, GOOGL and 2 more"
- Zeit ist anpassbar in den Settings

### 2. Change Detection
- Prüft alle 6 Stunden auf Änderungen
- Benachrichtigt wenn sich Earnings in den nächsten 7 Tagen ändern
- Erkennt: Neue Events, gelöschte Events, Zeitänderungen

### 3. Test Notification
- Button in den Settings um zu testen ob alles funktioniert
- Sendet sofort eine Test-Benachrichtigung

---

## 🔧 Troubleshooting

### iOS: Keine Benachrichtigungen
✅ **Checkliste:**
1. iOS 16.4 oder neuer installiert?
2. App vom Home Screen hinzugefügt?
3. App wird vom Home Screen Icon geöffnet (nicht Safari)?
4. Benachrichtigungen in den App-Settings aktiviert?
5. iOS-Systemeinstellungen: Benachrichtigungen für die App erlaubt?

### Android: Keine Benachrichtigungen
✅ **Checkliste:**
1. Chrome/Firefox/Edge Browser nutzen?
2. Benachrichtigungen in der App aktiviert?
3. Browser-Berechtigung erteilt?
4. Systemeinstellungen: Benachrichtigungen erlaubt?

### Desktop: Keine Benachrichtigungen
✅ **Checkliste:**
1. Browser-Berechtigung erteilt?
2. Betriebssystem: "Nicht stören"-Modus deaktiviert?
3. Browser läuft (kann im Hintergrund sein)?

---

## 🚀 Deployment

Die App funktioniert auf jedem HTTPS-Server:
- ✅ Vercel (empfohlen)
- ✅ Netlify
- ✅ GitHub Pages
- ✅ Firebase Hosting
- ✅ Eigener Server mit HTTPS

**Wichtig:** HTTPS ist Pflicht für PWA und Push-Benachrichtigungen!

---

## 📊 Browser-Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| PWA Installation | ✅ | ✅ | ✅ (iOS 16.4+) | ✅ |
| Push im Browser | ✅ | ✅ | ❌ | ✅ |
| Push als PWA | ✅ | ✅ | ✅ (iOS 16.4+) | ✅ |
| Background Sync | ✅ | ⚠️ | ❌ | ✅ |

---

## 🎉 Vorteile gegenüber Capacitor

✅ Kein App Store nötig
✅ Keine $99/Jahr für Apple Developer
✅ Keine Review-Prozesse
✅ Sofortige Updates (kein App-Update hochladen)
✅ Eine Codebasis für alle Plattformen
✅ Einfacher zu warten
✅ Funktioniert überall wo HTTPS läuft

---

Viel Erfolg! 🚀
