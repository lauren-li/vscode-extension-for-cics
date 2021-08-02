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

import { getDisableProgramCommand } from "./commands/disableProgramCommand";
import { getRemoveSessionCommand } from "./commands/removeSessionCommand";
import { getEnableProgramCommand } from "./commands/enableProgramCommand";
import { getAddSessionCommand } from "./commands/addSessionCommand";
import { getNewCopyCommand } from "./commands/newCopyCommand";
import { getRefreshCommand } from "./commands/refreshCommand";
import { ExtensionContext, window } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import { CicsApi } from "./utils/CicsSession";
import {
  getShowAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";
import { ProfileManagement } from "./utils/profileManagement";
import { CICSTree } from "./trees/CICSTree";
import { getShowTransactionAttributesCommand } from "./commands/showTransactionAttributesCommand";
import { getShowLocalFileAttributesCommand } from "./commands/showLocalFileAttributesCommand";
import { getFilterTransactionCommand } from "./commands/filterTransactionCommand";
import { getClearProgramFilterCommand } from "./commands/clearProgramFilterCommand";
import { getFilterLocalFilesCommand } from "./commands/filterLocalFileCommand";
import { ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";
import * as cics from "@zowe/cics-for-zowe-cli";
import { ICommandProfileTypeConfiguration } from "@zowe/imperative";

export async function activate(context: ExtensionContext) {

  if (ProfileManagement.apiDoesExist()) {
    const zoweExplorerApi = ZoweVsCodeExtension.getZoweExplorerApi();
      // the user does not have the CICS CLI Plugin installed and profiles created, yet.
    /**
     * This line will change when the profilesCache can take a new profile type to cache on refresh,
     * an addition planned for PI3.
     * 
     * - This will also stop profiles leaking into MVS tree
     * 
     */
     // the user does not have the CICS CLI Plugin installed and profiles created, yet.
  const meta: ICommandProfileTypeConfiguration[] = [
    {
        type: "cics",
        schema: {
            type: "object",
            title: "CICS Profile",
            description: "A cics profile is required to issue commands in the cics command group that interact with " +
                "CICS regions. The cics profile contains your host, port, user name, and password " +
                "for the IBM CICS management client interface (CMCI) server of your choice.",
            properties: {
                host: {
                    type: "string",
                    optionDefinition: {
                        name: "host",
                        aliases: ["H"],
                        description: "The CMCI server host name",
                        type: "string",
                        required: true,
                    },
                },
                port: {
                    type: "number",
                    optionDefinition: {
                        name: "port",
                        aliases: ["P"],
                        description: "The CMCI server port",
                        type: "number",
                        defaultValue: 1490,
                    },
                },
                user: {
                    type: "string",
                    secure: true,
                    optionDefinition: {
                        name: "user",
                        aliases: ["u"],
                        description: "Your username to connect to CICS",
                        type: "string",
                        implies: ["password"],
                        required: true,
                    },
                },
                password: {
                    type: "string",
                    secure: true,
                    optionDefinition: {
                        name: "password",
                        aliases: ["p"],
                        description: "Your password to connect to CICS",
                        type: "string",
                        implies: ["user"],
                        required: true,
                    },
                },
                regionName: {
                    type: "string",
                    optionDefinition: {
                        name: "region-name",
                        description: "The name of the CICS region name to interact with",
                        type: "string"
                    },
                },
                cicsPlex: {
                    type: "string",
                    optionDefinition: {
                        name: "cics-plex",
                        description: "The name of the CICSPlex to interact with",
                        type: "string"
                    },
                },
                rejectUnauthorized: {
                    type: "boolean",
                    optionDefinition: {
                        name: "reject-unauthorized",
                        aliases: ["ru"],
                        description: "Reject self-signed certificates.",
                        type: "boolean",
                        defaultValue: true,
                        required: false,
                        group: "Cics Connection Options"
                    }
                },
                protocol: {
                    type: "string",
                    optionDefinition: {
                        name: "protocol",
                        aliases: ["o"],
                        description: "Specifies CMCI protocol (http or https).",
                        type: "string",
                        defaultValue: "https",
                        required: true,
                        allowableValues: { values: ["http", "https"], caseSensitive: false },
                        group: "Cics Connection Options"
                    }
                }
            },
            required: ["host"],
        },
        createProfileExamples: [
            {
                options: "cics123 --host zos123 --port 1490 --user ibmuser --password myp4ss",
                description: "Create a cics profile named 'cics123' to connect to CICS at host zos123 and port 1490"
            }
        ]
    }
];
  await zoweExplorerApi.getExplorerExtenderApi().initForZowe("cics", meta);
     const profilesCache = zoweExplorerApi.getExplorerExtenderApi().getProfilesCache();
    // ProfileManagement.getExplorerApis().registerMvsApi(new CicsApi());

    /** */
// Important that this method is called after initForZowe() to avoid an exception
profilesCache.registerCustomProfilesType("cics");
// Explicit reload is required as registering does not do it automatically
await zoweExplorerApi.getExplorerExtenderApi().reloadProfiles();
 // some examples for access the profiles loaded for cics from disk
 const defaultCicsProfile = profilesCache.getDefaultProfile("cics");
 const profileNames = await profilesCache.getNamesForType("cics");
 const profileName = profilesCache.loadNamedProfile(profileNames[0]).name;

    window.showInformationMessage(
      "Zowe Explorer was modified for the CICS Extension: " + profileName
    );
  }

  const treeDataProv = new CICSTree();
  window
    .createTreeView("cics-view", {
      treeDataProvider: treeDataProv,
      showCollapseAll: true,
    })
    .onDidExpandElement((node) => {
      if (node.element.contextValue.includes("cicssession.")) {
      } else if (node.element.contextValue.includes("cicsplex.")) {
      } else if (node.element.contextValue.includes("cicsregion.")) {

        for (const child of node.element.children) {
          child.loadContents();
        }
        treeDataProv._onDidChangeTreeData.fire(undefined);

      } else if (node.element.contextValue.includes("cicsprogram.")) {
      }
    });

  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    getRemoveSessionCommand(treeDataProv),

    // getRefreshCommand(treeDataProv),

    getNewCopyCommand(treeDataProv),
    getPhaseInCommand(treeDataProv),

    getEnableProgramCommand(treeDataProv),
    getDisableProgramCommand(treeDataProv),


    getShowRegionAttributes(),
    getShowAttributesCommand(),
    getShowTransactionAttributesCommand(),
    getShowLocalFileAttributesCommand(),

    getFilterProgramsCommand(treeDataProv),
    getFilterTransactionCommand(treeDataProv),
    getFilterLocalFilesCommand(treeDataProv),

    getClearProgramFilterCommand(treeDataProv),
  );
}

export function deactivate() { }
