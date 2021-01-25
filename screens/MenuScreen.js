import React from 'react';
import { Button, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      characteristic: null
    }
  };

  updateCharacteristic = (newValue) => {
    this.setState({"characteristic": newValue});
  }

  render() {
    return (
      <ScrollView>
        <BLEMenu updateCharacteristic={this.updateCharacteristic} />    
        <DemoComponent characteristic={this.state.characteristic}/>

        <View style={styles.button}>
          <Button title="Notification" onPress={() => {
            this.props.navigation.navigate("Notification", {
              textA: this.state.textA // TODO: will pass characteristics in the future
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