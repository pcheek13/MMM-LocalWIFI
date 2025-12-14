Module.register("MMM-LocalWIFI", {
  defaults: {
    wifiInterface: "wlan0",
    statusCheckInterval: 60000,
    showPassword: false
  },

  start() {
    this.status = {
      enabled: false,
      ssid: "",
      online: false
    };
    this.inputs = {
      ssid: "",
      password: ""
    };
    this.showPanel = false;
    this.focusedField = "ssid";
    this.pendingMessage = "";
    this.boundHandler = null;
    this.bindDocumentEvents();
    this.sendSocketNotification("GET_STATUS", {
      wifiInterface: this.config.wifiInterface
    });
    this.scheduleUpdate();
  },

  getStyles() {
    return ["MMM-LocalWIFI.css"];
  },

  getTemplate() {
    return "templates/MMM-LocalWIFI.njk";
  },

  getTemplateData() {
    return {
      status: this.status,
      inputs: this.inputs,
      showPanel: this.showPanel,
      focusedField: this.focusedField,
      showPassword: this.config.showPassword,
      keypadLayout: this.getKeypadLayout(),
      message: this.pendingMessage
    };
  },

  getKeypadLayout() {
    return {
      top: "1234567890",
      upper: "QWERTYUIOP",
      home: "ASDFGHJKL",
      bottom: "ZXCVBNM",
      symbols: "!@#$%^&*()-_=+[]{}|;:'\"`,.<>/?\\"
    };
  },

  notificationReceived(notification) {
    if (notification === "DOM_OBJECTS_CREATED") {
      this.updateDom();
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "WIFI_STATUS") {
      this.status = payload;
      if (!this.inputs.ssid && payload.ssid) {
        this.inputs.ssid = payload.ssid;
      }
      this.updateDom();
    }
    if (notification === "WIFI_UPDATE_RESULT") {
      this.pendingMessage = payload.message;
      this.sendSocketNotification("GET_STATUS", {
        wifiInterface: this.config.wifiInterface
      });
      this.updateDom();
    }
  },

  scheduleUpdate() {
    const interval = Math.max(this.config.statusCheckInterval, 10000);
    setInterval(() => {
      this.sendSocketNotification("GET_STATUS", {
        wifiInterface: this.config.wifiInterface
      });
    }, interval);
  },

  bindDocumentEvents() {
    if (this.boundHandler) return;
    this.boundHandler = (event) => {
      const icon = event.target.closest(".wifi-icon");
      if (icon && this.isInModule(icon)) {
        this.showPanel = !this.showPanel;
        this.updateDom();
        return;
      }
      const key = event.target.closest(".keypad-key");
      if (key && this.isInModule(key)) {
        const value = key.dataset.value;
        this.appendCharacter(value);
        return;
      }
      const action = event.target.closest(".keypad-action");
      if (action && this.isInModule(action)) {
        const type = action.dataset.action;
        if (type === "backspace") {
          this.removeCharacter();
        } else if (type === "space") {
          this.appendCharacter(" ");
        } else if (type === "clear") {
          this.clearFields();
        }
        return;
      }
      const field = event.target.closest(".input-field");
      if (field && this.isInModule(field)) {
        this.focusedField = field.dataset.field;
        this.updateDom();
        return;
      }
      const submit = event.target.closest(".wifi-submit");
      if (submit && this.isInModule(submit)) {
        this.submitWifi();
      }
    };
    document.addEventListener("click", this.boundHandler);
  },

  isInModule(element) {
    return !!element.closest("#localwifi-wrapper");
  },

  appendCharacter(char) {
    const field = this.focusedField === "password" ? "password" : "ssid";
    this.inputs[field] = (this.inputs[field] || "") + char;
    this.updateDom();
  },

  removeCharacter() {
    const field = this.focusedField === "password" ? "password" : "ssid";
    this.inputs[field] = (this.inputs[field] || "").slice(0, -1);
    this.updateDom();
  },

  clearFields() {
    this.inputs = { ssid: "", password: "" };
    this.updateDom();
  },

  submitWifi() {
    const ssid = this.inputs.ssid.trim();
    const password = this.inputs.password;
    if (!ssid) {
      this.pendingMessage = "SSID required";
      this.updateDom();
      return;
    }
    this.pendingMessage = "Connecting...";
    this.sendSocketNotification("SET_WIFI", {
      ssid,
      password,
      wifiInterface: this.config.wifiInterface
    });
    this.updateDom();
  }
});
