import React from 'react';
import { Button, View, Text, StyleSheet } from 'react-native';

const MenuScreen = (props) => {
  return (
    <View>
      <View>
        <Text>Menu</Text>
      </View>
      <View>
        <View style={styles.button}>
          <Button title="Notification" onPress={() => {
            props.navigation.navigate("Notification")
          }}/>
        </View>
        <View style={styles.button}>
          <Button title="Notes" onPress={() => {
            props.navigation.navigate("Notes")
          }}/>
        </View>
        <View style={styles.button}>
          <Button title="Cue Card" onPress={() => {
            props.navigation.navigate("CueCard")
          }}/>
        </View>
        <View style={styles.button}>
          <Button title="Settings" onPress={() => {
            props.navigation.navigate("Settings")}
          }/>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  "button": {
    margin: 10
  }
})

export default MenuScreen;