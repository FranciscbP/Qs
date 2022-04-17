import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, TouchableOpacity,ScrollView,Animated,Dimensions } from 'react-native'
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps'; 
import logo from "../assets/logo-no-text.png";

const windowWdth = Dimensions.get('window').width;

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
    const VeryBusyColor = "red";
    const BusyColor = "yellow";
    const NotBusyColor ="green";
    const NoStatusColor = "wheat";

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

                if(placeStatus == "Not Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusyColor,
                    });
                }
                else if(placeStatus == "Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: BusyColor,
                    });
                }
                else if(placeStatus == "Very Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: VeryBusyColor,
                    });
                }
                else if (placeStatus == "No Status")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NoStatusColor,
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
    
                    if(placeStatus == "Not Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NotBusyColor,
                        });
                    }
                    else if(placeStatus == "Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: BusyColor,
                        });
                    }
                    else if(placeStatus == "Very Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusyColor,
                        });
                    }
                    else if (placeStatus == "No Status")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NoStatusColor,
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
    
                    if(placeStatus == "Not Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NotBusyColor,
                        });
                    }
                    else if(placeStatus == "Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: BusyColor,
                        });
                    }
                    else if(placeStatus == "Very Busy")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusyColor,
                        });
                    }
                    else if (placeStatus == "No Status")
                    {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NoStatusColor,
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
            return mList.map((mLst,index) =>  
                <Marker 
                key={index}
                coordinate={{latitude: mLst.placeLocation.latitude,longitude: mLst.placeLocation.longitude}}
                title={mLst.placeName}
                description={mLst.placeStatus}
                pinColor={mLst.placeStatusColor}>
                {/* <Image source={require('../assets/marker.png')} resizeMode="contain" style={{maxHeight:29, maxWidth:29 ,tintColor:mLst.placeStatusColor}} />  */}
                </Marker>                
            )
        }
    }

    // const mapAnimation = new Animated.Value(0);
    // const mapIndex = 0;

    // useEffect(() => {
    //     mapAnimation.addListener({value}) => {}
    // })

    const drawCardScrollList = () =>
    {
        if(!loadMarkers)
        {   
            if (mList.length > 0)
            {
                return (
                    
                    <Animated.ScrollView
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}    
                    pagingEnabled
                    snapToInterval={windowWdth}
                    snapToAlignment="center"

                    // onScroll={Animated.event(
                    //     [
                    //         {
                    //             nativeEvent: {
                    //                 contentOffset: {
                    //                     x: mapAnimation,
                    //                 }
                    //             }
                    //         }
                    //     ]
                    // )}
                    >
                        {
                            mList.map((mLst,index) => (
                                <View style={styles.card} key={index}>
                                <View>
                                    <Text numberOfLines={1} style={styles.cardTitle}>{mLst.placeName}</Text>
                                    <Text numberOfLines={1} style={{fontSize:14,color:mLst.placeStatusColor}}>{mLst.placeStatus}</Text>
                                </View>
                                </View>
                            )
                        )}

                    </Animated.ScrollView>                    
                )
            }
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
                    latitudeDelta: 0.010,
                    longitudeDelta: 0.0170,
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
                    latitudeDelta: 0.010,
                    longitudeDelta: 0.0170,
                }}>
                {drawMarkers()}
                </MapView>
            )
        }
    }

    return (
    <View style={styles.container}>
        {whileLoading()}
        {drawCardScrollList()}
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
    scrollView: {
        bottom: 130,
        height: 60,
        left: 0,
        right: 0,
        width: windowWdth,
        position:"absolute",
        overflow:"hidden",
        alignContent:'center',
    },
    card: {
        marginLeft: windowWdth * 0.05,
        marginRight: windowWdth * 0.05,
        overflow:"hidden",
        backgroundColor: "#fff",
        borderRadius: 5,
        marginVertical:0,
        marginHorizontal: 0,
        height: '100%',
        width: windowWdth * 0.9,  
        paddingStart: 5,      
    },
    textContent: {
        flex:2,
        padding:10,
    },
    cardTitle: {
        fontSize: 18,
        color: "#F95F6B",
    },
    cardDescription: {
        fontSize:14,
        color: "red",
    }
})