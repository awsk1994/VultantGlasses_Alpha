import React from 'react';
import { Button, View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// import BLEMenu from "../components/BLEMenu";
import DemoComponent from "../components/DemoComponent";

class MenuScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "textA": "This is text A"
    }
  };

  updateTextA = (newValue) => {
    this.setState({"textA": newValue});
  }

  render() {
    return (
      <View>
        {/* <BLEMenu/> */}    
        {/* TODO: need to wait for physical device to charge. */ }
        <DemoComponent textA={this.state.textA} updateTextA={this.updateTextA}/>
        <Text>MenuScreen | TextA = {this.state.textA}</Text>

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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  "button": {
    margin: 10
  }
})

export default MenuScreen;