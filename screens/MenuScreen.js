import React from 'react';
import { Button, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";
import { BleManager } from 'react-native-ble-plx';
import Storage from "../components/Storage";

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
      selectedCharacteristic: null
    };
    console.log("MenuScreen");
    this.bleManager = new BleManager();
  };

  componentDidMount() {
    console.log("componentDidMount start.");

    // TODO: confirm setTimeout time.
    // setInterval(() => {
    //   this.fetchCharacteristic();
    // }, 20000);

    setTimeout(() => {
      this.fetchCharacteristic();
    }, 2000);

    // // Below is only for debugging purposes.
    // setTimeout(() => {
    //   console.log("DEBUG | Read BLE info");
    //   this.connectBLE();
    // }, 5000);
    
   };
   
  connectBLE = async () => {
    this.bleManager.startDeviceScan(null, {allowDuplicates: false}, this.scanAndConnect);
  }

  scanAndConnect = (error, device) => {
    if (error) {
      console.log("onScannedDevice | ERROR:");
      console.log(error);
      ToastAndroid.show("ERROR: " + error, ToastAndroid.SHORT);
      return
    }

    if(device.id != this.state.deviceId){
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

  resetBLEConnection = () => {
    this.setState({
      deviceName: null,
      deviceId: null,
      serviceId: null,
      characteristicId: null,
      selectedDevice: null,
      selectedService: null,
      selectedCharacteristic: null
    });
    Storage.clearBLEStorage();
  }

  render() {
    return (
      <ScrollView>
        <Text>Characteristic Selected: {this.state.characteristic == null ? "False" : "True" }</Text>
        <Text>Device Name: {this.state.deviceName}</Text>
        <Text>Device Id: {this.state.deviceId}</Text>
        <Text>Service Id: {this.state.serviceId}</Text>
        <Text>Characteristic Id: {this.state.characteristicId}</Text>

        <Button title="Reset BLE Connection" onPress={this.resetBLEConnection}/>
        <Button title="Start BLE Connection" onPress={this.connectBLE}/>

        {/* <Button title="Reset Characteristic" onPress={this.resetBLEConnection}/> */}
        
        <BLEMenu
            updateCharacteristic={this.updateCharacteristic}
            updateDeviceName={this.updateDeviceName}
          />
        {/* <DemoComponent/> */}

        {this.state.characteristic != null && <View>
          <View style={styles.button}>
            <Button title="Notification" onPress={() => {
              this.props.navigation.navigate("Notification", {
                characteristic: this.state.characteristic 
              });
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Notes" onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Cue Card" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                characteristic: this.state.characteristic
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Settings" onPress={() => {
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
  }
})

export default MenuScreen;