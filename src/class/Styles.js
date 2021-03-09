import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // text
  h1: {
    fontSize: 30,
    fontWeight: "bold",
    color: 'white'
  },
  
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: 'white'
  },
  notes_h1: {
    fontSize: 30,
    // fontWeight: 'bold',
    color: '#77CCD4'
  },
  notes_h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#77CCD4'
  },
  p: {
    color: 'white'
  },
  notes_p: {
    color: '#77CCD4'
  },
  grayText: {color: '#9e9e9e'},
  spinnerTextStyle: {
    color: '#FFF'
  },
  greenText: {color: '#28AC6C'},  // TODO: pick a better green
  greenBoldText: {color: '#28AC6C', fontWeight: 'bold'},  // TODO: pick a better green
  blueText: {color: '#77CCD4'},

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
    borderColor:'#77CCD4',
  },
  lightLineStyle:{
    borderWidth: 0.5,
    borderColor:'#242e3d',
  },
  flexRow: {
    flexDirection: 'row'
  },
  greenThickBorder: {
    borderColor: "#28AC6C",
    borderWidth: 3
  },
  whiteBorderBox: {
    borderColor: "white",
    borderWidth: 2,
  },
  basicBg: {
    padding: 10,
    backgroundColor: '#0C131E',
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