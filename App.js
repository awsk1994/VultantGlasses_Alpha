import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MenuScreen from "./src/screens/MenuScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import CueCardScreen from "./src/screens/CueCardScreen";
import NotesScreen from "./src/screens/NotesScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import BLEMenu from "./src/components/BLEMenu";
import AppSettings from './src/screens/AppSettings';
import NotificationAllowAppListScreen from './src/screens/NotificationAllowAppListScreen';
import SettingsItemScreen from './src/screens/SettingsItemScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="BLEMenu" component={BLEMenu} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="CueCard" component={CueCardScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AppSettings" component={AppSettings} />
        <Stack.Screen name="NotificationAllowAppListScreen" component={NotificationAllowAppListScreen}/>
        <Stack.Screen name="SettingsItemScreen" component={SettingsItemScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;