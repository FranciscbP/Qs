// Libs
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View,Image, Text,Dimensions} from 'react-native';

// Screens
import FirstScreen from "./screens/FirstScreen";
import SignInScreen from "./screens/SignIn";
import SignUpScreen from "./screens/SignUp";
import FavouritesScreen from "./screens/FavouritesScreen"
import MapScreen from "./screens/MapScreen";
import UserScreen from "./screens/UserScreen";

// Icons
import heartIcon from "./assets/heart.png"
import logoNoText from "./assets/logo-no-text.png"
import settingIcon from "./assets/settings.png"


// Screen Names
const firstScreen = 'FirstScreen';
const signIn = 'SignInScreen';
const signUp = 'SignUpScreen';
const mainScreen = 'MainScreen';
const favouritesScreen = 'FavouritesScreen';
const mapScreen = 'mapScreen';
const settingsScreen = 'SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const windowWdth = Dimensions.get('window').width;

function BottomNavigator()
{
    return(
        <Tab.Navigator
            initialRouteName={mapScreen}
            screenOptions = {{
                tabBarShowLabel: false,
                headerShown: false,
                activeTintColor: '#0091EA',
                inactiveTintColor: 'gray',
                tabBarStyle:{
                    borderColor:'rgb(61,61,61)',
                    position: 'absolute',
                    bottom: 30,
                    height: 90,
                    left: windowWdth * 0.05,
                    right: windowWdth * 0.05,
                    width: windowWdth * 0.9,
                    elevation: 10,
                    borderRadius: 15,
                    backgroundColor: 'rgb(61,61,61)',
                    alignItems:"center",
                    alignContent:"center",
                    justifyContent:"center",
                }
            }}
        >
            <Tab.Screen name={favouritesScreen} component={FavouritesScreen} 
                options={{ 
                    tabBarIcon: ({focused}) => 
                    { 
                        return(
                            <View style={{alignItems:'center', justifyContent:'center'}}>
                            <Image source={heartIcon} resizeMode="contain" style={{width:30,height:30,tintColor: focused? '#F95F6B':'grey'}}/>
                            <Text style={{color: focused? '#F95F6B':'grey'}}>Favourites</Text>
                        </View>
                        )
                    }
                }}
            />
            <Tab.Screen name={mapScreen} component={MapScreen} 
                options={{ 
                    tabBarIcon: ({focused}) => 
                    { 
                        return(
                            <View style={{alignItems:'center', justifyContent:'center'}}>
                            <Image source={logoNoText} resizeMode="contain" style={{width:100,height:100,tintColor: focused? '#F95F6B':'grey'}}/>
                        </View>
                        )
                    }
                }}
            />
            <Tab.Screen name={settingsScreen} component={UserScreen} 
                options={{ 
                    tabBarIcon: ({focused}) => 
                    { 
                        return(
                            <View style={{alignItems:'center', justifyContent:'center'}}>
                            <Image source={settingIcon} resizeMode="contain" style={{width:30,height:30,tintColor: focused? '#F95F6B':'grey'}}/>
                            <Text style={{color: focused? '#F95F6B':'grey'}}>Settings</Text>
                        </View>
                        )
                    }
                }}
            />
        </Tab.Navigator>
    )
}

export default function StackNavigator()
{
    return(
        <Stack.Navigator>
            <Stack.Screen name={firstScreen} component={FirstScreen} options={{ headerShown: false }}/>
            <Stack.Screen name={signIn} component={SignInScreen} options={{ headerShown: false }}/>
            <Stack.Screen name={signUp} component={SignUpScreen} options={{ headerShown: false }}/>
            <Stack.Screen name={mainScreen} component={BottomNavigator} options={{ headerShown: false }}/>
        </Stack.Navigator>
    )
}