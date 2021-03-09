import React from 'react';
import { Image, AppRegistry, Platform, Alert, TextInput, Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Storage from "../class/Storage";
import BLEUtils from "../class/BLEUtils";
import GlobalSettings from '../data/GlobalSettings';
import BLEFunctions from "../components/BLEFunctions";
import BLEStatus from "../data/BLEStatus";
import Spinner from 'react-native-loading-spinner-overlay';
import RNAndroidNotificationListener, { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import BlockAppTitleList from "../data/BlockAppTitleList";
import {checkMultiple, requestMultiple, PERMISSIONS, openSettings} from 'react-native-permissions';
import Utils from "../class/Utils";
import Styles from "../class/Styles";

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
      spinner: false,
      allowAppList: []
    };
    // TODO: confirm whether this work?
    if(this.bleManager == null){
      console.log("DEBUG | Creating new BleManager.")
      this.bleManager = new BleManager();
      this.bleManager.onStateChange(this.onBleManagerStateChange);
    } else {
      console.log("DEBUG | BleManager already exist.")
    };
  };
  
  componentDidMount() {
    // TODO: use .then to reduce time waiting.
    console.log("componentDidMount start.");
    this._checkBleState();
    this._requestBluetoothPermissionAndStartSearch(true);
    setTimeout(() => {this.fetchCharacteristicFromStorage()}, 100);

    if(GlobalSettings.SetNotificationPermissionUponStart && Platform.OS === 'android')
    {
      setTimeout(this.setNotificationPermission, 200);
    }
  };

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    this.bleManager.destroy();
  }

  // Permissions
  _requestBluetoothPermissionAndStartSearch = (debug = false) => {    
    if (Platform.OS === 'ios') {
      // TODO: need to request permission? I don't think so.
    } else {  // Android
      const requestedPermissions = [PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

      const debugPermissionStatus = (statuses, note) => {
        console.log(note + ' | coarse status: ', statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]);
        console.log(note + ' | fine status: ', statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
      };

      const isPermissionsGranted = (statuses) => statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] == 'granted' && statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] == 'granted';

      const requestPermissionIfNotGranted = (statuses) => {
        if(isPermissionsGranted(statuses)) {
          return true;
        } else {
          // TODO: add alert to remind user before proceeding.
          return requestMultiple(requestedPermissions).then((statuses) => {
            debug ? debugPermissionStatus(statuses, "check#1") : null;
            return isPermissionsGranted(statuses);
          });
        }
      };

      const autoConnectBLEUponStart = (granted) => {
        console.log("autoConnectBLEUponStart | granted = " + granted);
        if(granted){
          console.log("autoConnect");
          // Auto connect to saved BLE upon start
          if(GlobalSettings.AutoConnectBLEUponStart){
            setTimeout(() => {
              console.log("DEBUG | Read BLE info");
              if(this.state.bleState == 'PoweredOn')
                this.connectBLE(); // TODO: check bluetooth is turned on first.
            }, 300);
          };
        } else {
          Alert.alert('Permission not granted','Bluetooth-related functionalities will not work!',[{ text: '取消' }]);
        }
      };

      checkMultiple(requestedPermissions)
        .then(requestPermissionIfNotGranted)
        .then((granted) => autoConnectBLEUponStart(granted));
    };
  };

  // Bluetooth setting on/off
  onBleManagerStateChange = (state) => {
    console.log('蓝牙状态发生变化，新的状态为：', state)
    this.setState({
      bleState: state
    })
    if (state === 'PoweredOff') {
      this._enableBluetoothAlert();
    }
  };

  _checkBleState = () => {
    this.bleManager.state()
      .then(bleState => {
        console.log('_checkBleState | 检查蓝牙状态：', bleState)
        this.setState({bleState})
        if (state === 'PoweredOff') {
          this._enableBluetoothAlert();
        }
      });
  };

  _enableBluetoothAlert() {
    const enableBluetooth = () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:root=Bluetooth');
      } else {
        this.bleManager.enable();
      }
    };

    Alert.alert(
      '蓝牙未开启',
      '需要您开启蓝牙才能使用后续功能',
      [
        { text: '取消' },
        { text: '开启蓝牙', onPress: enableBluetooth }
      ]
    );
  };

  // Set up Notification
  setNotificationPermission = async () => {
    const updateAllowAppListFromStorage = async () => {
      Storage.fetchList('@allowAppList').then((allowAppList) => this.setState({allowAppList}));
    };

    const headlessNotificationListener = async (notification) => {
      if(this.state.characteristic != null){
        handleNotification(notification);
      } else {
        console.log("No characteristic connected. Cannot send notification.");
      }
    };

    const handleNotification = async (notification) => {
      const { app, title, text } = notification;
      console.log("Got notification: app = " + app + ", title = " + title + ", text = " + text);
      
      await updateAllowAppListFromStorage();
      if(this.state.allowAppList.indexOf(app) != -1){ 
        if(BlockAppTitleList.hasOwnProperty(app) && BlockAppTitleList[app].indexOf(title) != -1){ // app is in blockList and title is in blockList
          console.log("Notification App and Title is in block list. Will not display notification.");
          return;
        }
        this.writeNotificationMsg(app, title, text);
      } else {
        console.log("Notification Title is in not in allow list. Will not display notification.");
      }
    };

    // To check if the user has permission, status can be 'authorized', 'denied' or 'unknown'
    const status = await RNAndroidNotificationListener.getPermissionStatus();
    console.log("Notification Permission status: " + status); 

    // To open the Android settings so the user can enable it
    // TODO: text needs to update.
    if(status != "authorized" && GlobalSettings.OpenNotificationPermissionTogglePage){
      Alert.alert('Requesting notification permission. Please enable.', null, [
        { text: '取消' },
        { text: "Go to Permission Page", onPress: () => RNAndroidNotificationListener.requestPermission()}
      ]);
    };
    AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName,	() => headlessNotificationListener);      
  }

  writeNotificationMsg(appName, contact, content){
    console.log("writeNotificationMsg | Input utf8 | appName = " + appName 
      + ", contact = " + contact
      + ", content = " + content);
    
    const divider = "00";
    const appNameHex = BLEUtils.utf8ToUtf16Hex(appName).substring(0, GlobalSettings.NotificationCutOffLength);
    const contactHex = BLEUtils.utf8ToUtf16Hex(contact).substring(0, GlobalSettings.NotificationCutOffLength);
    const contentHex = BLEUtils.utf8ToUtf16Hex(content).substring(0, GlobalSettings.NotificationCutOffLength);

    const entireContentHex = BLEUtils.numStrToHex(appName.length) + appNameHex + divider
    + BLEUtils.numStrToHex(contact.length) + contactHex + divider 
    + BLEUtils.numStrToHex(content.length) + contentHex;

    const hexMsgWithoutCRC = this.state.vMsgHeader 
    + this.state.vMsgPAttri 
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + entireContentHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex;

    if(GlobalSettings.DEBUG){
      console.log("writeNotificationMsg | utf8 to hex | appName = " + appNameHex 
      + ", contact = " + contactHex
      + ", content = " + contentHex);
    
      console.log("writeNotificationMsg | getSize | appName = " + BLEUtils.numStrToHex(appName.length) 
        + ", contact = " + BLEUtils.numStrToHex(contact.length)
        + ", content = " + BLEUtils.numStrToHex(content.length));
      
      console.log("writeNotificationMsg | CRCHex | " + CRCHex);
      console.log("writeNotificationMsg | entireContentHex | " + entireContentHex);
    };

    console.log("writeNotificationMsg | hexMsg with CRC | " + hexMsg);

    const SuccessWriteFn = () => {
      console.log('成功写入特征值, 现在点击读取特征值看看吧...');
      // // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      Utils.genericErrAlert(err);
      // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
    }

    BLEUtils.writeHexOp(hexMsg, this.state.characteristic, SuccessWriteFn, ErrWriteFn);
  }
  
  connectBLE = async () => {
    // this.setSpinner(true);
    this.setState({status: BLEStatus.connecting_device});
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.scanAndConnect);
  }

  scanAndConnect = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR(" + error.errorCode + "):");
      console.log(error);
      this.setState({status: BLEStatus.error});
      Utils.genericErrAlert(error);
      return
    }

    // Add this option to settings.
    if(GlobalSettings.SearchDeviceById){
      if(device.id != this.state.deviceId){
        // console.log("Cannot find device (searched by deviceId).");
        return;
      }
    } else {
      if(device.name != this.state.deviceName){
        // console.log("Cannot find device (searched by deviceName).");
        return;
      }
    };

    this.setState({status: BLEStatus.found_device});
    this.bleManager.stopDeviceScan();
    console.log("Found device! Stopping device scan.");

    const connectService = (services) => {
      let service = services.find(service => service.uuid == this.state.serviceId);
      if(service == null){
        console.log("ERROR | cannot find service.");
        Utils.connectErrAlert("Cannot find service.");
        this.setState({status: BLEStatus.err_cannot_find_service});
      } else {
        console.log("Found Service!");
        this.setState({status: BLEStatus.found_service});
        // service.characteristics().then(connectCharacteristic);
        return service.characteristics();
      }
    }

    const connectCharacteristic = (characteristics) => {
      let characteristic = characteristics.find(c => c.uuid == this.state.characteristicId);
      if(characteristic == null){
        console.log("ERROR | cannot find characteristic.");
        Utils.connectErrAlert("Cannot find characteristic.");
        this.setState({status: BLEStatus.err_cannot_find_characteristic});
      } else {
        console.log("Found characteristic!");
        this.setState({status: BLEStatus.found_characteristic});
        this.setState({characteristic});
      }
    };

    this.bleManager.connectToDevice(device.id, {
      requestMTU: 512
    })
      .then(async (device) => {
        await device.discoverAllServicesAndCharacteristics();
        await device.services()
          .then(connectService)
          .then(connectCharacteristic)
          // .then(requestMTU)
          .then(() => this.setState({status: BLEStatus.connected}));
        // this.setSpinner(false);
      })
      .catch((error) => {
        console.log(error);
        Utils.genericErrAlert(error);
        this.setState({status: BLEStatus.error});
        // this.setSpinner(false);
      });
  };

  fetchCharacteristicFromStorage = async () => {
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

  chooseDevice = () => {
    const updateMenuCharacteristic = (characteristic, deviceName, deviceId, serviceId, characteristicId) => {
      this.setState({characteristic, deviceName, deviceId, serviceId, characteristicId});
      this.setState({status: BLEStatus.connected});
    };

    this.bleManager.stopDeviceScan();
    this.props.navigation.navigate("BLEMenu", {
      bleManager: this.bleManager,
      updateMenuCharacteristic: updateMenuCharacteristic,
      setSpinner: this.setSpinner
    });
  };

  gotoAppSettings = () => {
    console.log("go to app settings.");
    this.props.navigation.navigate("AppSettings", {
      setSpinner: this.setSpinner
    });
  };

  disconnectDevice = () => {
    this.setSpinner(true);

    if(this.state.characteristic == null){
      console.log("ERROR | characteristic not found");
      Utils.connectErrAlert("characteristic not found");
      this.setSpinner(false);
    };
    
    this.bleManager.cancelDeviceConnection(this.state.characteristic.deviceID)
      .then(() => {
        console.log("Disconnected from device.");
        this.setState({
          characteristic: null,
          status: BLEStatus.initial
        });
        this.setSpinner(false);
      })
      .catch(err => {
        console.log('写入特征值出错：', err)
        Utils.genericErrAlert(error);
        // ToastAndroid.show("ERROR: " + err, ToastAndroid.SHORT);
        this.setSpinner(false);
      });
  };

  setSpinner = (condition) => {
    this.setState({spinner: condition});
  }

  setAllowAppList = (v) => {
    this.setState({"allowAppList": v});
  }

  noCharacteristicView = () => {
    statusComponent = () => {
      return (
        <View style={[Styles.batteryComponent, {flex: 0, padding: 20}]}>
          <Text style={Styles.p}>No BLE Device connected...</Text>
          <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_battery.png")}/>
        </View>
      )
    }

    const selectConnectComponent = () => {
      return (
        <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
          <TouchableOpacity style={Styles.BLEfuncButton} onPress={this.chooseDevice}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
              <View style={Styles.absoluteView}>
                  <Text style={Styles.p}>选择BLE装置（Choose Device)</Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity style={Styles.BLEfuncButton} onPress={this.connectBLE}>
              <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_button.png")}/>
              <View style={Styles.absoluteView}>
                  <Text style={Styles.p}>链接BLE装置（Connect to saved BLE）</Text>
              </View>
              <Text style={Styles.p}>(Saved BLE device: {this.state.deviceName})</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={{flex: 1}}>
        {statusComponent()}
        {selectConnectComponent()}
      </View>
    )
  }

  hasCharacteristicView = () => {
    batteryComponent = () => {
      return (
        <View style={[Styles.batteryComponent, {flex: 0}]}>
          <Image resizeMode='contain' style={Styles.vultantButton} source={require("../img/demo_battery.png")}/>
        </View>
      )
    }

    return (
      <View style={{flex: 1}}>
        {batteryComponent()}
        <View style={{flex: 1}}>
          <BLEFunctions 
          setAllowAppList={this.setAllowAppList} 
          characteristic={this.state.characteristic} 
          navigation={this.props.navigation} setSpinner={this.setSpinner}
          disconnectDevice={this.disconnectDevice}/>
        </View>
      </View>
    )
  }

  
  
  // TODO: Button should have title: connect to {deviceName} <-- don't know how to make this dyanmic text possible.
  render() {
    return (
      <View style={[Styles.basicBg]}>
        <Text style={Styles.greenText}>Status: {this.state.status}, BleState: {this.state.bleState}</Text>
        {!this.state.characteristic && this.noCharacteristicView()}
        {this.state.characteristic && this.hasCharacteristicView()}

        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={Styles.spinnerTextStyle}
        />
        
        {/* <View style={Styles.lineStyle}/>
        <Button title="APP设置（App Settings）" onPress={this.gotoAppSettings}/> */}
        {/* <DemoComponent/> */}
      </View>
    )
  }
}

const styles = StyleSheet.create(
  {
      MainContainer:
      {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0
      }
  });

export default MenuScreen;