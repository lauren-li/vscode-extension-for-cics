"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const disableProgramCommand_1 = require("./commands/disableProgramCommand");
const removeSessionCommand_1 = require("./commands/removeSessionCommand");
const enableProgramCommand_1 = require("./commands/enableProgramCommand");
const addSessionCommand_1 = require("./commands/addSessionCommand");
const newCopyCommand_1 = require("./commands/newCopyCommand");
const vscode_1 = require("vscode");
const phaseInCommand_1 = require("./commands/phaseInCommand");
const showAttributesCommand_1 = require("./commands/showAttributesCommand");
const filterProgramsCommand_1 = require("./commands/filterProgramsCommand");
const profileManagement_1 = require("./utils/profileManagement");
const CICSTree_1 = require("./trees/CICSTree");
const showTransactionAttributesCommand_1 = require("./commands/showTransactionAttributesCommand");
const showLocalFileAttributesCommand_1 = require("./commands/showLocalFileAttributesCommand");
const filterTransactionCommand_1 = require("./commands/filterTransactionCommand");
const clearProgramFilterCommand_1 = require("./commands/clearProgramFilterCommand");
const filterLocalFileCommand_1 = require("./commands/filterLocalFileCommand");
const zowe_explorer_api_1 = require("@zowe/zowe-explorer-api");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (profileManagement_1.ProfileManagement.apiDoesExist()) {
            const zoweExplorerApi = zowe_explorer_api_1.ZoweVsCodeExtension.getZoweExplorerApi();
            // the user does not have the CICS CLI Plugin installed and profiles created, yet.
            /**
             * This line will change when the profilesCache can take a new profile type to cache on refresh,
             * an addition planned for PI3.
             *
             * - This will also stop profiles leaking into MVS tree
             *
             */
            // the user does not have the CICS CLI Plugin installed and profiles created, yet.
            const meta = [
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
            yield zoweExplorerApi.getExplorerExtenderApi().initForZowe("cics", meta);
            const profilesCache = zoweExplorerApi.getExplorerExtenderApi().getProfilesCache();
            // ProfileManagement.getExplorerApis().registerMvsApi(new CicsApi());
            /** */
            // Important that this method is called after initForZowe() to avoid an exception
            profilesCache.registerCustomProfilesType("cics");
            // Explicit reload is required as registering does not do it automatically
            yield zoweExplorerApi.getExplorerExtenderApi().reloadProfiles();
            // some examples for access the profiles loaded for cics from disk
            const defaultCicsProfile = profilesCache.getDefaultProfile("cics");
            const profileNames = yield profilesCache.getNamesForType("cics");
            const profileName = profilesCache.loadNamedProfile(profileNames[0]).name;
            vscode_1.window.showInformationMessage("Zowe Explorer was modified for the CICS Extension: " + profileName);
        }
        const treeDataProv = new CICSTree_1.CICSTree();
        vscode_1.window
            .createTreeView("cics-view", {
            treeDataProvider: treeDataProv,
            showCollapseAll: true,
        })
            .onDidExpandElement((node) => {
            if (node.element.contextValue.includes("cicssession.")) {
            }
            else if (node.element.contextValue.includes("cicsplex.")) {
            }
            else if (node.element.contextValue.includes("cicsregion.")) {
                for (const child of node.element.children) {
                    child.loadContents();
                }
                treeDataProv._onDidChangeTreeData.fire(undefined);
            }
            else if (node.element.contextValue.includes("cicsprogram.")) {
            }
        });
        context.subscriptions.push(addSessionCommand_1.getAddSessionCommand(treeDataProv), removeSessionCommand_1.getRemoveSessionCommand(treeDataProv), 
        // getRefreshCommand(treeDataProv),
        newCopyCommand_1.getNewCopyCommand(treeDataProv), phaseInCommand_1.getPhaseInCommand(treeDataProv), enableProgramCommand_1.getEnableProgramCommand(treeDataProv), disableProgramCommand_1.getDisableProgramCommand(treeDataProv), showAttributesCommand_1.getShowRegionAttributes(), showAttributesCommand_1.getShowAttributesCommand(), showTransactionAttributesCommand_1.getShowTransactionAttributesCommand(), showLocalFileAttributesCommand_1.getShowLocalFileAttributesCommand(), filterProgramsCommand_1.getFilterProgramsCommand(treeDataProv), filterTransactionCommand_1.getFilterTransactionCommand(treeDataProv), filterLocalFileCommand_1.getFilterLocalFilesCommand(treeDataProv), clearProgramFilterCommand_1.getClearProgramFilterCommand(treeDataProv));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map