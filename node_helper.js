const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start() {
    this.status = {
      enabled: false,
      ssid: "",
      online: false
    };
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_STATUS") {
      this.checkStatus(payload.wifiInterface || "wlan0");
    }
    if (notification === "SET_WIFI") {
      this.connectWifi(payload);
    }
  },

  checkStatus(wifiInterface) {
    const statusCommand = `nmcli -t -f WIFI g`;
    const ssidCommand = `nmcli -t -f active,ssid dev wifi`; 
    exec(statusCommand, (statusError, statusStdout) => {
      if (statusError) {
        this.sendStatus(false, "", false);
        return;
      }
      exec(ssidCommand, (ssidError, ssidStdout) => {
        if (ssidError) {
          this.sendStatus(true, "", false);
          return;
        }
        const lines = ssidStdout.split("\n");
        const activeLine = lines.find((line) => line.startsWith("yes:")) || "";
        const ssid = activeLine.replace(/^yes:/, "").trim();
        const online = Boolean(ssid);
        this.sendStatus(true, ssid, online);
      });
    });
  },

  connectWifi({ ssid, password, wifiInterface }) {
    const escapedSsid = this.escapeShell(ssid);
    const escapedPassword = this.escapeShell(password);
    const command = password
      ? `nmcli device wifi connect '${escapedSsid}' password '${escapedPassword}' ifname '${wifiInterface || "wlan0"}'`
      : `nmcli device wifi connect '${escapedSsid}' ifname '${wifiInterface || "wlan0"}'`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        this.sendSocketNotification("WIFI_UPDATE_RESULT", {
          success: false,
          message: stderr ? stderr.trim() : "Connection failed"
        });
        return;
      }
      this.sendSocketNotification("WIFI_UPDATE_RESULT", {
        success: true,
        message: stdout ? stdout.trim() : "Connected"
      });
    });
  },

  sendStatus(enabled, ssid, online) {
    this.sendSocketNotification("WIFI_STATUS", {
      enabled,
      ssid,
      online
    });
  },

  escapeShell(value) {
    return String(value).replace(/'/g, "'\\''");
  }
});
