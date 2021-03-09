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
        <Stack.Screen name="Menu" component={MenuScreen} options={{headerShown: false}}/>
        <Stack.Screen name="BLEMenu" component={BLEMenu} options={{headerShown: false}}/>
        <Stack.Screen name="Notification" component={NotificationScreen} options={{headerShown: false}}/>
        <Stack.Screen name="CueCard" component={CueCardScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Notes" component={NotesScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{headerShown: false}}/>
        <Stack.Screen name="AppSettings" component={AppSettings} options={{headerShown: false}}/>
        <Stack.Screen name="NotificationAllowAppListScreen" component={NotificationAllowAppListScreen} options={{headerShown: false}}/>
        <Stack.Screen name="SettingsItemScreen" component={SettingsItemScreen} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;