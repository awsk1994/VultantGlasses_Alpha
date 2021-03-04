import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // text
  h1: {
    fontSize: 20,
    fontWeight: "bold"
  },
  h2: {
    fontSize: 15,
    fontWeight: "bold"
  },
  grayText: {color: '#9e9e9e'},
  spinnerTextStyle: {
    color: '#FFF'
  },

  // item
  gridItem: {
    height: 60,
    borderWidth: 0.5,
    borderColor: 'gray',
  },
  appAllowItem: {
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  settingsItem: {
    padding: 30
  },
  settingsButtonItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  // View
  lineStyle:{
    borderWidth: 0.5,
    borderColor:'#e0e0e0',
    margin: 10
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row'
  },
  
  // Components
  button: {
    margin: 10
  },
});