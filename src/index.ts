require("babel-polyfill");
import "./load-style"; //load style dynamically(without specifying link tag in html) based on build env
// @ts-ignore
import Template = require('./components/Widget/index.marko');
const component = Template.renderSync();
const container = document.createElement("div");
container.id = "cb__toolbox_container";
document.body && document.body.appendChild(container);
component.appendTo(container);
