import React from 'react';
import { AppRegistry, Platform, Alert, TextInput, Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import Storage from "../components/Storage";
import BLEUtils from "../components/BLEUtils";
import GlobalSettings from "../components/GlobalSettings";
import BLEFunctions from "../components/BLEFunctions";
import BLEStatus from "../components/BLEStatus";
import Spinner from 'react-native-loading-spinner-overlay';
import RNAndroidNotificationListener, { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-android-notification-listener';
import BlockAppTitleList from "../data/BlockAppTitleList";
import {checkMultiple, requestMultiple, PERMISSIONS, openSettings} from 'react-native-permissions';

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
      this.bleManager.onStateChange(this.onStateChange);
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

      const onCheckPermission = (statuses) => {
        if(isPermissionsGranted(statuses)) {
          return true;
        } else {
          return requestMultiple(requestedPermissions).then((statuses) => {
            debug ? debugPermissionStatus(statuses, "check#1") : null;
            return isPermissionsGranted(statuses);
          });
        }
      };

      autoConnectBLEUponStart = (granted) => {
        console.log("autoConnectBLEUponStart | granted = " + granted);
        if(granted){
          console.log("autoConnect");
          // Auto connect to saved BLE upon start
          if(GlobalSettings.AutoConnectBLEUponStart){
            setTimeout(() => {
              console.log("DEBUG | Read BLE info");
              this.connectBLE();
            }, 300);
          };
        } else {
          Alert.alert('Permission not granted','Bluetooth-related functionalities will not work!',[{ text: '取消' }]);
        }
      };

      checkMultiple(requestedPermissions)
        .then(onCheckPermission)
        .then((granted) => autoConnectBLEUponStart(granted));
    };
  };

  // Bluetooth setting on/off
  onStateChange = (state) => {
    console.log('蓝牙状态发生变化，新的状态为：', state)
    this.setState({
      bleState: state
    })
    if (state === 'PoweredOff') {
      this._showBluetoothNotOpenAlert();
    }
  };

  _checkBleState = () => {
    this.bleManager.state()
      .then(state => {
        console.log('检查蓝牙状态：', state)
        this.setState({
          bleState: state
        })
        if (state === 'PoweredOff') {
          this._showBluetoothNotOpenAlert()
        }
      });
  };

  _showBluetoothNotOpenAlert() {
    const _onOpenBluetooth = () => {
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
        { text: '开启蓝牙', onPress: _onOpenBluetooth }
      ]
    );
  };

  // Set up Notification
  setNotificationPermission = async () => {
    const updateAllowAppListFromStorage = async () => {
      await Storage.fetchList('@allowAppList')
        .then((v) => this.setState({'allowAppList': v}));
    };

    const handleNotification = (notification) => {
      const { app, title, text } = notification;
      console.log("Got notification: app = " + app + ", title = " + title + ", text = " + text);
      
      if(this.state.allowAppList.indexOf(app) != -1){  // TODO: rename this to allowAppList --> app is in allowList
        if(BlockAppTitleList.hasOwnProperty(app) && BlockAppTitleList[app].indexOf(title) != -1){ // app is in blockList and title is in blockList
          console.log("Notification App and Title is in block list. Will not display notification.");
          return;
        }
        this.onPressWriteCharacteristic(app, title, text);
      } else {
        console.log("Notification Title is in not in allow list. Will not display notification.");
      }
    };

    const headlessNotificationListener = async (notification) => {
      if(this.state.characteristic != null){
        handleNotification(notification);
      } else {
        console.log("No characteristic connected. Cannot send notification.");
      }
    };

    // To check if the user has permission, status can be 'authorized', 'denied' or 'unknown'
    const status = await RNAndroidNotificationListener.getPermissionStatus()
    console.log("Notification Permission status: " + status); 
    
    await updateAllowAppListFromStorage();

    // To open the Android settings so the user can enable it
    // TODO: text needs to update.
    if(status != "authorized" && GlobalSettings.OpenNotificationPermissionTogglePage){
      Alert.alert('Requesting notification permission. Please enable.', null, [
        { text: '取消' },
        { text: "Go to Permission Page", onPress: () => RNAndroidNotificationListener.requestPermission()}
      ]);
    }
    AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName,	() => headlessNotificationListener);      
  }

  onPressWriteCharacteristic(appName, contact, content){
    console.log("onPressWriteCharacteristic | Input utf8 | appName = " + appName 
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
      console.log("onPressWriteCharacteristic | utf8 to hex | appName = " + appNameHex 
      + ", contact = " + contactHex
      + ", content = " + contentHex);
    
      console.log("onPressWriteCharacteristic | getSize | appName = " + BLEUtils.numStrToHex(appName.length) 
        + ", contact = " + BLEUtils.numStrToHex(contact.length)
        + ", content = " + BLEUtils.numStrToHex(content.length));
      
      console.log("onPressWriteCharacteristic | CRCHex | " + CRCHex);
      console.log("onPressWriteCharacteristic | entireContentHex | " + entireContentHex);
    };

    console.log("onPressWriteCharacteristic | hexMsg with CRC | " + hexMsg);

    const SuccessWriteFn = () => {
      console.log('成功写入特征值, 现在点击读取特征值看看吧...');
      // // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
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
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      console.log("error code = " + error.errorCode);

      // ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      // this.setSpinner(false);
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
        // ToastAndroid.show("ERROR | cannot find service.", ToastAndroid.SHORT);
        // TODO: handle error.
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
        // ToastAndroid.show("ERROR | cannot find characteristic.", ToastAndroid.SHORT);
        // TODO: handle error.
        this.setState({status: BLEStatus.err_cannot_find_characteristic});
      } else {
        console.log("Found characteristic!");
        this.setState({status: BLEStatus.found_characteristic});
        this.setState({characteristic});
      }
    };

    // const requestMTU = () => {
    //   console.log("Requesting MTU size to change to 512 bytes.");
    //   this.setState({status: BLEStatus.requesting_MTU})
    //   this.bleManager.requestMTU(this.state.characteristic.deviceID, 512)
    //   .then((mtu) => {
    //     // Success code
    //     console.log("MTU size changed to " + mtu + " bytes");
    //   })
    //   .catch((error) => {
    //     // Failure code
    //     console.log(error);
    //     this.setState({status: BLEStatus.error});
    //   });
    // };

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

  updateMenuCharacteristic = (characteristic, deviceName, deviceId, serviceId, characteristicId) => {
    this.setState({characteristic, deviceName, deviceId, serviceId, characteristicId});
  };

  chooseDevice = () => {
    this.bleManager.stopDeviceScan();
    this.props.navigation.navigate("BLEMenu", {
      bleManager: this.bleManager,
      updateMenuCharacteristic: this.updateMenuCharacteristic,
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
      // ToastAndroid.show("ERROR: characteristic not found", ToastAndroid.SHORT);
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
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Text>Status: {this.state.status}</Text>
        {/* <View style={styles.lineStyle}/> */}

        {!this.state.characteristic && <View>
          <Text style={styles.h1}>No BLE Device connected. Choose option below:</Text>
          <View style={styles.button}>
            <Button title="选择BLE装置（Choose Device）" onPress={this.chooseDevice}/>
          </View>

          <View style={styles.button}>
            <Button title="链接BLE装置（Connect to saved BLE）" onPress={this.connectBLE}/>
            <Text>(Saved BLE device: {this.state.deviceName})</Text>
          </View>
        </View>}

        {this.state.characteristic && <View>
            <BLEFunctions setAllowAppList={this.setAllowAppList} characteristic={this.state.characteristic} navigation={this.props.navigation} setSpinner={this.setSpinner}/>
            <View style={styles.button}>
              <Button color="#FF0000" title="断开设备（Disconnect from device）" onPress={this.disconnectDevice}/>
            </View>
          </View>
        }

        <View style={styles.lineStyle}/>
        <Button title="APP设置（App Settings）" onPress={this.gotoAppSettings}/>

        {/* <DemoComponent/> */}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF'
  },
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