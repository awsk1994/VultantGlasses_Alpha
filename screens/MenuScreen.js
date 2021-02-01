import React from 'react';
import { AppRegistry, Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";
import { BleManager } from 'react-native-ble-plx';
import Storage from "../components/Storage";
import RNAndroidNotificationListener, { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import BLEUtils from "../components/BLEUtils";

// TODO: Reset Characteristic/Device functionality

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characteristic: null, // this.fetchObject('@characteristic'),
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      selectedDevice: null,
      selectedService: null,
      selectedCharacteristic: null,
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "02", // Hardcoded
      vMsgSAttri1: "23", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
    };
    console.log("MenuScreen");
    this.bleManager = new BleManager();
  };

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
    const appNameHex = BLEUtils.utf8ToHex(appName).substring(0,2);
    const contactHex = BLEUtils.utf8ToHex(contact).substring(0,2);
    const contentHex = BLEUtils.utf8ToHex(content).substring(0,2);

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

  componentDidMount() {
    console.log("componentDidMount start.");

    setTimeout(() => {
      this.fetchCharacteristic();
    }, 1000);

    setTimeout(this.setNotificationPermission, 1000);

    // Below is only for debugging purposes.
    setTimeout(() => {
      console.log("DEBUG | Read BLE info");
      this.connectBLE();
    }, 5000);
    
   };
   
  connectBLE = async () => {
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.scanAndConnect);
  }

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    if(this.bleManager != null || typeof this.bleManager != "undefined"){
      // this.bleManager.destroy();
    }
  }

  scanAndConnect = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      return
    }

    if(device.id != this.state.deviceId){
      console.log("Cannot find device.");
      return;
    }

    console.log("Found device!");
    this.bleManager.stopDeviceScan();
    device.connect()
      .then((device) => {
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        console.log(device.id);
        device.services().then((services) => {
         let service = services.find(service => service.uuid == this.state.serviceId);
          console.log("Found Service!");

          service.characteristics().then((characteristics) => {
            let characteristic = characteristics.find(c => c.uuid == this.state.characteristicId);
            console.log("Found characteristic!");
            this.setState({characteristic});
          })
        })
      })
      .catch((error) => {
        console.log(error);
      });

  };

  debug = () => {
    console.log("Debug | characteristic");
    console.log(this.state.characteristic);
  }

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

  resetBLEConnection = () => {
    this.setState({
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      selectedDevice: null,
      selectedService: null,
      selectedCharacteristic: null,
      characteristic: null
    });
    Storage.clearBLEStorage();
    // TODO: confirm below 2 lines of code.
    this.bleManager.destroy();
    this.bleManager = new BleManager();
  }

  updateMenuCharacteristic = (characteristic, peripheral) => {
    console.log("Menu Screen | updateMenuCharacteristic");

    const deviceId = peripheral.id;
    const deviceName = peripheral.name;
    const serviceId = characteristic.service;
    const characteristicId = characteristic.characteristic;
    this.setState({deviceName, deviceId, serviceId, characteristicId});

    console.log("deviceId = " + deviceId + ", deviceName = " + deviceName 
    + ", serviceId = "  + serviceId + ", characteristicId = " + characteristicId);
    Storage.saveText("@deviceId", deviceId);
    Storage.saveText("@serviceId", serviceId);
    Storage.saveText("@characteristicId", characteristicId);
    Storage.saveText("@deviceName", deviceName);
  };

  render() {
    return (
      <ScrollView>
        <Text style={styles.h1}>已链BLE接特征（Characteristic Connected）:</Text>
        <Text>{this.state.characteristic == null ? "False" : "True" }</Text>
        <Text style={styles.h1}>已保存BLE特征(Saved BLE)：</Text>
        <Text>装置名称（Device Name）: {this.state.deviceName}</Text>
        <Text>装置ID（Device Id）: {this.state.deviceId}</Text>
        <Text>服务ID（Service Id）: {this.state.serviceId}</Text>
        <Text>特征ID（Characteristic Id）: {this.state.characteristicId}</Text>

        <View style={styles.button}>
          <Button title="选择BLE装置（Choose Device）" onPress={() => {
                this.props.navigation.navigate("BLEMenu", {
                  updateMenuCharacteristic: this.updateMenuCharacteristic
                })
              }}/>
        </View>

        <View style={styles.button}>
          <Button title="链接到已保存BLE（Connect to saved BLE）" onPress={this.connectBLE}/>
        </View>

        <View style={styles.lineStyle}/>
        <Text style={styles.h2}>高级设置（Advanced Settings）</Text>

        <View style={styles.button}>
          <Button title="调试（Debug）" onPress={this.debug}/>
        </View>

        <View style={styles.button}>
          <Button title="重置BLE装置（Reset BLE Connection）" onPress={this.resetBLEConnection}/>
        </View>

        <View style={styles.button}>
          <Button title="从内存获取BLE资料（Fetch from Storage）" onPress={this.fetchCharacteristic}/>
        </View>

        {/* <Button title="Reset Characteristic" onPress={this.resetBLEConnection}/> */}
        {/* <BLEMenu
            updateCharacteristic={this.updateCharacteristic}
            updatedeviceName={this.updatedeviceName}
          /> */}
        {/* <DemoComponent/> */}

        <View style={styles.lineStyle}/>
        {this.state.characteristic == null && <View>
          <Text style={styles.h1}>没有链接的装置，请链接先（No BLE Connected. Please connect to a device!!!）</Text>
        </View>}
        {this.state.characteristic != null && <View>
          <Text style={styles.h2}>版面(Screens)</Text>
          <View style={styles.button}>
            <Button title="自定APP推送消息（Custom Notification）" onPress={() => {
              this.props.navigation.navigate("Notification", {
                characteristic: this.state.characteristic 
              });
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="记事本（Notes）" onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="ppt笔记（Cue Card）" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="设置（Settings）" onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.state.characteristic
              })}
            }/>
          </View>
        </View>}
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