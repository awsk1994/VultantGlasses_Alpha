import React from 'react';
import { Button, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BLEMenu from "../components/BLEMenu";
// import DemoComponent from "../components/DemoComponent";

// TODO: Reset Characteristic/Device functionality

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characteristic: null,
      deviceName: null
    }
  };

  updateCharacteristic = (newValue) => {
    this.setState({"characteristic": newValue});
  }

  updateDeviceName = (newValue) => {
    this.setState({"deviceName": newValue})
  }

  setBLEConnection = () => {
    this.setState({
      characteristic: null,
      deviceName: null
    })
  }

  render() {
    return (
      <ScrollView>
        <Text>Characteristic Selected: {this.state.characteristic == null ? "False" : "True" }</Text>
        <Text>Device Name: {this.state.deviceName}</Text>
        {/* <Button title="Reset Characteristic" onPress={this.setBLEConnection}/> */}
        
        {this.state.characteristic == null && 
          <BLEMenu 
            updateCharacteristic={this.updateCharacteristic}
            updateDeviceName={this.updateDeviceName}
          />}
        {/* <DemoComponent characteristic={this.state.characteristic}/> */}

        {this.state.characteristic != null && <View>
          <View style={styles.button}>
            <Button title="Notification" onPress={() => {
              this.props.navigation.navigate("Notification", {
                characteristic: this.state.characteristic // TODO: will pass characteristics in the future
              });
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Notes" onPress={() => {
              this.props.navigation.navigate("Notes", {
                textA: this.state.textA // TODO: will pass characteristics in the future
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Cue Card" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                textA: this.state.textA // TODO: will pass characteristics in the future
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="Settings" onPress={() => {
              this.props.navigation.navigate("Settings", {
                textA: this.state.textA // TODO: will pass characteristics in the future
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