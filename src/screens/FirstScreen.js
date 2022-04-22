import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';

export default function FirstScreen({navigation})
{
    //Navigate Between Screens
    const navigator = useNavigation();

    //Come back to initialized Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            checkUserSigned();
        });
        return unsubscribe;
      }, [navigation]);

    //Screen is Initialized
    useEffect(() => 
    {
        checkUserSigned();
    }, []);

    //Check if the is a User is Sign In
    const checkUserSigned = () =>
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
    }

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