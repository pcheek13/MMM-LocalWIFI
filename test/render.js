const path = require("path");
const assert = require("assert");
const nunjucks = require("nunjucks");

const env = nunjucks.configure(path.join(__dirname, "..", "templates"));
const templateData = {
  status: { enabled: true, ssid: "TestNet", online: false },
  inputs: { ssid: "TestNet", password: "secret" },
  showPanel: false,
  focusedField: "ssid",
  showPassword: false,
  keypadLayout: {
    top: "123",
    upper: "ABC",
    home: "DEF",
    bottom: "GHI",
    symbols: "!@#"
  },
  message: ""
};

const html = env.render("MMM-LocalWIFI.njk", templateData);

assert(html.includes("wifi-icon"), "Wi-Fi icon container should render");
assert(html.includes("wifi-svg"), "Inline SVG Wi-Fi symbol should render");
assert(/Offline/.test(html), "Offline state text should render");

console.log("Render test passed: Wi-Fi icon and offline state are present.");
