import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MenuScreen from "./screens/MenuScreen";
import NotificationScreen from "./screens/NotificationScreen";
import CueCardScreen from "./screens/CueCardScreen";
import NotesScreen from "./screens/NotesScreen";
import SettingsScreen from "./screens/SettingsScreen";
import BLEMenu from "./components/BLEMenu";
import AppSettings from './screens/AppSettings';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;