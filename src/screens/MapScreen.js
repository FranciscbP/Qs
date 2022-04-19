import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, TouchableOpacity,ScrollView,Animated,Dimensions } from 'react-native'
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps';

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function MainScreen({navigation})
{
    const navigator = useNavigation();

    const markersData = [];
    const user = auth().currentUser;
    const [loadMarkers, setLoadMarkers] = useState(true);
    
    const markersList = [];
    const [mList, setMList] = useState(markersList);

    const [selectedLocationIndex,setSelectedLocationIndex] = useState(0);

    const [toFirstCard,setToFirstCard] = useState(0);

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
    const NoStatusColor = "grey";

    let mapAnimation = new Animated.Value(0);
    let mapIndex = 0;

    const _map = React.useRef(null);
    const _scrollView = React.useRef(null);

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

    const showMarker = (index) =>
    {
        if(mList[index].placeStatus == "Not Busy")
        {
            return(
                <Animated.Image 
                source={require('../assets/marker-notBusy.png')}
                resizeMode="cover"
                style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
            />
            )
        }
        else if(mList[index].placeStatus == "Busy")
        {
            return(
                <Animated.Image 
                source={require('../assets/marker-busy.png')}
                resizeMode="cover"
                style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
            />
            )
        }
        else if(mList[index].placeStatus == "Very Busy")
        {
            return(
                <Animated.Image 
                source={require('../assets/marker-veryBusy.png')}
                resizeMode="cover"
                style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
            />
            )
        }
        else if (mList[index].placeStatus == "No Status")
        {
            return(
                <Animated.Image 
                source={require('../assets/marker-noStatus.png')}
                resizeMode="cover"
                style={{maxHeight: index === selectedLocationIndex ? 40 : 30, maxWidth: index === selectedLocationIndex ? 40 : 30}}
            />
            )
        }
    }

    const drawMarkers = () =>
    {
        if (mList.length > 0)
        {
            return mList.map((mLst,index) =>  
                    <Marker 
                    key={index}
                    coordinate={{latitude: mLst.placeLocation.latitude,longitude: mLst.placeLocation.longitude}}
                    // title={mLst.placeName}
                    // description={mLst.placeStatus}
                    // pinColor={mLst.placeStatusColor}
                    zIndex={selectedLocationIndex == index ? 999 : 0}
                    onPress={(e) => onMarkerPress(e)}
                    >
                        <Animated.View style={{alignItems:"center", justifyContent:"center",width:40,height:40,}}>
                            {showMarker(index)}
                        </Animated.View>
                    </Marker>  
            );
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
                                    <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                                        <Text numberOfLines={1} style={styles.cardTitle}>{mLst.placeName}</Text>
                                    </View>
                                    <View style={{flex:2}}> 
                                        <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row"}}>
                                            <Text style={{color:"grey"}}>Queue Status: </Text>
                                            <Text numberOfLines={1} style={{fontSize:14,color:mLst.placeStatusColor, marginLeft:0}}>{mLst.placeStatus}</Text>
                                        </View>
                                        <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row"}}> 
                                            <Text style={{color:"grey"}}>Last Updated: </Text>
                                            <Text numberOfLines={1} style={{fontSize:14,color:mLst.placeStatusColor, marginLeft:0}}>{mLst.placeStatus}</Text>
                                        </View>
                                        <View style={{justifyContent:"center", alignItems:"center",width:cardWdth,marginTop:20,}}>
                                            <TouchableOpacity onPress={onButtonPress()} style={{width: (cardWdth * 0.9), height: 50,backgroundColor:'#F95F6B',borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                                                <Text style={{color:"white"}}>Update Queue Status</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

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
                if(toFirstCard != 1)
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
            }
    });
});
    
    const onButtonPress = () => 
    {


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
        justifyContent:"center",
        fontSize: 24,
        color: "#F95F6B",
    },
    cardDescription: {
        fontSize:14,
        color: "red",
    }
})