import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';

export default function Place({route,navigation})
{
    const navigator = useNavigation();

    const placeName = route.params.params.placeName;

    // //Reload Screen
    // useEffect(() => {
    //     const unsubscribe = navigation.addListener('focus', () => {
          
    //     });
    //     return unsubscribe;
    //   }, [navigation]);
 
    return(
        <View>
            <Text>{placeName}</Text>
        </View>
    );
}