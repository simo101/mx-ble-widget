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
    "dojo/text!MX-BLE-Widget/widget/templates/ConnectBLE.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

	var $ = _jQuery.noConflict(true);
	
    return declare("MX-BLE-Widget.widget.ConnectBLE", [_WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,
		// modeler
		characteristicNameField: null,
        objectToCreate: null,
        deviceIDField: null,
        deviceTypeField: null,
        serviceData: null,
		serviceDataUnits: null,
		serviceUUID: null,
		microflowToCall: null,
		buttonLabel: "",
        buttonClass: "",
        // Internal variables.
        _handles: null,
        _contextObj: null,
        _deviceIds: [],
		_myDevice: null,
		_myDeviceType: null, 
		
		// UUIDs and functions for TI 2650STK

			// Lux service
			LUX_SERVICE : "f000aa70-0451-4000-b000-000000000000",
			LUX_DATA_CHARACTERISTIC : "f000aa71-0451-4000-b000-000000000000",
			LUX_CONFIGURATION_CHARACTERISTIC : "f000aa72-0451-4000-b000-000000000000",

			// Temparature service
			THERMOMETER_SERVICE : "f000aa00-0451-4000-b000-000000000000",
			THERM_DATA_CHARACTERISTIC : "f000aa01-0451-4000-b000-000000000000",
			THERM_CONFIGURATION_CHARACTERISTIC : "f000aa02-0451-4000-b000-000000000000",

			// Battery
			BATTERY_SERVICE : "180f",
			BATTERY_LEVEL : "2a19",

        constructor: function() {
			logger.debug(this.id + ".constructor");
			console.log(this.id + ".constructor");
            this._handles = [];
        },

        postCreate: function() {
			logger.debug(this.id + ".postCreate");
			
			if (this.connectButtonClass) dojoClass.add(this.connectBtn, this.connectButtonClass);
			if (this.disconnectButtonClass) dojoClass.add(this.disconnectBtn, this.disconnectButtonClass);

			this.connectBtn.textContent = this.connectButtonLabel;
			this.disconnectBtn.textContent = this.disconnectButtonLabel;
			
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

        connectBLEDevice: function() {
            // find the device by name
			console.log("In connect BLE function");
			//mx.ui.info("In scan for BLE function", true); 
			//mx.ui.info("Device List: " + this._contextObj.get(this.deviceTypeList), true);
			//mx.ui.info("Device List value: " + mxobj.get(this.deviceTypeList), true);
			this._myDevice = this._contextObj.get(this.bleDeviceId);

			 
			logger.debug(this.id + ".connectBLEDevice");
            var self = this;
			
			//
			//mx.ui.info("Connecting : " + this._myDevice, true);

			ble.connect(
                    this._myDevice,
                    lang.hitch(this,function(data) {
						//mx.ui.info("device found, connecting: " + this._myDevice , true);
                        self._onConnect(data, this._myDevice);
						mx.ui.info("Connected to device: " + this._myDevice , true);
                    }),
                    lang.hitch(this,function(err) {
                        console.log('Error connecting to device');
                        console.log(err);
						mx.ui.info("Error connecting to device" + this._myDevice + " :error: " + err, true);
                    })
                )
			 //ble.connect(this._myDevice, this._onConnect, this._onError);
			//
			


        },
		disconnectBLEDevice: function() {
			this._myDevice = this._contextObj.get(this.bleDeviceId);
			logger.debug(this.id + ".connectBLEDevice");
			mx.ui.info("Disconnecting : " + this._myDevice, true);
            ble.disconnect(this._myDevice, function () {console.log("Disconnected device");}, 
			lang.hitch(this, function(reason){this._onError(reason, "DisconnectBLE");}));
        },

		_onConnect: function(data, uid){
			/*
			  // read Battery Level
			*/
			//mx.ui.info("Reading battery level for : " + uid, true);
			//mx.ui.info("Reading 2 battery level for : " + peripheral.id, true);
			// read battery level
			ble.read(
				uid,
				this.BATTERY_SERVICE,
				this.BATTERY_LEVEL,
				lang.hitch(this,this._onBattLevel),
				lang.hitch(this,function(reason){this._onError(reason,"Read Battery");})
			); 
			  // enable the io service , temperature sensor, light and battery service
			var data = new Uint8Array(1);
			data[0] = 1;
			
			//mx.ui.info("Setting config for I/O for : " + uid, true);
			
			ble.write(
				uid,
				this.THERMOMETER_SERVICE,
				this.THERM_CONFIGURATION_CHARACTERISTIC,
				data.buffer,
				lang.hitch(this,function () {console.log("Temp");}),
				lang.hitch(this,function(reason){this._onError(reason,"Therm Config");})
			);
			ble.write(
				uid,
				this.LUX_SERVICE,
				this.LUX_CONFIGURATION_CHARACTERISTIC,
				data.buffer,
				lang.hitch(this,function () {console.log("Lux");}),
				lang.hitch(this,function(reason){this._onError(reason,"Lux config");})
			);
            // subscribe to be notified when the temperature changes
			
			lang.hitch(this,ble.startNotification(
				uid,
				this.THERMOMETER_SERVICE,
				this.THERM_DATA_CHARACTERISTIC,
				lang.hitch(this,function(buffer) {
												//mx.ui.info("Calling temp change function",true);
												this._onTemperatureChange(buffer);
												}),
				lang.hitch(this,function (reason) { this._onError  (reason,"Temp notif");})
			));
			
          // subscribe to be notified when the light changes
			lang.hitch(this,ble.startNotification(
				uid,
				this.LUX_SERVICE,
				this.LUX_DATA_CHARACTERISTIC,
				lang.hitch(this,function (buffer) { this._onLuxChange(buffer);}),
				lang.hitch(this,function (reason) { this._onError  (reason,"Lux notif");})
			));        
			
			//mx.ui.info("Finished Setting config for I/O for : " + uid, true);
		},
		
		_onError: function(reason, procStep) {
			console.log("Error: Something went wrong but Widget seems to be working :" + reason ) ;
			mx.ui.info("In _onError: " + reason + " from " + procStep,true);
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
        },
		
		// Based on code from http://bit.ly/sensortag-temp
			_toCelsius : function(rawMeasurement) { // raw number should be unsigned 16 bit 
				var SCALE_LSB = 0.03125;
				return (rawMeasurement >> 2) * SCALE_LSB;
			},

			_toFahrenheit : function(rawMeasurement) {
					var celsius = this._toCelsius(rawMeasurement);
					return (celsius * 1.8 + 32.0);
				},

			// Lux conversion
			 _calcLux : function calculateLux(rawMeasurement)
			{


				var mantissa = rawMeasurement & 0x0FFF ;
				var exponent = rawMeasurement >> 12 ;

				var magnitude = Math.pow(2, exponent) 
				var output = (mantissa * magnitude) ;

				var lux = output / 100.0 ;

				// Return result.
				return lux ;
			},
		//
		   _onTemperatureChange: function(buffer) {
			// expecting 2 unsigned 16 bit values
			var data = new Uint16Array(buffer);

			var rawInfraredTemp = data[0];
			var rawAmbientTemp = data[1];

			var unit = 'C';
			//mx.ui.info("Calculating temp value for : " + rawAmbientTemp, true);
			var infraredTemp = this._toCelsius(rawInfraredTemp);
			var ambientTemp = this._toCelsius(rawAmbientTemp);
			
			//mx.ui.info("Saving temp data for : " + this._myDevice, true);
        // var unit = 'C';
        // var infraredTemp = toCelsius(rawInfraredTemp);
        // var ambientTemp = toCelsius(rawAmbientTemp);
		
			this._createData(this.THERMOMETER_SERVICE,'AMBIENT TEMPERATURE',ambientTemp.toString(),unit);
			this._createData(this.THERMOMETER_SERVICE,'INFRARED TEMPERATURE',infraredTemp.toString(),unit);

		},
		_onLuxChange: function(buffer) {
			// expecting 2 unsigned 16 bit values
			var data = new Uint16Array(buffer);

			var rawLux = data[0];
        
			var lux = this._calcLux(rawLux);
			//mx.ui.info("Lux value : " + lux, true);
			//mx.ui.info("Saving light data for : " + this._myDevice , true);
			
		    this._createData(this.LUX_SERVICE,'LIGHT INTENSITY',lux.toString(),'LUX');

		},
		
		_createData : function(characteristicUUID, characteristicName, characteristicValue, characteristicUnits)
		{
			mx.data.create ({
				entity: this.objectToCreate,
				callback: lang.hitch(this, function(obj) {
					obj.set(this.deviceIDField,this._myDevice);
					obj.set(this.deviceTypeField, 'AA80' );
					obj.set(this.serviceUUID,characteristicUUID);
					obj.set(this.characteristicNameField,characteristicName);
					obj.set(this.serviceData,characteristicValue);
					obj.set(this.serviceDataUnits,characteristicUnits);
					
					mx.data.action({
						params: {
							applyto: "selection",
							actionname: this.microflowToCall,
							guids: [obj.getGuid()]
						},
						origin: this.mxform,
						callback: function() {
						},
						error: function(error) {
							alert(error.message);
						}
					});
							
				}),
				err: function(e) {
                        console.log(e);
                    }
			}, this
			) ;
		},
	
		_onBattLevel: function(buffer) {

			var strData = String.fromCharCode.apply(null, new Uint8Array(buffer));
			var bl = strData.charCodeAt(0);

			//var message = 'Battery level: ' + bl + ' %' + '<br/>';
			//mx.ui.info("Saving battery data for : " + this._myDevice, true);
			
			 this._createData (this.BATTERY_SERVICE,'BATTERY LEVEL', bl, 'Percent') ;

		}
    });
});

require(["MX-BLE-Widget/widget/ConnectBLE"]);