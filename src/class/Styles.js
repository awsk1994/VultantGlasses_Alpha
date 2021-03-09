import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // text
  h1: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'white'
  },
  h2: {
    fontSize: 15,
    fontWeight: "bold",
    color: 'white'
  },
  p: {
    color: 'white'
  },
  grayText: {color: '#9e9e9e'},
  spinnerTextStyle: {
    color: '#FFF'
  },
  greenText: {color: 'green'},  // TODO: pick a better green

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
  bleMenuItem: {
    marginTop: 5,
    marginBottom: 5,
    borderColor: 'black',
    borderWidth: 1
  },

  // View
  lineStyle:{
    borderWidth: 0.5,
    borderColor:'#e0e0e0',
    margin: 10
  },
  flexRow: {
    flexDirection: 'row'
  },
  redThickBorder: {
    borderColor: "red",
    borderWidth: 5
  },
  whiteBorderBox: {
    borderColor: "white",
    borderWidth: 2,
  },
  basicBg: {
    padding: 10,
    backgroundColor: 'black',
    flex: 1
  },
  batteryComponent: {
    height: '30%',
  },

  // Components
  button: {
    margin: 10
  },
  BLEfuncButton: {
    padding: 10,
    height: '30%',
    // backgroundColor: 'gray',
    flex: 1, 
    height: 150
  },
  vultantButton: {
    height: '100%', 
    width: '100%'
  },
  container: {
    margin: 20
  },


  // Others
  absoluteView: {
    position: 'absolute',
    backgroundColor: 'transparent'
  },
});