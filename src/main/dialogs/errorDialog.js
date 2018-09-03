/**
 * Error dialog component
 *
 * An Electron BrowserWindow dialog that presents errors to the user.
 * Copyright 2016 Steven Githens
 * Copyright 2016-2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013) under grant agreement no. 289016.
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */
"use strict";

var fluid   = require("infusion");
var gpii    = fluid.registerNamespace("gpii");
var ipcMain = require("electron").ipcMain;

require("./basic/dialogWrapper.js");
require("../common/utils.js");

/**
 * A component that serves as simple interface for communication with the
 * electron `BrowserWindow` error dialog.
 */
fluid.defaults("gpii.app.errorDialog.channel", {
    gradeNames: ["gpii.app.i18n.channel"],

    events: {
        onErrorDialogCreated: null,
        onErrorDialogClosed: null,
        onContentHeightChanged: null
    },

    listeners: {
        "onCreate.registerChannel": {
            funcName: "gpii.app.errorDialog.channel.register",
            args: ["{that}"]
        },
        "onDestroy.deregisterChannel": {
            funcName: "gpii.app.errorDialog.channel.deregister"
        }
    },

    invokers: {
        update: {
            funcName: "gpii.app.notifyWindow",
            args: [
                "{dialog}.dialog",
                "onErrorUpdate",
                "{arguments}.0"
            ]
        }
    }
});

/**
 * Register for events from the managed Electron `BrowserWindow` (the renderer process).
 * @param {Component} that - The `gpii.app.errorDialog.channel` instance.
 */
gpii.app.errorDialog.channel.register = function (that) {
    ipcMain.on("onErrorDialogCreated", function () {
        that.events.onErrorDialogCreated.fire();
    });

    ipcMain.on("onErrorDialogClosed", function () {
        that.events.onErrorDialogClosed.fire();
    });

    ipcMain.on("onErrorDialogHeightChanged", function (event, height) {
        that.events.onContentHeightChanged.fire(height);
    });
};

/**
 * Removes the IPC listeners needed for the communication with the `BrowserWindow`
 * when the latter is about to be destroyed.
 */
gpii.app.errorDialog.channel.deregister = function () {
    ipcMain.removeAllListeners("onErrorDialogCreated");
    ipcMain.removeAllListeners("onErrorDialogClosed");
    ipcMain.removeAllListeners("onErrorDialogHeightChanged");
};

/**
 * A component that represent an error dialog and is used to display error messages
 * to the user. In order for an error to be properly displayed it requires the
 * following attributes: title, subheader, details and error code.
 */
fluid.defaults("gpii.app.errorDialog", {
    gradeNames: ["gpii.app.dialog", "gpii.app.scaledDialog"],

    scaleFactor: 1,
    defaultWidth: 400,
    defaultHeight: 250,

    config: {
        attrs: {
            title:   null,
            subhead: null,
            details: null,
            errCode: null,

            btnLabel1: null,
            btnLabel2: null,
            btnLabel3: null
        },
        fileSuffixPath: "errorDialog/index.html"
    },

    components: {
        dialogChannel: {
            type: "gpii.app.errorDialog.channel",
            options: {
                events: {
                    onContentHeightChanged: "{errorDialog}.events.onContentHeightChanged"
                },
                listeners: {
                    onErrorDialogCreated: {
                        funcName: "{errorDialog}.show"
                    },
                    onErrorDialogClosed: {
                        funcName: "{errorDialog}.hide"
                    }
                }
            }
        }
    },


    invokers: {
        show: {
            funcName: "gpii.app.errorDialog.show",
            args: [
                "{that}",
                "{that}.options.config.attrs"
            ]
        }
    }
});

/**
 * Update the current state of the error dialog, and show it.
 * Update is required as we're using a single Electron `BrowserWindow`
 *
 * @param {Component} that - The `gpii.app.errorDialog` component
 * @param {Object} errorConfig - Options for error dialog
 * @param {String} errorConfig.title - The error title
 * @param {String} errorConfig.subhead - The error subheader
 * @param {String} errorConfig.details - The details for the error
 * @param {String} errorConfig.errCode - The error code
 */
gpii.app.errorDialog.show = function (that, errorConfig) {
    that.dialogChannel.update(errorConfig);
    that.applier.change("isShown", true);
};

/*
 * A wrapper for the creation of error dialogs. See the documentation of the
 * `gpii.app.dialogWrapper` grade for more information.
 */
fluid.defaults("gpii.app.error", {
    gradeNames: "gpii.app.dialogWrapper",

    components: {
        dialog: {
            type: "gpii.app.errorDialog",
            options: {
                scaleFactor: "{gpii.app.error}.options.scaleFactor",
                config: {
                    attrs: "{arguments}.0"
                }
            }
        }
    }
});