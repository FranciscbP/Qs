import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, TouchableOpacity} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps'; 

export default function MainScreen({navigation})
{
    const navigator = useNavigation();

    const markersData = [];
    const user = auth().currentUser;
    const [loadMarkers, setLoadMarkers] = useState(true);
    
    const markersList = [];
    const [mList, setMList] = useState(markersList);

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoadMarkers(true);
        });
        return unsubscribe;
      }, [navigation]);

    //Marker busy state Colours
    const VeryBusy = "red";
    const Busy = "yellow";
    const NotBusy ="green";

    const getMarkers = async() =>
    {
        markersData.splice(0, markersData.length);

        const userRef = firestore().collection('Users').doc(user.uid);
        const userSnapshot = await userRef.get()

        const showBars = userSnapshot.data().showBars;
        const showClubs = userSnapshot.data().showClubs;
        const showRestaurants = userSnapshot.data().showRestaurants;

        if(showBars)
        {
            const bars = firestore().collection('Places').where('Type','==','Bar');
            const barsSnapshot = await bars.get();
        
            barsSnapshot.forEach(doc => 
            {   
                const placeId = doc.id;
                const placeName = doc.data().Name;
                const placeLocation = doc.data().Location;
                const placeStatus = doc.data().Status;

                if(placeStatus == "NotBusy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusy,
                    });
                }
                else if(placeStatus == "Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: Busy,
                    });
                }
                else if(placeStatus == "VeryBusy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: VeryBusy,
                    });
                }
            });
        }

        if(showClubs)
        {
            const clubs = firestore().collection('Places').where('Type','==','Club');
            const clubsSnapshot = await clubs.get();

            clubsSnapshot.forEach(doc => 
                {   
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    const placeLocation = doc.data().Location;
                    const placeStatus = doc.data().Status;
    
                    if(placeStatus == "NotBusy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NotBusy,
                        });
                    }
                    else if(placeStatus == "Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: Busy,
                        });
                    }
                    else if(placeStatus == "VeryBusy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusy,
                        });
                    }
                });
        }

        if(showRestaurants)
        {
            const restaurants = firestore().collection('Places').where('Type','==','Restaurant');
            const restaurantsSnapshot = await restaurants.get();

            restaurantsSnapshot.forEach(doc => 
                {   
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    const placeLocation = doc.data().Location;
                    const placeStatus = doc.data().Status;
    
                    if(placeStatus == "NotBusy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NotBusy,
                        });
                    }
                    else if(placeStatus == "Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: Busy,
                        });
                    }
                    else if(placeStatus == "VeryBusy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusy,
                        });
                    }
                });
        }
        
        const data = markersList;
        return data;
    }

    if (loadMarkers)
    {
        getMarkers().then(data => {setMList(data)})
        .then(()=>{setLoadMarkers(false)}); 
    }

    const drawMarkers = () =>
    {
        if (mList.length > 0)
        {
            return mList.map((mLst) =>  
                <Marker 
                coordinate={{latitude: mLst.placeLocation.latitude,longitude: mLst.placeLocation.longitude}}
                title={mLst.placeName}
                pinColor={mLst.placeStatusColor}
                />
            )
        }

    }

    const whileLoading = () =>
    {
        if(loadMarkers)
        {
           return(
                <MapView
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                region={{
                    latitude: 52.95402230,
                    longitude: -1.15498920,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.0121,
                }}>
                </MapView>
           )
        }
        else
        {
            return (
                <MapView
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                region={{
                    latitude: 52.95402230,
                    longitude: -1.15498920,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.0121,
                }}>
                {drawMarkers()}
                </MapView>
            )
        }
    }

    return (

    <View style={styles.container}>
        {whileLoading()}
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
        flex: 8.5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgb(82,82,82)',
        width:'100%'
    },
    logo:
    {
        maxWidth:300,
        maxHeight:250,
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
    map: {
        width:'100%',
        height:'120%'
      },
})