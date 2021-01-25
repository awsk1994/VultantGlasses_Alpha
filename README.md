# Vultant Glasses Alpha App

## Log
 - 20210124: Ensured react-navigation is functional.
 - 20210125: Set up a structure for the entire app.
   - Problem (stuck):
     - Bluetooth functionality is not provided on emulators; need to use physical device. However, my usb-c cable is gone. During this quarantine, I need to find a way to get a usb-c cable.
   - Result:

<img src="./img/20210125_MenuScreen.png" height="300"/>
<img src="./img/20210125_MenuScreen_modified.png" height="300"/>
<img src="./img/20210125_NotificationsScreen.png" height="300"/>
<img src="./img/20210125_NotificationsScreen_ToastMsg.png" height="300"/>
<img src="./img/20210125_NotesScreen.png" height="300"/>
<img src="./img/20210125_SettingsScreen.png" height="300"/>

## TODO:
 - persistent storage (to device info) -> then change search device to an option in settings.
 - BLE library test on physical device
 - pass characteristics object via react-navigation
 - Content of each screen
   - UI of Settings
   - UI of Cue Card
