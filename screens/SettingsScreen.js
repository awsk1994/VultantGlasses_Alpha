import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

/* TODO
1. Add settings types into SETTINGS
2. Make UI for each settings types
*/

// TODO: Stuck - 1. How to get Settings info? 2. Can I get all settings info in 1 go?

const SettingsType = {
  "boolean": 0,
  "numeric": 1,
  "text": 2,
  "language": 3
};

const SETTINGS = [
  {
    title: "Display TimeOut",
    type: SettingsType.numeric
  },
  {
    title: "Do Not Disturb",
    type: SettingsType.boolean
  },
  {
    title: "Language",
    type: SettingsType.language
  },
  {
    title: "App Enable/Disable",
    type: SettingsType.boolean
  },
  {
    title: "Bluetooth Device Name",
    type: SettingsType.text
  },
  {
    title: "Audio Loudness",
    type: SettingsType.numeric
  }
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
      {/* <Text>SettingsScreen</Text> */}
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