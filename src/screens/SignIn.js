import React, {useState, useEffect}  from "react";
import { View, Text , TextInput, Image, StyleSheet, TouchableOpacity,Alert} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';

import prompt from 'react-native-prompt-android';

export default function SignIn({navigation})
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigator = useNavigation();

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
         
        });
        return unsubscribe;
      }, [navigation]);

    const onSingInBtnPressed  = () =>
    {
        if(email == "")
        {
            alert('Email is Empty!')
        }
        else if(password == "")
        {
            alert('Password is Empty!')
        }
        else
        {
            auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => 
            {
                setEmail("");
                setPassword("");
                navigator.popToTop();
                navigator.navigate("MainScreen"); 
            })
            .catch(error => {
                if (error.code === 'auth/user-not-found') 
                {
                    alert('Email Address not Found!');
                }
    
                if (error.code === 'auth/invalid-email') 
                {
                    alert('Email Address is Invalid!');
                }

                if (error.code === 'auth/wrong-password')
                {
                    alert('Password is Incorrect!');
                }
            });
        }
    }

    const onSignUpScreenPressed = () =>
    {
        navigator.navigate("SignUpScreen");    
    }

    const onForgotPasswdPressed = () =>
    {
        prompt(
            'Forgot Password',
            'Please enter your Email',
            [
             {text: 'Cancel',style: 'cancel'},
             {text: 'Send Reset Email', onPress: ((email) => {
                if(email.length > 0)
                {
                    auth().sendPasswordResetEmail(email)
                    .then(() => 
                    {
                      Alert.alert('Reset Password','Please Check your Email!');
                    })
                    .catch(error => 
                    {            
                        if (error.code === 'auth/invalid-email') 
                        {
                            Alert.alert('Forgot Password','Email Address is Invalid!');
                        }
                    });
                }
                else
                {
                    onForgotPasswdPressed();
                }
             })},
            ],
            {
                cancelable: false,
                placeholder: 'example@email.com',
            }
          );
    }

    return (
        <View style={styles.mainContainer}>
            <View style={styles.logoContainer}>
                <Image source={Logo} style={styles.logo}></Image>
            </View>
            <View style={styles.logInContainer}>
                <Text style={{marginBottom: '5%',fontSize: 25, color:'white'}}>Sign In</Text>
                <Text style={{fontSize: 18, color: '#F95F6B'}}>Email</Text>
                <TextInput style={{borderBottomWidth:1, marginBottom:"2%"}} placeholder="example@email.com" value={email} onChangeText={(value) => setEmail(value)}/>
                <Text style={{fontSize: 18, color: '#F95F6B'}}>Password</Text>
                <TextInput style={{borderBottomWidth:1, marginBottom:"10%"}} placeholder="password1234" secureTextEntry={true} value={password} onChangeText={(value) => setPassword(value)}/>
                <TouchableOpacity style={{backgroundColor:'#F95F6B', alignItems:'center', borderRadius:4, height:50}} onPress={onSingInBtnPressed}>
                    <Text style={{fontSize: 20, marginTop:10, color:'white'}}>Sign In</Text>
                </TouchableOpacity>

                {/*
                    <View style={{alignItems:'center', marginTop:'2%', marginBottom:'2%'}}>
                        <Text style={{color:'white'}}>or</Text>
                    </View>
                    <TouchableOpacity style={{backgroundColor:'#3D89F6', alignItems:'center', borderRadius:4, height:50}}>
                        <Text style={{fontSize: 20, marginTop:10, color:'white'}}>Google</Text>
                    </TouchableOpacity>
                */}

                <View style={{flexDirection:'row', marginTop:'10%'}}>
                    <Text style={{fontSize:16, color:'white'}} onPress={onForgotPasswdPressed}>Forgot Password?</Text>
                    <Text style={{fontSize:16, color:'#F95F6B',flex:1, textAlign:'right'}} onPress={onSignUpScreenPressed}>Sign Up</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer:
    {
        flex:1,
        backgroundColor: 'rgb(61,61,61)',
        alignItems:'center',
    },
    logoContainer:
    { 
        width: '100%',
        height: '30%',
        justifyContent:'center',
        alignItems:'center',
    },
    logo:
    {
        tintColor: '#F95F6B',
        maxWidth:250,
        maxHeight:250,
    },
    logInContainer:
    {
        width: '90%',
        height: '70%',
    },

})