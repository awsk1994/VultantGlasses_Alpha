# Vultant Glasses Alpha App

## Libraries
 - react navigation:
   - https://reactnavigation.org/docs/4.x/getting-started
 - async-storage:
   - https://react-native-async-storage.github.io/async-storage/docs/usage

## Log
 - 20210124: Ensured react-navigation is functional.
 - 20210125: Set up a structure for the entire app.
   - [FIXED] Problem (stuck):
     - Bluetooth functionality is not provided on emulators; need to use physical device. However, my usb-c cable is gone. During this quarantine, I need to find a way to get a usb-c cable.
   - Result:

<img src="./img/20210125_MenuScreen.png" height="300"/>
<img src="./img/20210125_MenuScreen_modified.png" height="300"/>
<img src="./img/20210125_NotificationsScreen.png" height="300"/>
<img src="./img/20210125_NotificationsScreen_ToastMsg.png" height="300"/>
<img src="./img/20210125_NotesScreen.png" height="300"/>
<img src="./img/20210125_SettingsScreen.png" height="300"/>

 - 20210125: Completed Notification, Notes and CueCard basic functionality. Implemented persistence storage.
   - Problem (to be fixed):
     - Currently, if Choose Device -> Start BLE connection -> will get error (cuz using two instance of BleManager?). Not sure if we should share characteristics between MenuScreen and BLEMenu? Or solve it by closing the manager instance?
   - Result:
  
<img src="./img/20210125_2_MenuScreen.png" height="300"/>
<img src="./img/20210125_2_BLEMenu.png" height="300"/>
<img src="./img/20210125_2_NotificationScreen.png" height="300"/>
<img src="./img/20210125_2_NotesScreen.png" height="300"/>
<img src="./img/20210125_2_CueCardScreen.png" height="300"/>
<img src="./img/20210125_2_SettingsScreen.png" height="300"/>

## TODO:
 - persistent storage (to device info) -> then change search device to an option in settings, notes and cue card information.
 - Notification -> Send.
 - BLE library test on physical device
 - pass characteristics object via react-navigation
 - Content of each screen
   - UI of Settings
   - UI of Cue Card
