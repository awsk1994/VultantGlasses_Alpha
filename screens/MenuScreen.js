import React from 'react';
import { AppRegistry, TextInput, Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";
import { BleManager } from 'react-native-ble-plx';
import Storage from "../components/Storage";
import RNAndroidNotificationListener, { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import BLEUtils from "../components/BLEUtils";
import GlobalSettings from "../components/GlobalSettings";
import BLEFunctions from "../components/BLEFunctions";
import BLEStatus from "../components/BLEStatus";
import App from '../App';
import AppSettings from './AppSettings';

// TODO: Reset Characteristic/Device functionality

class MenuScreen extends React.Component {
  constructor(props) {
    console.log("MenuScreen");
    super(props);
    this.state = {
      status: BLEStatus.initial,
      characteristic: null, // this.fetchObject('@characteristic'),
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "02", // Hardcoded
      vMsgSAttri1: "23", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
    };
    this.bleManager = new BleManager();
  };

  componentDidMount() {
    console.log("componentDidMount start.");

    // Get characteristic from Storage
    setTimeout(() => {
      this.fetchCharacteristic();
    }, 1000);

    // Open notification permission (Android Settings)
    if(GlobalSettings.SetNotificationPermissionUponStart)
    {
      setTimeout(this.setNotificationPermission, 1000);
    }

    // Auto connect to saved BLE upon start
    if(GlobalSettings.AutoConnectBLEUponStart){
      setTimeout(() => {
        console.log("DEBUG | Read BLE info");
        this.connectBLE();
      }, 5000);
    };
  };

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    if(this.bleManager != null || typeof this.bleManager != "undefined"){
      // TODO: cancel device connection; bleManager.cancelDeviceConnection(deviceIdentifier: DeviceId): Promise<Device>; refer to https://github.com/Polidea/react-native-ble-plx/wiki/Device-Connecting
      // this.bleManager.destroy();
    }
  }

  // Set up Notification
  setNotificationPermission = async () => {
    // To check if the user has permission
    const status = await RNAndroidNotificationListener.getPermissionStatus()
    console.log("Notification Permission status");
    console.log(status) // Result can be 'authorized', 'denied' or 'unknown'

    // To open the Android settings so the user can enable it
    RNAndroidNotificationListener.requestPermission();
    AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName,	() => this.headlessNotificationListener);      
  }

  headlessNotificationListener = async (notification) => {
    if(this.state.characteristic != null){
      this.handleNotification(notification);
    } else {
      console.log("No characteristic connected. Cannot send notification.");
    }
  };

  handleNotification = (notification) => {
    const { app, title, text } = notification;
    console.log("Got notification: app = " + app + ", title = " + title + ", text = " + text);
    this.onPressWriteCharacteristic(app, title, text);
  }

  onPressWriteCharacteristic(appName, contact, content){
    console.log("onPressWriteCharacteristic | Input utf8 | appName = " + appName 
      + ", contact = " + contact
      + ", content = " + content);
    
    const divider = "00";
    // TODO: when message is too long, getting message timeout.
    const appNameHex = BLEUtils.utf8ToUtf16Hex(appName).substring(0,2);
    const contactHex = BLEUtils.utf8ToUtf16Hex(contact).substring(0,2);
    const contentHex = BLEUtils.utf8ToUtf16Hex(content).substring(0,2);

    console.log("onPressWriteCharacteristic | utf8 to hex | appName = " + appNameHex 
      + ", contact = " + contactHex
      + ", content = " + contentHex);
    
    console.log("onPressWriteCharacteristic | getSize | appName = " + BLEUtils.getHexSize(appNameHex) 
      + ", contact = " + BLEUtils.getHexSize(contactHex)
      + ", content = " + BLEUtils.getHexSize(contentHex));

    const entireContentHex = BLEUtils.getHexSize(appNameHex) + appNameHex + divider
    + BLEUtils.getHexSize(contactHex) + contactHex + divider 
    + BLEUtils.getHexSize(contentHex) + contentHex;

    console.log("onPressWriteCharacteristic | entireContentHex | " + entireContentHex);

    const hexMsg = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + entireContentHex;

    const CRCHex = BLEUtils.sumHex(hexMsg);
    console.log("onPressWriteCharacteristic | hexMsg with CRC | " + (hexMsg + CRCHex));

    let SuccessWriteFn2 = () => {
      console.log("Wrote successfully.");
    };

    let ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }

    BLEUtils.writeHexOp(hexMsg + CRCHex, this.state.characteristic, SuccessWriteFn2, ErrWriteFn);
  }
  
  connectBLE = async () => {
    this.setState({status: BLEStatus.connecting_device});
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.scanAndConnect);
  }

  scanAndConnect = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      return
    }

    // Add this option to settings.
    if(GlobalSettings.SearchDeviceById){
      if(device.id != this.state.deviceId){
        console.log("Cannot find device (searched by deviceId).");
        return;
      }
    } else {
      if(device.name != this.state.deviceName){
        console.log("Cannot find device (searched by deviceName).");
        return;
      }
    };

    this.setState({status: BLEStatus.found_device});
    this.bleManager.stopDeviceScan();
    console.log("Found device! Stopping device scan.");

    const connectService = (services) => {
      let service = services.find(service => service.uuid == this.state.serviceId);
       console.log("Found Service!");
       this.setState({status: BLEStatus.found_service});
       service.characteristics().then(connectCharacteristic);
       // TODO: handle service not found. And set status.
    }

    const connectCharacteristic = (characteristics) => {
      let characteristic = characteristics.find(c => c.uuid == this.state.characteristicId);
      console.log("Found characteristic!");
      this.setState({status: BLEStatus.found_characteristic});
      this.setState({characteristic});
      this.setState({status: BLEStatus.connected});
      // TODO: handle characteristic not found. And set status.
    };

    device.connect()
      .then((device) => {
        // TODO: handle device's service not found. And set status.
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        device.services().then(connectService);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  fetchCharacteristic = async () => {
    console.log("Fetching BLE information.");
    const deviceNamePromise = Storage.fetchText('@deviceName');
    deviceNamePromise.then((v) => this.setState({'deviceName': v}));

    const deviceIdPromise = Storage.fetchText('@deviceId');
    deviceIdPromise.then((v) => this.setState({'deviceId': v}));

    const servicePromise = Storage.fetchText('@serviceId');
    servicePromise.then((v) => this.setState({'serviceId': v}));

    const characteristicPromise = Storage.fetchText('@characteristicId');
    characteristicPromise.then((v) => this.setState({'characteristicId': v}));
  }

  updateMenuCharacteristic = (characteristic, deviceName, deviceId, serviceId, characteristicId) => {
    this.setState({characteristic, deviceName, deviceId, serviceId, characteristicId});
  };

  chooseDevice = () => {
    this.props.navigation.navigate("BLEMenu", {
      bleManager: this.bleManager,
      updateMenuCharacteristic: this.updateMenuCharacteristic
    });
  };

  gotoAppSettings = () => {
    console.log("go to app settings.");
    this.props.navigation.navigate("AppSettings", {});
  };

  // debug = () => {
  //   console.log("Debug | characteristic");
  //   console.log(this.state.characteristic);
  // }

  // resetBLEConnection = () => {
  //   this.setState({
  //     deviceName: null,
  //     deviceId: null,
  //     serviceId: null,
  //     characteristicId: null,
  //     selectedDevice: null,
  //     selectedService: null,
  //     selectedCharacteristic: null,
  //     characteristic: null
  //   });
  //   Storage.clearBLEStorage();
  //   // TODO: confirm below 2 lines of code.
  //   this.bleManager.destroy();
  //   this.bleManager = new BleManager();
  // }

  // TODO: Button should have title: connect to {deviceName} <-- don't know how to make this dyanmic text possible.
  render() {
    return (
      <ScrollView>
        <Text>Status: {this.state.status}</Text>
        <View style={styles.lineStyle}/>
        {/* <View>
          <Text style={styles.h1}>已链BLE接特征（Characteristic Connected）:</Text>
          <Text>{this.state.characteristic == null ? "False" : "True" }</Text>
          <Text style={styles.h1}>已保存BLE特征(Saved BLE)：</Text>
          <Text>装置名称（Device Name）: {this.state.deviceName}</Text>
          <Text>装置ID（Device Id）: {this.state.deviceId}</Text>
          <Text>服务ID（Service Id）: {this.state.serviceId}</Text>
          <Text>特征ID（Characteristic Id）: {this.state.characteristicId}</Text>
        </View> */}

        {!this.state.characteristic && <View>
          <Text style={styles.h1}>No BLE Device connected. Choose option below:</Text>
          <View style={styles.button}>
            <Button title="选择BLE装置（Choose Device）" onPress={this.chooseDevice}/>
          </View>

          <View style={styles.button}>
            <Button title="Connect to saved BLE" onPress={this.connectBLE}/>
            <Text>(Saved BLE device: {this.state.deviceName})</Text>
          </View>
        </View>}

        {this.state.characteristic && 
          <BLEFunctions characteristic={this.state.characteristic} navigation={this.props.navigation}/>
        }

        <Button title="App Settings" onPress={this.gotoAppSettings}/>

        {/* <DemoComponent/> */}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  "button": {
    margin: 10
  },
  lineStyle:{
    borderWidth: 0.5,
    borderColor:'black',
    margin:10,
  },
  h1: {
    fontSize: 20,
    fontWeight: "bold"
  },
  h2: {
    fontSize: 15,
    fontWeight: "bold"
  },
})

export default MenuScreen;