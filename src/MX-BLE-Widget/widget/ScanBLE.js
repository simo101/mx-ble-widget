define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "MX-BLE-Widget/lib/jquery-1.11.2",
    "dojo/text!MX-BLE-Widget/widget/templates/ScanBLE.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

	var $ = _jQuery.noConflict(true);
	
    return declare("MX-BLE-Widget.widget.ScanBLE", [_WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,
		// modeler
		deviceTypeList: null,
		scanTime: null,
        objectToCreate: null,
        deviceIDField: null,
        deviceTypeField: null,
        deviceMfgDataField: null,
		deviceMfgDataField: null,
		microflowToCall: null,
        // Internal variables.
        _handles: null,
        _contextObj: null,
        _deviceIds: [],

        constructor: function() {
			logger.debug(this.id + ".constructor");
			console.log(this.id + ".constructor");
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
			// convert deviceTypeList string to Array

            //this._scanForBLEDevice(this.deviceTypeList, this.scanTime);
			if (this.buttonClass) dojoClass.add(this.scanBtn, this.buttonClass);

            this.scanBtn.textContent = this.buttonLabel ;
			
			this._updateRendering();
			_contextObj = context.getTrackObject();

        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        scanForBLEDevices: function() {
            // find the device by name
			console.log("In scan for BLE function");
			//mx.ui.info("In scan for BLE function", true); 
			//mx.ui.info("Device List: " + this._contextObj.get(this.deviceTypeList), true);
			//mx.ui.info("Device List value: " + mxobj.get(this.deviceTypeList), true);
			var scanTheseDevices = this._contextObj.get(this.deviceTypeList);
			logger.debug(this.id + ".scanForBLEDevices");
            var self = this;
			//mx.ui.info("Device List: " + scanTheseDevices);
            console.log(ble);
            if (ble && typeof ble.scan === "function") {
                ble.scan(
                    //scanTheseDevices ? [scanTheseDevices] : [],
					['AA80'],
                    this.scanTime,
                    function(device) {
                        self._onDeviceFound(device);
                    },
                    function(err) {
                        console.log('there was an error');
                        console.log(err);
                    }
                )
            }
        },

        _onDeviceFound: function(deviceInfo) {
            // TODO: filter for particular device
            var self = this;
			//mx.ui.info("In _onDeviceFound for: " + deviceInfo.name, true); 
            console.log(deviceInfo);
            console.log(`ByteLength: ${deviceInfo.advertising.byteLength}`);
			// Create row in entity storing BLE devices scanned
			mx.data.create ({
				entity: this.objectToCreate,
				callback: lang.hitch(this, function(obj) {
					obj.set(this.deviceIDField,deviceInfo.id);
					obj.set(this.deviceNameField,deviceInfo.name);
					obj.set(this.deviceTypeField, deviceInfo.advertising.kCBAdvDataServiceUUIDs );
					obj.set(this.deviceMfgDataField,JSON.stringify(deviceInfo.advertising));
					
					
					mx.data.commit({
							mxobj: obj,
							callback: function() {
									console.log("Object committed");
								},
							error: function(e) {
								console.error("Could not commit object:", e);
							}
							});
							
				}),
				err: function(e) {
                        console.log(e);
                    }
			}, this
			) ;
		},

        __padRightTo16Chars: function(text) {
            if (text.length >= 16)
                return text;
            else {
                while (text.length > 16) {
                    text += '0'
                }
                return text;
            }
        },

        __getUniqueIdFromAdvertising(ab) {
            return new Uint8Array(ab)
                .map(function(num) {
                    return num > 15 ? (num).toString(16) : '0' + (num).toString(16)
                })
                .join('')
        },


        _callMicroflow: function(mf, param) {
            mx.data.action({
                params: {
                    actionname: mf,
                    applyto: "selection",
                    guids: [param.getGuid()]
                },
                callback: function(res) {
                    console.log('success')
                },
                error: function(err) {
                    console.log('error')
                }
            })
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["MX-BLE-Widget/widget/ScanBLE"]);