import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';

export default function FirstScreen({navigation})
{
    const navigator = useNavigation();

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          
        });
        return unsubscribe;
      }, [navigation]);

    useEffect(() => 
    {
        const user = auth().currentUser;
        if (!user) 
        {
            navigator.navigate("SignInScreen");  
        }
        else
        {
            navigator.navigate("MainScreen");  
        }
    }, []);

    return (
        <View style={styles.mainContainer}>
            <Image source={Logo} style={styles.logo}></Image>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer:
    {
        flex:1,
        backgroundColor: 'rgb(61,61,61)',
        alignItems:'center',
        justifyContent:'center'
    },
    logo:
    {
        tintColor: "#F95F6B",
        maxWidth:400,
        maxHeight:400,
    },
})