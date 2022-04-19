import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, TextInput, TouchableOpacity, ScrollView,Switch} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function UserScreen({navigation})
{   
    const navigator = useNavigation();

    const userData = [];
    const user = auth().currentUser;
    const [loadUserData, setLoadUserData] = useState(true);

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          setLoadUserData(true);
        });
        return unsubscribe;
      }, [navigation]);

    const [isBarEnabled, setIsBarEnabled] = useState(false);
    const toggleBarSwitch = () => 
    {
        setIsBarEnabled(previousState => !previousState);
        firestore()
        .collection('Users')
        .doc(user.uid)
        .update({
          showBars: !isBarEnabled,
        });
        
    }

    const [isClubEnabled, setIsClubEnabled] = useState(false);
    const toggleClubSwitch = () => 
    {
        setIsClubEnabled(previousState => !previousState);
        firestore()
        .collection('Users')
        .doc(user.uid)
        .update({
          showClubs: !isClubEnabled,
        });
    }

    const [isRestaurantEnabled, setIsRestaurantEnabled] = useState(false);
    const toggleRestaurantSwitch = () =>     
    {
        setIsRestaurantEnabled(previousState => !previousState);
        firestore()
        .collection('Users')
        .doc(user.uid)
        .update({
          showRestaurants: !isRestaurantEnabled,
        });
    }

    const getUserData = async () =>
    {
        userData.splice(0, userData.length);

        const userRef = firestore().collection('Users').doc(user.uid);
        const snapshot = await userRef.get()

        const showBars = snapshot.data().showBars;
        const showClubs = snapshot.data().showClubs;
        const showRestaurants = snapshot.data().showRestaurants;

        userData.push({
            showBars: showBars,
            showClubs: showClubs,
            showRestaurants: showRestaurants,
          });
        
        const data = userData;
        return data;
    }

    if(loadUserData)
    {
        getUserData().then(data => 
        {
            setIsBarEnabled(data[0].showBars);
            setIsClubEnabled(data[0].showClubs);
            setIsRestaurantEnabled(data[0].showRestaurants);
        })
        .then(()=>{setLoadUserData(false)})
    }

    const onLogoutPressed = () =>
    {
        auth()
        .signOut()
        .then(() => 
        {
            navigator.navigate("SignInScreen")
        });
    }

    const onResetPasswordButtonPressed = () =>
    {
        auth().sendPasswordResetEmail(user.email)
        .then(function (user) {
          alert('Reset Email Sent!')
        }).catch(function (e) {
          console.log(e)
        })
    }

    return (

    <View style={styles.container}>
        <Image source={Logo} style={styles.logo}></Image>
        <View style={styles.mainContainer}>
            <Text style={{marginBottom: '5%',fontSize: 25, color:'#F95F6B'}}>User</Text>
            <Text style={{fontSize: 18, color: 'white'}}>Email</Text>
            <TextInput style={{borderBottomWidth:1, marginBottom:"2%"}} value={user.email} editable={false} selectTextOnFocus={false} />

            <Text style={{marginBottom: '5%',marginTop:'3%',fontSize: 25, color:'#F95F6B'}}>Settings</Text>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize:18, color: 'white'}}>Show Bars</Text>
                <Switch style={{flex:1, alignContent:'flex-end'}}
                    trackColor={{ false: "#F95F6B", true: "white" }}
                    thumbColor={isBarEnabled ? "#F95F6B" : "white"}
                    onValueChange={toggleBarSwitch}
                    value={isBarEnabled}
                />
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize:18, color: 'white'}}>Show Clubs</Text>
                <Switch style={{flex:1, alignContent:'flex-end'}}
                    trackColor={{ false: "#F95F6B", true: "white" }}
                    thumbColor={isClubEnabled ? "#F95F6B" : "white"}
                    onValueChange={toggleClubSwitch}
                    value={isClubEnabled}
                />
            </View>
            <View style={{flexDirection: 'row'}}>
                <Text style={{fontSize:18, color: 'white'}}>Show Restaurants</Text>
                <Switch style={{flex:1, alignContent:'flex-end'}}
                    trackColor={{ false: "#F95F6B", true: "white" }}
                    thumbColor={isRestaurantEnabled ? "#F95F6B" : "white"}
                    onValueChange={toggleRestaurantSwitch}
                    value={isRestaurantEnabled}
                />
            </View>
            <TouchableOpacity style={{backgroundColor:'grey', alignItems:'center', borderRadius:4, height:50, marginTop:'10%', marginBottom:'5%'}} onPress={onResetPasswordButtonPressed}>
                <Text style={{fontSize: 20, marginTop:10, color:'white'}}>Reset Password</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{backgroundColor:'#F95F6B', alignItems:'center', borderRadius:4, height:50}} onPress={onLogoutPressed}>
                <Text style={{fontSize: 20, marginTop:10, color:'white'}}>Log Out</Text>
            </TouchableOpacity>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    container:
    { 
        flex:1,
        backgroundColor: 'rgb(82,82,82)',
        alignItems:'center',
        justifyContent:'center'
    },
    logo:
    {
        tintColor:'#F95F6B',
        maxWidth:200,
        maxHeight:200,
    },
    bottom:
    {
        margin:'3%',
        flex:1,
        backgroundColor: 'rgb(61,61,61)',
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:10,
        borderWidth:2,
        borderColor:'#F95F6B'  
    },
    bottomButtons:
    {
        height:'100%',
        flex:1,
        justifyContent:'center',
        alignItems:'center',
       
    },
    menuButtons:
    {
        flex:1,
        justifyContent:'center',
        
    },
    mainContainer:
    {
        width: '90%',
        height: '70%',
    },
})