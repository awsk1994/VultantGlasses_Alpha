import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

/* TODO
1. Add settings types into SETTINGS
2. Make UI for each settings types
*/

const SETTINGS = [
  {title: "Display TimeOut"},
  {title: "Do Not Disturb"},
  {title: "Language"},
  {title: "App Enable/Disable"},
  {title: "Bluetooth Device Name"},
  {title: "Audio Loudness"},
];

const gridItem = (itemData) => {
  return (
    <View style={styles.gridItem}>
      <Text>{itemData.item.title}</Text>
    </View>
  )
}

const SettingsScreen = (props) => {
  return (
    <View>
      <Text>SettingsScreen</Text>
      <FlatList keyExtractor={(item, index) => item.id} data={SETTINGS} renderItem={gridItem}/>
    </View>
  )
}

const styles = StyleSheet.create({
  gridItem: {
    height: 60,
    borderWidth: 0.5,
    borderColor: 'gray',
  }
})

export default SettingsScreen;