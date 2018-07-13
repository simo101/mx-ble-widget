# mx-ble-widget
Add a widget to scan and connect to your BLE devices from a Mendix application. 

Widget built for [TI CC2650 SensorTag](http://ti.com/sensortag).

Requires PhoneGap plugin cordova-plugin-ble-central in your hybrid mobile Mendix application configuration.

Follow instructions at https://docs.mendix.com/howto/mobile/ to deploy your hybrid mobile application.

Thanks to Don Coleman (https://github.com/don) for the code and tutorials available at https://github.com/don/phonegap-ble-workshop

### Installation

1. Install the widget in your project
2. Include the ScanBLE widget in a context wrapper (i.e. Data Grid, List view) on a page. Include the ConnectBLE widget in the context for the 'Scanned Device Types' entity.
3. Create entities to store device types, scanned devices and device data.
  3a. Entity: AllowedDeviceTypes
      Attributes: deviceType , String
      Purpose: Provide a comma separated list of device type ids to limit the devices to be scanned.
      # The widget does not currently use this value. It is hardcoded to look for TI CC2650 sensors
  3b. Entity: ScannedDevices
      Attributes: deviceID, String
                  deviceName, String
                  deviceTyoe, String
                  deviceMfgData, String , unlimited
  3c. Entity: DeviceData
      Attributes: deviceID, String
                  deviceType, String
                  characteristicUUID, String
                  characteristicName, String
                  dataValue, String
                  dataUnits, String
4. Configure the widget's settings:
    ScanBLE
    1. On the **Input** tab, Configure:
        1. 'BLE Device Types' : set to the deviceType field of the enclosing AllowedDeviceTypes 
        2. 'Scan Time (seconds)': set to an integer value
    2. On the **Output** tab, Configure:
        1. 'Object to Create' : set to 'ScannedDevices' entity
        2. Map entity fields
    3. On the **Button** tab, Configure:
        1. 'Button Label' 
        2. 'Button Class' : optional  

    ConnectBLE
    1. On the **Input** tab, Configure:
        1. 'BLE Device ID' : set to the deviceID field of the enclosing ScannedDevices entity 

    2. On the **Device Data** tab, Configure:
        1. 'Object to Create' : set to 'DeviceData' entity
        2. Map entity fields


### Typical usage scenario



### Known Limitations

Only scans TI CC2650 sensors.

###### Based on the Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example

