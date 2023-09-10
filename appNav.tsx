import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Bottom from "./screens/bottom";
import Login from "./screens/login";


function AppNav() {
  return (
    <NavigationContainer>
        <Bottom/>
    </NavigationContainer>
  );
}
export default AppNav;
