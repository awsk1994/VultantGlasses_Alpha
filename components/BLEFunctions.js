import React from "react";
import { View, Text, Button, StyleSheet } from 'react-native';
import GlobalSettings from "./GlobalSettings";

class BLEFunctions extends React.Component { 
  constructor(props) {
    super();
  };

  componentDidUpdate(prevProps){
    // if(GlobalSettings.DEBUG){
    //   console.log("BLEFunctions | componentDidUpdate | props is ");
    //   console.log(this.props);
    // }
  };

  render() {
    return (
      <View>
        {/* {this.props.characteristic == null && 
          <View>
            <Text style={styles.h1}>没有链接的装置，请链接先（No BLE Connected. Please connect to a device!!!）</Text>
          </View>
        } */}
        <View>
          {/* <Text style={styles.h2}>版面(Screens)</Text> */}
          <View style={styles.button}>
            <Button title="自定APP推送消息（Custom Notification）" onPress={() => {
              this.props.navigation.navigate("Notification", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              });
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="记事本（Notes）" onPress={() => {
              this.props.navigation.navigate("Notes", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="ppt笔记（Cue Card）" onPress={() => {
              this.props.navigation.navigate("CueCard", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner
              })
            }}/>
          </View>
          <View style={styles.button}>
            <Button title="眼镜设置（Glasses Settings）" onPress={() => {
              this.props.navigation.navigate("Settings", {
                characteristic: this.props.characteristic,
                setSpinner:  this.props.setSpinner,
                setAllowAppFilter: this.props.setAllowAppFilter
              })}
            }/>
          </View>
        </View>
      </View>
    );
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

export default BLEFunctions;
