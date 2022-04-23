import React from 'react';
import { Image, AppRegistry, Platform, Alert, TextInput, Button, View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { BleManager, Characteristic } from 'react-native-ble-plx';
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
import VButton from '../components/VButton';
import VStatus from '../components/VStatus';
import SendOsInfo from '../class/SendOsInfo';
import Writer from '../class/Writer'

// TODO: Reset Characteristic/Device functionality

const ENABLE_AUTO_CONNECT_FN = false

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
      appPermissionGranted: false,
      vMsgHeader: "A0", // Hardcoded
      vMsgPAttri: "02", // Hardcoded
      vMsgSAttri1: "23", // Hardcoded
      vMsgSAttri2: "00", // Hardcoded
      spinner: false,
      allowAppList: [],
      notificationPermissionStatus: false
    };
    // TODO: confirm whether this work?
    if(this.bleManager == null){
      console.log("DEBUG | Creating new BleManager.")
      this.bleManager = new BleManager();
      this.bleManager.onStateChange(this.onBleManagerStateChange);
    } else {
      console.log("DEBUG | BleManager already exist.")
    };
    this.props = props;

  };
  
  componentDidMount() {
    // TODO: use .then to reduce time waiting.
    console.log("componentDidMount start.");
    AppRegistry.registerHeadlessTask(RNAndroidNotificationListenerHeadlessJsName,	() => this.headlessNotificationListener);      
    
    setInterval(() => this.fetchCharacteristicFromStorage()
        .then(this.setNotificationPermission)
        .then(this._requestBluetoothPermissionAndStartSearch(true))
        .catch(err => {
          console.log("ERROR!");
          console.log(err);
          Alert.alert(err);
        }), 1000)
    this._checkBleState()
    if(ENABLE_AUTO_CONNECT_FN) {
      // Auto connect to saved BLE
      setInterval(() => {
        if(GlobalSettings.AutoConnectBLEUponStart){
          console.log("Scan for ble device (appPermissionGranted=" + this.state.appPermissionGranted + ")");
          console.log("bleState = "  + this.state.bleState + ", focusedScreen = " + this.props.navigation.isFocused());
          /*
            this.state.appPermissionGranted  // meaning request bluetooth permission is passed.
            this.state.characteristic == null  // meaning it is not already connected (must be either before choose device or after disconnect) 
            this.state.deviceName // ensure auto search only after deviceName is selected
            this.props.navigation.isFocused() == "Menu" // ensure we are not connecting from MenuScreen when we are on other screens (eg. BleMenuByName)
          */
          if(this.state.bleState == 'PoweredOn'
              && this.state.appPermissionGranted
              && this.state.characteristic == null
              && this.state.deviceName != null
              && this.props.navigation.isFocused()) {
            this.connectBLE();
          } else {
            console.log("auto connect ignored.");
          };
        }
      }, 5000);
    }

    // if(GlobalSettings.SetNotificationPermissionUponStart && Platform.OS === 'android')
    // {
    //   setTimeout(this.setNotificationPermission, 200);
    // }
    // this._requestBluetoothPermissionAndStartSearch(true);
  };

  componentWillUnmount() {
    console.log("ComponentUnMount");  // TODO: Getting error. Unable to detect when bleManager is undefined...
    this.bleManager.destroy();
  }
  
  // Permissions
  _requestBluetoothPermissionAndStartSearch = (debug = false) => {
    console.log("request bluetooth permission");
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
        debug ? debugPermissionStatus(statuses, "check#0") : null;
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
          console.log("appPermissionGranted");
          this.setState({appPermissionGranted: true});
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
      if (bleState === 'PoweredOff') {
        this._enableBluetoothAlert();
      }
    }).catch(err => {
      console.log("_checkBleState | ");
      console.log(err);
      Alert.alert(err);
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
  updateAllowAppListFromStorage = async () => {
    const allowAppList = await Storage.fetchList('@allowAppList');
    await this.setState({allowAppList})
  };

  headlessNotificationListener = async ({notification}) => {
    console.log("Notication received");
    if(this.state.characteristic != null){
      this.handleNotification(notification);
    } else {
      console.log("No characteristic connected. Cannot send notification.");
    }
  };

  handleNotification = async (notificationJsonStr) => {
    let notification = JSON.parse(notificationJsonStr);
    let app = notification.app
    let title = notification.title
    let text = notification.text
    console.log("Got notification: app = " + app + ", title = " + title + ", text = " + text);
    await this.updateAllowAppListFromStorage();
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
  setNotificationPermission = async () => {
    console.log("GlobalSettings.SetNotificationPermissionUponStart = " + GlobalSettings.SetNotificationPermissionUponStart + ", os = " + Platform.OS)
    if(GlobalSettings.SetNotificationPermissionUponStart && Platform.OS === 'android'){
      // To check if the user has permission, status can be 'authorized', 'denied' or 'unknown'
      const status = await RNAndroidNotificationListener.getPermissionStatus();
      console.log("Notification Permission status: " + status); 
      this.setState({notificationPermissionStatus: status})

      // To open the Android settings so the user can enable it
      // TODO: text needs to update.
      if(status != "authorized" && GlobalSettings.OpenNotificationPermissionTogglePage){
        Alert.alert('Requesting notification permission. Please enable.', null, [
          { text: '取消' },
          { text: "Go to Permission Page", onPress: () => RNAndroidNotificationListener.requestPermission()}
        ]);
      };
    }
  }

  writeNotificationMsg(appName, contact, content){
    console.log("writeNotificationMsg | Input utf8 | appName = " + appName 
      + ", contact = " + contact
      + ", content = " + content);
   
    const totalAppLenLimitInBytes = 200;

    const divider = "00";
    const appNameLenLimit = 10 * 2; // 10 characters * 2 bytes(chinese character) = 20 bytes
    const contactLenLimit = 10 * 2; // 20 bytes
    const dividerAndCountLen = 2  // 2 bytes
    const totalDividerAndCountLen = dividerAndCountLen * (2+3+1)  // 2 divider + 3 count + CRC
    const headerLen = 8 // 2 * 4 bytes
    // 200 - 20 - 20 - 12 - 8 = 140
    // 140 bytes = 140/2 = 70 characters (chinese， english = 140)
    const contentLenLimit = totalAppLenLimitInBytes - appNameLenLimit - contactLenLimit - totalDividerAndCountLen - headerLen;

    const appNameHex = BLEUtils.utf8ToUtf16Hex(appName).substring(0, appNameLenLimit);
    const contactHex = BLEUtils.utf8ToUtf16Hex(contact).substring(0, contactLenLimit);
    const contentHex = BLEUtils.utf8ToUtf16Hex(content).substring(0, contentLenLimit);

    const entireContentHex = BLEUtils.numStrToHex(appName.length) + appNameHex + divider
    + BLEUtils.numStrToHex(contact.length) + contactHex + divider
    + BLEUtils.numStrToHex(content.length) + contentHex;

    const hexMsgWithoutCRC = this.state.vMsgHeader 
    + this.state.vMsgPAttri
    + this.state.vMsgSAttri1
    + this.state.vMsgSAttri2
    + entireContentHex;
    const CRCHex = BLEUtils.sumHex(hexMsgWithoutCRC);
    const hexMsg = hexMsgWithoutCRC + CRCHex; // CRCHex = 2 digits = 2 byte * 2 = 4 bytes

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
    if(GlobalSettings.ShowAlert) {
      Alert.alert("writeNotificationMsg | hexMsg with CRC | " + hexMsg)
    }

    const SuccessWriteFn = () => {
      console.log('成功写入特征值, 现在点击读取特征值看看吧...');
      if(GlobalSettings.ShowAlert) {
        Alert.alert('成功写入特征值', hexMsg)
      }
      // // ToastAndroid.show('成功写入特征值, 现在点击读取特征值看看吧...', ToastAndroid.SHORT);
    };

    const ErrWriteFn = (err) => {
      console.log('写入特征值出错：', err)
      if(GlobalSettings.ShowAlert){
        Alert.alert('写入特征值出错：', err)
      }
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
      console.log(error.reason);
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
    this.setSpinner(true);

    console.log("Found device! Stopping device scan.");

    const connectService = (services) => {
      // let service = services.find(service => service.uuid == this.state.serviceId);
      let service = services[services.length - 1];
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
      let characteristic = characteristics[characteristics.length - 1];
      // let characteristic = characteristics.find(c => c.uuid == this.state.characteristicId);
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
        try{
          await device.discoverAllServicesAndCharacteristics();
        } catch (error){
          console.log("ERROR | " + error);
        }
        try {
          await device.services()
            .then(connectService)
            .then(connectCharacteristic)
            .then(() => {
              this.setState({
                  status: BLEStatus.connected
              });
              this.setSpinner(false);
            })
            .then(() => {
              AlertFn = (inpt) => Alert.alert(inpt)
              CloseSpinnerFn = () => this.setSpinner(false)
              SuccessWriteFn = Writer.WriteFn.NewSuccessWriteFn(CloseSpinnerFn, AlertFn)
              ErrWriteFn = Writer.WriteFn.NewErrWriteFn(CloseSpinnerFn, AlertFn)        
              if(GlobalSettings.SendOSInfoUponConnectBle) {
                SendOsInfo.send(Platform.OS, this.state.characteristic, SuccessWriteFn, ErrWriteFn)
              }
            });
        } catch (error) {
          console.log("ERROR | " + error);
        }
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
  }

  chooseDevice = () => {
    const subMsg = (characteristic) => {
      console.log("Attempt to subscribe event")
      // Alert.alert("Attempt to subscribe event")
      const subEventHandler = async (err, characteristic) => {
        console.log("Got subscription event")
        // Alert.alert("Got subscription event")
 
        val = characteristic.value
        if (val != null) {
          valLog = "Received Subscription Event | raw = " + val + ", str = " + BLEUtils.baseToStr(val)
          console.log(valLog);
          Alert.alert(valLog);  
        }
      }
      subEvent = characteristic.monitor(subEventHandler)
    }
    const updateMenuCharacteristic = (characteristic, deviceName, deviceId, serviceId, characteristicId) => {
      this.setState({characteristic, deviceName, deviceId, serviceId, characteristicId});
      this.setState({status: BLEStatus.connected});
      AlertFn = (inpt) => Alert.alert(inpt)
      CloseSpinnerFn = () => this.setSpinner(false)
      SuccessWriteFn = Writer.WriteFn.NewSuccessWriteFn(CloseSpinnerFn, AlertFn)
      ErrWriteFn = Writer.WriteFn.NewErrWriteFn(CloseSpinnerFn, AlertFn)
      if(GlobalSettings.SendOSInfoUponConnectBle) {
        SendOsInfo.send(Platform.OS, characteristic, SuccessWriteFn, ErrWriteFn)
      }
      subMsg(characteristic)
    };

    this.bleManager.stopDeviceScan();
    this.props.navigation.navigate("BLEMenu", {
      bleManager: this.bleManager,
      updateMenuCharacteristic: updateMenuCharacteristic,
      setSpinner: this.setSpinner
    });
  };

  chooseDeviceByName = () => {
    const updateMenuCharacteristic = (characteristic, deviceName, deviceId) => {
      this.setState({characteristic, deviceName, deviceId});
      this.setState({status: BLEStatus.connected});
    };

    this.bleManager.stopDeviceScan();
    // this.setState({autoScan: false});
    this.props.navigation.navigate("BLEMenuByName", {
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
          <VStatus text="No BLE Device Connected"/>
        </View>
      )
    }

    const selectConnectComponent = () => {
      return (
        <View>
          {/* <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
            <VButton text="Choose device by name" color="green" onPress={this.chooseDeviceByName}/>
            <VButton text="" color="empty"/>
          </View> */}
          <View style={[Styles.flexRow, {flexWrap: 'wrap'}]}>
            <VButton text="选择BLE装置（Choose Device)" color="green" onPress={this.chooseDevice}/>
            <VButton text="链接BLE装置（Connect to saved BLE）" color="green" onPress={this.connectBLE}/>
          </View>
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
        <View style={[Styles.batteryComponent, {flex: 0, padding: 20}]}>
          <VStatus text="Battery: 100%"/>
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
        <Text>
          <Text style={Styles.greenBoldText}>Status: </Text> 
          <Text style={Styles.greenText}>{this.state.status}, </Text>
          <Text style={Styles.greenBoldText}>BleState: </Text> 
          <Text style={Styles.greenText}>{this.state.bleState}, </Text>
          <Text style={Styles.greenBoldText}>appPermissionGranted: </Text> 
          <Text style={Styles.greenText}>{this.state.appPermissionGranted ? "true" : "false"}, </Text>
          <Text style={Styles.greenBoldText}>noCharacteristic: </Text> 
          <Text style={Styles.greenText}>{this.state.characteristic == null ? "true" : "false"}, </Text>
          <Text style={Styles.greenBoldText}>hasDeviceName: </Text> 
          <Text style={Styles.greenText}>{this.state.deviceName != null ? "true" : "false"}, </Text>
          <Text style={Styles.greenBoldText}>onMenuScreen: </Text> 
          <Text style={Styles.greenText}>{this.props.navigation.isFocused() ? "true" : "false"}, </Text>
          <Text style={Styles.greenBoldText}>service uuid: </Text> 
          <Text style={Styles.greenText}>{this.state.characteristic ? this.state.characteristic.serviceUUID : "NONE"}, </Text>
          <Text style={Styles.greenBoldText}>attribute uuid: </Text> 
          <Text style={Styles.greenText}>{this.state.characteristic ? this.state.characteristic.uuid : "NONE"}, </Text>
          <Text style={Styles.greenBoldText}>notification status: </Text> 
          <Text style={Styles.greenText}>{this.state.notificationPermissionStatus ? this.state.notificationPermissionStatus : "NONE"}, </Text>
        </Text>
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