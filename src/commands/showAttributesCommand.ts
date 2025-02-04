/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { commands, window, WebviewPanel } from "vscode";
import { getAttributesHtml } from "../trees/webviewHTML";

export function getShowAttributesCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showAttributes",
    async (node) => {
      if (node) {
        const program = node.program;

        const attributeHeadings = Object.keys(program);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${program[heading]}</td></tr>`;
        }

        const webviewHTML = getAttributesHtml(program.program, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${program.program}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}

export function getShowRegionAttributes() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showRegionAttributes",
    async (node) => {
      if (node) {
        const region = node.region;

        const attributeHeadings = Object.keys(region);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..." /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${region[heading]}</td></tr>`;
        }

        const webviewHTML = getAttributesHtml(region.applid, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${region.applid}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS region selected");
      }
    }
  );
}
