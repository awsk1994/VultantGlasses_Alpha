import { Alert } from 'react-native';

class Utils {
  static genericErrAlert(err){
    // TODO: maybe re-direct user to another screen for more details.
    Alert.alert('Error: ' + err, 
      "If the problem continues to persist, please:\n" + 
      " - Restart bluetooth (After turning it off, wait for 5 seconds before turning it on again)\n" + 
      " - Ensure Bluetooth and Notification permission is enabled (Go to app settings) \n" + 
      " - Ensure Bluetooth is Enabled (Go to app settings) .\n\n" + 
      "Details:\n" + 
      " - errCode: " + err.errorCode + "\n" + 
      " - reason: " + err.reason
    );
  };

  static connectErrAlert(errMsg){
    Alert.alert('Connection Error: ' + errMsg, 
      "Please make sure your device can be connected, and try again."// TODO
    );
  }
}
export default Utils;

// - Make sure bluetooth is on
// - Restart bluetooth
// - Restart app
// - Bluetooth permission, Notification Permission, bluetooth is on.
