import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text,TouchableOpacity,Dimensions} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps';

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function Place({route,navigation})
{
    const navigator = useNavigation();
    const user = auth().currentUser;

    const place = route.params.params.place;

    const placeID = place.placeId;
    const placeName = place.placeName;
    
    const [isFavourite, setIsFavourite] = useState(false);
    const [location,setLocation] = useState("");
    const [status,setStatus] = useState("");

    const [checkFavourite, setCheckFavourite] = useState(true);
    const [loadLocation, setLoadLocation] = useState(true);
    const [loadStatus, setLoadStatus] = useState(true);

    //Status Colours
    const VeryBusyColor = "red";
    const BusyColor = "#FFEA00";
    const NotBusyColor ="green";
    const NoStatusColor = "orange";

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          setCheckFavourite(true);
          setLoadLocation(true);
          setLoadStatus(true);
        });
        return unsubscribe;
      }, [navigation]);
 
    const getPlaceLocation = async() =>
    {    
        let docLocation;

        const placeRef = firestore().collection('Places').doc(placeID);
        const placeSnapshot = await placeRef.get()
        .then(documentSnapshot => {
            docLocation = documentSnapshot.data().Location;
        });
        
        const data = docLocation;   
        return data;
    }

    const getPlaceStatus = async()=>
    {
        let docStatus;

        const placeRef = firestore().collection('Places').doc(placeID);
        const placeSnapshot = await placeRef.get()
        .then(documentSnapshot => {
            docStatus = documentSnapshot.data().Status;
        });
        
        const data = docStatus;   
        return data;
    }

    const checkIsFavourite = async() =>
    {
        let isFavourite = false;

        const favRef = firestore().collection('Favourites').where('UserID','==', user.uid);
        const favSnapshot = await favRef.get();

        favSnapshot.forEach(doc =>
        {
            const favPlaceId = doc.data().PlaceID;

            if(favPlaceId == placeID)
            {
                isFavourite = true;
            }
        });

        return isFavourite;
    }

    if(loadLocation)
    {
        getPlaceLocation().then((data) => setLocation(data)).then(() => setLoadLocation(false));
    }

    if(checkFavourite)
    {
        checkIsFavourite().then((data) => setIsFavourite(data)).then(() => setCheckFavourite(false));
    }

    if(loadStatus)
    {
        getPlaceStatus().then((data) => setStatus(data)).then(() => setLoadStatus(false));
    }

    const getFavouriteDocToDelete = async (id) =>
    {
        const favRef = firestore().collection('Favourites').where('PlaceID','==', id).where("UserID","==",user.uid);
        const favSnapshot = await favRef.get();

        let docID;

        favSnapshot.forEach(doc =>
            {    
                docID = doc.id;
            });
        
        const data = docID;   
        return data;
    }

    const onFavBtnPress = () =>
    {
        if(isFavourite)
        {
            getFavouriteDocToDelete(placeID).then((data) => {
            firestore()
            .collection('Favourites')
            .doc(data)
            .delete()
            .then(() => {
                setIsFavourite(false);
            });
           }); 
        }
        else
        {
            firestore()
            .collection('Favourites')
            .add({
                PlaceID: placeID,
                UserID: user.uid,
            })
            .then(() => {
                setIsFavourite(true);
            });
        }
    }

    const updateStatus = (status) =>
    {
        firestore()
        .collection('Places')
        .doc(placeID)
        .update({
            Status: status,
        })
        .then(() => {
            setLoadStatus(true);
        });
    }

    const whileLoading = () =>
    {
        if(loadLocation)
        {
            return(
                <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude: 52.95402230,
                    longitude: -1.15498920,
                    latitudeDelta: 0.010,
                    longitudeDelta: 0.0170,
                }}>
                </MapView>
            )
        }
        else
        {
            return(
                <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.001,
                    longitudeDelta: 0.001,
                }}>
                    <Marker 
                        coordinate={{latitude: location.latitude,longitude: location.longitude}}
                    />
                </MapView>
            )
        }
    }

    const whileLoadingQueueStatus = () =>
    {
        if(loadStatus)
        {
            return <Text style={{flex:1,fontSize:20}}>Loading...</Text>
        }
        else
        {
            if(status == "Not Busy")
            {
                return <Text style={{flex:1,fontSize:20, color:NotBusyColor}}>{status}</Text>
            }
            if(status == "Busy")
            {
                return <Text style={{flex:1,fontSize:20, color:BusyColor}}>{status}</Text>
            }
            if(status == "Very Busy")
            {
                return <Text style={{flex:1,fontSize:20, color:VeryBusyColor}}>{status}</Text>
            }
            if(status == "No Status")
            {
                return <Text style={{flex:1,fontSize:20, color:NoStatusColor}}>{status}</Text>
            }
        }
    }

    return(
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={{width:"5%", alignItems:"flex-start"}}>
                    <TouchableOpacity onPress={()=> {navigation.goBack()}}>
                        <Image
                                source={require('../assets/back.png')}
                                resizeMode="cover"
                                style={{tintColor: "grey",width:40,height:40}}
                            />
                    </TouchableOpacity>
                </View>
                <View style={{width:"90%", alignItems:"center"}}>
                    <Text style={styles.title}>{placeName}</Text>
                </View>
                <View style={{width:"5%",  alignItems:"flex-end"}}>
                    <TouchableOpacity onPress={()=> {onFavBtnPress()}}>
                        <Image
                            source={require('../assets/heart.png')}
                            resizeMode="cover"
                            style={{tintColor: isFavourite ? '#F95F6B' : "white",width:40,height:40}}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.mainContainer}>
                <View style={{width:"100%",height:"25%", alignContent:"center", overflow:"hidden",borderColor:"grey", borderWidth:1}}>
                    {whileLoading()}
                </View>
                <View style={{width:"100%",height:"75%", alignContent:"center", overflow:"hidden"}}>
                    <View style={{marginTop:10,alignItems:"center"}}>
                        <Text style={styles.pageTitle}>Status</Text>
                    </View>
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row"}}>
                        <Text style={{flex:3,fontSize:18,}}>Queue Status:</Text>
                        {whileLoadingQueueStatus()}
                    </View>
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row"}}>
                        <Text style={{flex:3,fontSize:18,}}>Last Status Update:</Text>
                        {whileLoadingQueueStatus()}
                    </View>
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row"}}>
                        <Text style={{flex:3,fontSize:18,}}>Accuracy:</Text>
                        {whileLoadingQueueStatus()}
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <Text style={styles.subtitle}>Update Status</Text>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <TouchableOpacity onPress={()=> {updateStatus("Not Busy")}} style={{width: "80%", height: 50,borderColor:"grey", borderWidth:1,backgroundColor:NotBusyColor,borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white", fontSize:18}}>Not Busy</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <TouchableOpacity  onPress={()=> {updateStatus("Busy")}} style={{width: "80%", height: 50,borderColor:"grey", borderWidth:1,backgroundColor:BusyColor,borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white", fontSize:18}}>Busy</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <TouchableOpacity onPress={()=> {updateStatus("Very Busy")}} style={{width: "80%", height: 50,borderColor:"grey", borderWidth:1,backgroundColor:VeryBusyColor,borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white", fontSize:18}}>Very Busy</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{marginTop:20,alignItems:"center"}}>
                        <TouchableOpacity onPress={()=> {updateStatus("No Status")}} style={{width: "80%", height: 50,borderColor:"grey", borderWidth:1,backgroundColor:"rgb(60,60,60)",borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white", fontSize:18}}>No Status</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    mainContainer:
    {
        width: '100%',
        height: '90%',

    },
    topContainer:
    {
        width: '90%',
        height: '10%',
        alignContent:"center",
        flexDirection:"row",
        alignItems:"center",
    },
    map: {
        width:'100%',
        height:"130%",
        overflow:"visible",
      },
    title: {
        fontWeight: "bold",
        justifyContent:"center",
        fontSize: 30,
        color: "white",
    },

    pageTitle: {
        justifyContent:"center",
        fontSize: 24,
        color: "#F95F6B",
    },

    subtitle: {
        justifyContent:"center",
        fontSize: 24,
        color: "grey",
    },
})