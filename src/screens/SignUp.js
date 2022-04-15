import React, {useState, useEffect}  from "react";
import { View, Text , TextInput, Image, StyleSheet, TouchableOpacity} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function SignUp({navigation})
{
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigator = useNavigation();

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          
        });
        return unsubscribe;
      }, [navigation]);
    
    const addUserDatabase = () =>
    {
        const userId = auth().currentUser.uid;
        console.log(userId);

        firestore()
        .collection('Users')
        .doc(userId)
        .set({
          showBars: true,
          showClubs: true,
          showRestaurants: true,
        })
        .then(()=>
        {
            navigator.navigate("MainScreen");
        });
    }

    const onSingUpBtnPressed = () =>
    {   
        if(email == "")
        {
            alert('Email is Empty!')
        }
        else if(password == "")
        {
            alert('Password is Empty!')
        }
        else if(confirmPassword == "")
        {
            alert('Password Confirmation is Empty!')
        }
        else if(password != confirmPassword)
        {
            alert('Passwords do not Match!')
        }
        else
        {
            auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
                alert('User Account Created!');
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                addUserDatabase();
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') 
                {
                    alert('Email Address is already in Use!');
                }
    
                if (error.code === 'auth/invalid-email') 
                {
                    alert('Email Address is Invalid!');
                }
                
                if (error.code === 'auth/weak-password')
                {
                    alert('Password is Too Weak!')
                }
            });
        }
    }

    const onSignInScreenPressed = () =>
    {
        navigator.navigate("SignInScreen");    
    }

    return (
        <View style={styles.mainContainer}>
        <View style={styles.logoContainer}>
            <Image source={Logo} style={styles.logo}></Image>
        </View>
        <View style={styles.logInContainer}>
            <Text style={{marginBottom: '5%',fontSize: 25, color:'white'}}>Sign Up</Text>
            <Text style={{fontSize: 18, color: '#F95F6B'}}>Email</Text>
            <TextInput style={{borderBottomWidth:1, marginBottom:"2%"}} placeholder="example@email.com" value={email} onChangeText={(value) => setEmail(value)}/>
            <Text style={{fontSize: 18, color: '#F95F6B'}}>Password</Text>
            <TextInput style={{borderBottomWidth:1, marginBottom:"2%"}} placeholder="password1234" secureTextEntry={true} value={password} onChangeText={(value) => setPassword(value)}/>
            <Text style={{fontSize: 18, color: '#F95F6B'}}>Confirm Password</Text>
            <TextInput style={{borderBottomWidth:1, marginBottom:"10%"}} placeholder="password1234" secureTextEntry={true} value={confirmPassword} onChangeText={(value) => setConfirmPassword(value)}/>
            <TouchableOpacity style={{backgroundColor:'#F95F6B', alignItems:'center', borderRadius:4, height:50}} onPress={onSingUpBtnPressed}>
                <Text style={{fontSize: 20, marginTop:10, color:'white'}}>Sign Up</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row', marginTop:'10%'}}>
                <Text style={{fontSize:16, color:'white',flex:3, textAlign:'right'}}>Have an Account?</Text>
                <Text style={{fontSize:16, color:'#F95F6B',flex:2, marginStart:'2%'}} onPress={onSignInScreenPressed}>Sign In</Text>
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