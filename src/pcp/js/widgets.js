"use strict";
(function () {
    var fluid = window.fluid,
        gpii = fluid.registerNamespace("gpii");

    fluid.registerNamespace("gpii.pcp.widgets");

    gpii.pcp.widgets.noop = function () {
        // A function that does nothing.
    };

    // TODO handle empty array (add expander)
    fluid.defaults("gpii.pcp.widgets.dropdown", {
        gradeNames: "fluid.rendererComponent",
        model: {
            optionNames: [],
            optionList: [],
            selection: null
        },
        modelListeners: {
            "*": {
                this: "{that}",
                method: "refreshView",
                excludeSource: "init"
            }
        },
        attrs: {
            "aria-labelledby": "{that}.model.path"
        },
        selectors: {
            options: ".flc-dropdown-options"
        },
        protoTree: {
            options: {
                optionnames: "${optionNames}",
                optionlist: "${optionList}",
                selection: "${selection}"
            }
        },
        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.dom.options",
                method: "attr",
                args: ["{that}.options.attrs"]
            }
        },
        renderOnInit: true
    });

    fluid.defaults("gpii.pcp.widgets.button", {
        gradeNames: ["fluid.viewComponent"],
        label: null,
        selectors: {
            label: ".fl-btnLabel"
        },
        attrs: {
            // user provided attributes
        },
        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.container",
                method: "attr",
                args: ["{that}.options.attrs"]
            },
            "onCreate.bindClickEvt": {
                "this": "{that}.container",
                method: "click",
                args: ["{that}.onClick"]
            },
            "onCreate.initText": {
                "this": "{that}.dom.label",
                method: "text",
                args: ["{that}.options.label"]
            }
        },
        invokers: {
            onClick: {
                funcName: "gpii.pcp.noop"
            }
        }
    });

    fluid.defaults("gpii.pcp.widgets.textfield", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            input: ".flc-textfieldInput"
        },
        components: {
            textfield: {
                type: "fluid.textfield",
                container: "{that}.dom.input",
                options: {
                    model: "{gpii.pcp.widgets.textfield}.model",
                    attrs: {
                        "aria-labelledby": "{gpii.pcp.widgets.textfield}.model.path"
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.widgets.switch", {
        gradeNames: ["fluid.switchUI"],
        attrs: {
            "aria-labelledby": "{that}.model.path"
        },
        strings: {
            on: "On",
            off: "Off"
        }
    });

    /**
     * A function which is executed while the user is dragging the
     * thumb of a slider.
     * @param that {Component} An instance of a slider component.
     * @param container {Object} The jQuery object representing the
     * slider input.
     */
    gpii.pcp.widgets.onSlide = function (that, container) {
        var value = container.val();
        that.applier.change("stringValue", value, null, "slide");
    };

    fluid.defaults("gpii.pcp.widgets.slider", {
        gradeNames: ["fluid.textfieldSlider"],
        components: {
            slider: {
                options: {
                    listeners: {
                        "onCreate.bindSlideEvt": {
                            "this": "{that}.container",
                            "method": "on",
                            "args": ["input", "{that}.onSlide"]
                        },
                        "onCreate.bindRangeChangeEvt": {
                            "this": "{that}.container",
                            "method": "on",
                            "args": ["change", "{that}.onSlideEnd"]
                        }
                    },
                    invokers: {
                        onSlide: {
                            funcName: "gpii.pcp.widgets.onSlide",
                            args: ["{that}", "{that}.container"]
                        },
                        onSlideEnd: {
                            changePath: "number",
                            value: "{that}.model.value"
                        }
                    }
                }
            }
        }
    });

    /**
     * The `stepper` has two important model properties: `number` and
     * `value`. `number` is the actual value that this input represents.
     * `value` represents a temporary state which may not always be the
     * same as `number` (e.g. while the user is dragging the thumb of the
     * slider, `value` changes continuously while `number` changes only
     * when the user releases the thumb). This means that `number` should
     * be used if changes to the actual model value should be observed from
     * outer components.
     */
    fluid.defaults("gpii.pcp.widgets.stepper", {
        gradeNames: ["fluid.textfieldStepper"],
        scale: 2,
        attrs: {
            "aria-labelledby": "{that}.model.path"
        },
        modelRelay: {
            "value": {
                target: "value",
                singleTransform: {
                    type: "fluid.transforms.identity",
                    input: "{that}.model.number"
                }
            }
        },
        modelListeners: {
            "value": {
                changePath: "number",
                value: "{change}.value",
                excludeSource: ["init", "slide"]
            }
        },
        components: {
            slider: {
                type: "gpii.pcp.widgets.slider",
                container: "{that}.container",
                options: {
                    model: "{stepper}.model",
                    scale: "{stepper}.options.scale",
                    selectors: {
                        textfield: ".flc-textfieldStepper-field"
                    },
                    attrs: "{stepper}.options.attrs"
                }
            },
            textfield: {
                options: {
                    model: "{stepper}.model"
                }
            }
        }
    });

    fluid.defaults("gpii.pcp.widgets.multipicker", {
        gradeNames: ["fluid.rendererComponent"],
        model: {
            path: null,
            values: [],
            names: [],
            value: null
        },
        modelListeners: {
            "*": {
                this: "{that}",
                method: "refreshView",
                excludeSource: "init"
            }
        },
        attrs: {
            "aria-labelledby": "{that}.model.path"
        },
        selectors: {
            inputGroup: ".flc-multipicker",
            item: ".flc-multipickerItem",
            input: ".flc-multipickerInput",
            label: ".flc-multipickerLabel"
        },
        repeatingSelectors: ["item"],
        selectorsToIgnore: ["inputGroup"],
        protoTree: {
            expander: {
                type: "fluid.renderer.selection.inputs",
                rowID: "item",
                inputID: "input",
                labelID: "label",
                selectID: "{that}.model.path",
                tree: {
                    optionnames: "${names}",
                    optionlist: "${values}",
                    selection: "${value}"
                }
            }
        },
        listeners: {
            "onCreate.addAttrs": {
                "this": "{that}.dom.inputGroup",
                method: "attr",
                args: ["{that}.options.attrs"]
            }
        },
        renderOnInit: true
    });
})();
