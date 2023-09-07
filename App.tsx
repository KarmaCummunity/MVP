import * as React from "react";
import { View, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Bottom from "./screens/bottom";

function App() {
  return (
    <NavigationContainer>
      <Bottom/>
    </NavigationContainer>
  );
}
export default App;
