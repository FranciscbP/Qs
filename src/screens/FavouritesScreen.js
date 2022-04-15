import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';

export default function Favourites({navigation})
{
    const navigator = useNavigation();

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          
        });
        return unsubscribe;
      }, [navigation]);

    return(
        <View>
            <Text>Favourites</Text>
        </View>
    );
}