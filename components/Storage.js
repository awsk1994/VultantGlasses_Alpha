import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  static fetchText = async (key) => {
    console.log("Fetching text with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value;
    } catch(e) {
      console.log(e);
    }
  }

  static fetchBool = async (key) => {
    console.log("Fetching text with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value == "true";
    } catch(e) {
      console.log(e);
    }
  }

  static saveText = async (key, value) => {
    console.log("Saving Text with key(" + key + ")");
    try {
      await AsyncStorage.setItem(key, value);
      console.log("save Complete.");
    } catch (e) {
      console.log(e);
    }
  };

  static saveBool = async (key, value) => {
    console.log("Saving Bool with key(" + key + ")");
    try {
      const strVal = value ? "true": "false";
      await AsyncStorage.setItem(key, strVal);
      console.log("save Complete.");
    } catch (e) {
      console.log(e);
    }
  };

  static clearBLEStorage = async () => {
    let keys = ["@deviceName", "@deviceId", "@serviceId", "@characteristicId"]
    try {
      for(key of keys){
        console.log(key);
        await AsyncStorage.removeItem(key);
      }      
    } catch (e) {
      console.log(e);
    }
  }
}

export default Storage;