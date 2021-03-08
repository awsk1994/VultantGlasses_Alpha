import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  static fetchText = async (key) => {
    console.log("Fetching text with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value !== null ? value : null;
    } catch(e) {
      console.log(e);
    }
  }

  static fetchInt = async (key) => {
    console.log("Fetching number with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value !== null ? parseInt(value) : null;
    } catch(e) {
      console.log(e);
    }
  }

  static fetchBool = async (key) => {
    console.log("Fetching bool with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      console.log("Fetch complete.");
      return value !== null ? value == "true" : null;
    } catch(e) {
      console.log(e);
    }
  }

  static fetchList = async (key) => {
    console.log("Fetching list with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      if(value == null){
        return [];
      } else {
        return value.split(",");
      }
    } catch(e) {
      console.log(e);
    }
  }

  static fetchObjList = async (key) => {
    console.log("Fetching object list with key(" + key + ")");
    try {
      const value = await AsyncStorage.getItem(key);
      return value == null ? [] : JSON.parse(value).lst;
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

  static saveInt = async (key, value) => {
    console.log("Saving Int with key(" + key + ")");
    try {
      const strVal = value.toString();
      await AsyncStorage.setItem(key, strVal);
      console.log("save Complete.");
    } catch (e) {
      console.log(e);
    }
  };

  static saveList = async (key, value) => {
    console.log("Saving list with key(" + key + ")");
    try {
      const strVal = value.join(",");
      await AsyncStorage.setItem(key, strVal);
      console.log("save Complete.");
    } catch (e) {
      console.log(e);
    }
  };

  static saveObjList = async (key, lst) => {
    console.log("Saving object list with key(" + key + ")");
    try {
      const obj1 = {lst: lst};
      const strVal = JSON.stringify(obj1);
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