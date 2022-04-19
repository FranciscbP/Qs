import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text,ScrollView,Animated,Dimensions,TouchableOpacity} from 'react-native';

import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps';


const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function MainScreen({navigation})
{
    const navigator = useNavigation();

    const user = auth().currentUser;
    const [loadMarkers, setLoadMarkers] = useState(true);
    
    const favouritsList = [];

    const markersList = [];
    const [mList, setMList] = useState(markersList);

    const [selectedLocationIndex,setSelectedLocationIndex] = useState(0);

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setLoadMarkers(true);
            setSelectedLocationIndex(0);
        });
        return unsubscribe;
      }, [navigation]);

    //Marker busy state Colours
    const VeryBusyColor = "red";
    const BusyColor = "yellow";
    const NotBusyColor ="green";
    const NoStatusColor = "orange";

    let mapAnimation = new Animated.Value(0);
    let mapIndex = 0;

    const _map = React.useRef(null);
    const _scrollView = React.useRef(null);

    const checkIsFavourite = (placeId) =>
    {
        let isFavourite = false;

        favouritsList.map((fList) =>
        { 
            if(fList.placeId == placeId)
            {
                isFavourite = true;
            }
        });


        return isFavourite;
    }

    const getMarkers = async() =>
    {
        markersList.splice(0, markersList.length);

        const userRef = firestore().collection('Users').doc(user.uid);
        const userSnapshot = await userRef.get()

        const showBars = userSnapshot.data().showBars;
        const showClubs = userSnapshot.data().showClubs;
        const showRestaurants = userSnapshot.data().showRestaurants;

        const favRef = firestore().collection('Favourites').where('UserID','==', user.uid);
        const favSnapshot = await favRef.get();

        favSnapshot.forEach(doc =>
        {
            const favPlaceId = doc.data().PlaceID;

            favouritsList.push({
                placeId: favPlaceId,
            })
        });

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
                   const checkIfFavourite = checkIsFavourite(placeId)
                   if(checkIfFavourite)
                   {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NotBusyColor,
                            placeIsFavourite: true,
                        });
                   }
                   else
                   {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusyColor,
                        placeIsFavourite: false,
                    });
                   }
                }
                else if(placeStatus == "Busy")
                {
                    const checkIfFavourite = checkIsFavourite(placeId)
                    if(checkIfFavourite)
                    {
                         markersList.push({
                             placeId: placeId,
                             placeName: placeName,
                             placeLocation: placeLocation,
                             placeStatus: placeStatus,
                             placeStatusColor: BusyColor,
                             placeIsFavourite: true,
                         });
                    }
                    else
                    {
                     markersList.push({
                         placeId: placeId,
                         placeName: placeName,
                         placeLocation: placeLocation,
                         placeStatus: placeStatus,
                         placeStatusColor: BusyColor,
                         placeIsFavourite: false,
                     });
                    }
                }
                else if(placeStatus == "Very Busy")
                {
                    const checkIfFavourite = checkIsFavourite(placeId)
                    if(checkIfFavourite)
                    {
                         markersList.push({
                             placeId: placeId,
                             placeName: placeName,
                             placeLocation: placeLocation,
                             placeStatus: placeStatus,
                             placeStatusColor: VeryBusyColor,
                             placeIsFavourite: true,
                         });
                    }
                    else
                    {
                     markersList.push({
                         placeId: placeId,
                         placeName: placeName,
                         placeLocation: placeLocation,
                         placeStatus: placeStatus,
                         placeStatusColor: VeryBusyColor,
                         placeIsFavourite: false,
                     });
                    }
                }
                else if (placeStatus == "No Status")
                {
                    const checkIfFavourite = checkIsFavourite(placeId)
                    if(checkIfFavourite)
                    {
                         markersList.push({
                             placeId: placeId,
                             placeName: placeName,
                             placeLocation: placeLocation,
                             placeStatus: placeStatus,
                             placeStatusColor: NoStatusColor,
                             placeIsFavourite: true,
                         });
                    }
                    else
                    {
                     markersList.push({
                         placeId: placeId,
                         placeName: placeName,
                         placeLocation: placeLocation,
                         placeStatus: placeStatus,
                         placeStatusColor: NoStatusColor,
                         placeIsFavourite: false,
                     });
                    }
                }
            });
        }

        if(showClubs)
        {
            const clubs = firestore().collection('Places').where('Type','==','Club');
            const clubsSnapshot = await clubs.get();

            const favRef = firestore().collection('Favourites').where('UserID','==', user.uid);
            const favSnapshot = await favRef.get();
    
            favSnapshot.forEach(doc =>
            {
                const favPlaceId = doc.data().PlaceID;
    
                favouritsList.push({
                    placeId: favPlaceId,
                })
            });

            clubsSnapshot.forEach(doc => 
                {   
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    const placeLocation = doc.data().Location;
                    const placeStatus = doc.data().Status;
    
                    if(placeStatus == "Not Busy")
                    {   
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                                markersList.push({
                                    placeId: placeId,
                                    placeName: placeName,
                                    placeLocation: placeLocation,
                                    placeStatus: placeStatus,
                                    placeStatusColor: NotBusyColor,
                                    placeIsFavourite: true,
                                });
                        }
                        else
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: NotBusyColor,
                                placeIsFavourite: false,
                            });
                        }
                    }
                    else if(placeStatus == "Busy")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: BusyColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: BusyColor,
                            placeIsFavourite: false,
                        });
                        }
                    }
                    else if(placeStatus == "Very Busy")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: VeryBusyColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusyColor,
                            placeIsFavourite: false,
                        });
                        }
                    }
                    else if (placeStatus == "No Status")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: NoStatusColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NoStatusColor,
                            placeIsFavourite: false,
                        });
                        }
                    }
                });
        }

        if(showRestaurants)
        {
            const restaurants = firestore().collection('Places').where('Type','==','Restaurant');
            const restaurantsSnapshot = await restaurants.get();

            const favRef = firestore().collection('Favourites').where('UserID','==', user.uid);
            const favSnapshot = await favRef.get();
    
            favSnapshot.forEach(doc =>
            {
                const favPlaceId = doc.data().PlaceID;
    
                favouritsList.push({
                    placeId: favPlaceId,
                })
            });

            restaurantsSnapshot.forEach(doc => 
                {   
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    const placeLocation = doc.data().Location;
                    const placeStatus = doc.data().Status;
    
                    if(placeStatus == "Not Busy")
                    {   
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                                markersList.push({
                                    placeId: placeId,
                                    placeName: placeName,
                                    placeLocation: placeLocation,
                                    placeStatus: placeStatus,
                                    placeStatusColor: NotBusyColor,
                                    placeIsFavourite: true,
                                });
                        }
                        else
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: NotBusyColor,
                                placeIsFavourite: false,
                            });
                        }
                    }
                    else if(placeStatus == "Busy")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: BusyColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: BusyColor,
                            placeIsFavourite: false,
                        });
                        }
                    }
                    else if(placeStatus == "Very Busy")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: VeryBusyColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: VeryBusyColor,
                            placeIsFavourite: false,
                        });
                        }
                    }
                    else if (placeStatus == "No Status")
                    {
                        const checkIfFavourite = checkIsFavourite(placeId)
                        if(checkIfFavourite)
                        {
                            markersList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeLocation: placeLocation,
                                placeStatus: placeStatus,
                                placeStatusColor: NoStatusColor,
                                placeIsFavourite: true,
                            });
                        }
                        else
                        {
                        markersList.push({
                            placeId: placeId,
                            placeName: placeName,
                            placeLocation: placeLocation,
                            placeStatus: placeStatus,
                            placeStatusColor: NoStatusColor,
                            placeIsFavourite: false,
                        });
                        }
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

    // const showMarker = (index) =>
    // {
    //     if(mList[index].placeStatus == "Not Busy")
    //     {
    //         return(
    //             <Animated.Image 
    //             source={require('../assets/map_marker.png')}
    //             resizeMode="cover"
    //             style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
    //         />
    //         )
    //     }
    //     else if(mList[index].placeStatus == "Busy")
    //     {
    //         return(
    //             <Animated.Image 
    //             source={require('../assets/map_marker.png')}
    //             resizeMode="cover"
    //             style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
    //         />
    //         )
    //     }
    //     else if(mList[index].placeStatus == "Very Busy")
    //     {
    //         return(
    //             <Animated.Image 
    //             source={require('../assets/map_marker.png')}
    //             resizeMode="cover"
    //             style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
    //         />
    //         )
    //     }
    //     else if (mList[index].placeStatus == "No Status")
    //     {
    //         return(
    //             <Animated.Image 
    //             source={require('../assets/map_marker.png')}
    //             resizeMode="contain"
    //             style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
    //         />
    //         )
    //     }
    // }

    const drawMarkers = () =>
    {
        if (mList.length > 0)
        {
            return mList.map((mLst,index) =>  
                    <Marker 
                    key={index}
                    coordinate={{latitude: mLst.placeLocation.latitude,longitude: mLst.placeLocation.longitude}}
                    pinColor={mLst.placeStatusColor}

                    zIndex={selectedLocationIndex == index ? 999 : 0}
                    onPress={(e) => onMarkerPress(e)}
                    >
                        {/* <View style={{borderWidth:1,borderColor:"red"}}>
                            {showMarker(index)}
                        </View> */}
                    </Marker>  
            );
        }
    }

    const onFavBtnPress = (index) =>
    {
       // console.log(index);
    }
    
    const drawFavBtn = (index) =>
    {
        if(mList[index].placeIsFavourite == true)
        {
            return (
                <Image
                disabled ={true}
                source={require('../assets/heart.png')}
                resizeMode="cover"
                style={{tintColor: "#F95F6B",width:40,height:40}}
                />
            )
        }
        else
        {
            return (
                <Image
                disabled ={true}
                // onPress={onFavBtnPress(index)}
                source={require('../assets/heart.png')}
                resizeMode="cover"
                style={{tintColor: "white",width:40,height:40}}
                />
            )
        }
    }

    const drawCardScrollList = () =>
    {
        if(!loadMarkers)
        {   
            if (mList.length > 0)
            {
                return (
                    
                    <Animated.ScrollView
                    
                    ref={_scrollView}
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}    
                    pagingEnabled
                    snapToInterval={windowWdth}
                    snapToAlignment="center"
                    onScroll={onScroll()}
                    >
                        {
                            mList.map((mLst,index) => (
                                <View style={styles.card} key={index}>
                                    <View style={{flex:1, justifyContent:"center",marginLeft: cardWdth * 0.05}}>
                                        <Text numberOfLines={1} style={styles.cardTitle}>{mLst.placeName}</Text>
                                    </View>
                                    <View style={{flex:2}}> 
                                        <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row"}}>
                                            <Text style={{color:"white"}}>Queue Status: </Text>
                                            <Text numberOfLines={1} style={{fontSize:14,color:mLst.placeStatusColor, marginLeft:0}}>{mLst.placeStatus}</Text>
                                        </View>
                                        <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row"}}> 
                                            <Text style={{color:"white"}}>Last Updated: </Text>
                                            <Text numberOfLines={1} style={{fontSize:14,color:mLst.placeStatusColor, marginLeft:0}}>{mLst.placeStatus}</Text>
                                        </View>
                                        <View style={{justifyContent:"center", alignItems:"center",width:cardWdth,marginTop:20,}}>
                                            <TouchableOpacity disabled = {true} style={{width: (cardWdth * 0.9), height: 50,backgroundColor:'#F95F6B',borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                                                <Text style={{color:"white"}}>Update Queue Status</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{top: 15,left:cardWdth - 50, position:"absolute", height:40,width:40,alignContent:"center",justifyContent:"center"}}>
                                        {drawFavBtn(index)}
                                    </TouchableOpacity>
                                </View>
                            )
                        )}
                    </Animated.ScrollView>                    
                )
            }
        }
    }

    const onMarkerPress = (mapEventData) =>
    {
        const markerID = mapEventData._targetInst.return.index;
        let x = (markerID * windowWdth);

        _scrollView.current.scrollTo({x: x, y:0, animated: false});
                
        setSelectedLocationIndex(markerID);
    }

    const onScroll = () =>
    {
        return (
            Animated.event(
            [
                {
                    nativeEvent: {
                        contentOffset: {
                            x: mapAnimation,
                        }
                    }
                }
            ],
            {useNativeDriver: true}
        ));
    }

    useEffect(() => {
        mapAnimation.addListener(({value}) => 
        {
            if(mList.length != 0)
            {   
                let index = Math.floor((value / cardWdth)); 
                
                if(index >= mList.length)
                {
                    index = mList.length -1;
                }
                if(index <= 0)
                {
                    index = 0;
                }
                
                clearTimeout(regionTimeout);
        
                const regionTimeout = setTimeout(() =>
                {
                    if(mapIndex != index)
                    {
                        mapIndex = index; 
                        setSelectedLocationIndex(mapIndex); 
                        _map.current.animateToRegion(
                            {
                                latitude:mList[mapIndex].placeLocation.latitude,
                                longitude: mList[mapIndex].placeLocation.longitude,
                                latitudeDelta: 0.006,
                                longitudeDelta: 0.007,
                            },350
                        )
                    }
                });
                
            }
    });
});
    
    const onButtonPress = () => 
    {
        console.log(selectedLocationIndex);

    }

    const whileLoading = () =>
    {
        if(loadMarkers)
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
            if (mList.length > 0)
            {
                return (
                    <MapView
                    ref = {_map}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    region={{
                        latitude: mList[selectedLocationIndex].placeLocation.latitude,
                        longitude: mList[selectedLocationIndex].placeLocation.longitude,
                        latitudeDelta: 0.006,
                        longitudeDelta: 0.007,
                    }}>
                    {drawMarkers()}
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
                        latitude: 52.95402230,
                        longitude: -1.15498920,
                        latitudeDelta: 0.010,
                        longitudeDelta: 0.0170,
                    }}>
                    </MapView>
               )
            }
        }
    }

    //Fix Scrollable Press Problem
    const createUpdateBtn = () =>
    {
        if(mList.length > 0)
        {
            return (
                <View style={{position:"absolute",bottom: 155,left:0,right:0,height:50,overflow:"hidden", width:windowWdth, alignItems:"center"}}>
                    <TouchableOpacity  style={{borderWidth:5,borderColor:"green",width:(windowWdth*0.8), height:"100%",borderRadius:10}}>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    //Fix Scrollable Press Problem
    const createFavBtn = () =>
    {
        if(mList.length > 0)
        {
            return (
                <View style={{position:"absolute",bottom: 275,left: (cardWdth - 30),right:0,height:40,overflow:"hidden", width:40, alignItems:"center"}}>
                    <TouchableOpacity style={{borderWidth:1,borderColor:"green",width:"100%", height:"100%",borderRadius:10}}>
                    </TouchableOpacity>
                </View>
            );
        }
    }

    return (
    <View style={styles.container}>
        {whileLoading()}
        {drawCardScrollList()}
        {/* {createUpdateBtn()}
        {createFavBtn()} */}
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
        height: 200,
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
        backgroundColor: "rgb(89,89,89)",
        borderRadius: 10,
        marginVertical:0,
        marginHorizontal: 0,
        height: '100%',
        width: cardWdth,    
    },
    textContent: {
        flex:2,
        padding:10,
    },
    cardTitle: {
        fontWeight: "bold",
        justifyContent:"center",
        fontSize: 24,
        color: "#F95F6B",
    },
    cardDescription: {
        fontSize:14,
        color: "red",
    }
})