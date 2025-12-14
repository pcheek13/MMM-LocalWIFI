# MMM-LocalWIFI

A MagicMirror² module that shows current Wi-Fi connectivity and lets you change the active network directly from the mirror using a full on-screen QWERTY keypad. The Wi-Fi symbol changes state when offline and opens a configuration panel when selected.

## Features
- Wi-Fi status icon that clearly shows online/offline state.
- Shows the connected SSID and whether Wi-Fi hardware is enabled.
- On-screen QWERTY keypad with letters, numbers, spaces, and special characters to cover any Wi-Fi password or SSID.
- In-mirror connection flow that sends credentials to `nmcli` to update the Raspberry Pi's Wi-Fi connection.
- Configurable interface name and refresh interval.

## Requirements
- MagicMirror² running on a Raspberry Pi (tested layout for Raspberry Pi 5).
- `nmcli` (NetworkManager) available for managing Wi-Fi connections.

## Installation (one copy/paste block)
```bash
cd ~/MagicMirror/modules && git clone https://github.com/your-org/MMM-LocalWIFI.git && cd MMM-LocalWIFI && npm install
```

## Configuration
Add the module to the `modules` array of your `config/config.js`:

```javascript
{
  module: "MMM-LocalWIFI",
  position: "top_right", // choose your position
  config: {
    wifiInterface: "wlan0", // set your Wi-Fi interface if different
    statusCheckInterval: 60000, // how often to poll status (ms)
    showPassword: false // set true to reveal password characters
  }
}
```

## Usage
1. Tap/click the Wi-Fi symbol on the mirror. It opens the panel showing the current SSID and online state.
2. Tap inside the SSID or Password field to choose which one receives keypad input.
3. Use the on-screen keypad (letters, numbers, punctuation, space, backspace, clear) to enter credentials.
4. Select **Connect** to send the new network details to `nmcli`. A status message shows success or errors returned by the system.

## Notes
- Changing Wi-Fi requires network permissions. Ensure the MagicMirror process has rights to run `nmcli` (e.g., via `sudoers` if necessary).
- The module reads connectivity by parsing `nmcli` output. If you use a different network manager, adapt `wifiInterface` or extend the helper accordingly.
