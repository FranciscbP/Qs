import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text,ScrollView,Animated,Dimensions,TouchableOpacity} from 'react-native';

import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps';

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function MainScreen({navigation, plce})
{
    const navigator = useNavigation();

    const user = auth().currentUser;
    const [loadMarkers, setLoadMarkers] = useState(true);

    const markersList = [];
    const [mList, setMList] = useState(markersList);

    const [selectedLocationIndex,setSelectedLocationIndex] = useState(0);

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
    const NoStatusColor = "orange";

    //Marker Favourtie Colours
    const FavouriteColor = "#F95F6B";
    const NoFavouriteColor = "white";

    let mapAnimation = new Animated.Value(0);
    let mapIndex = 0;

    const _map = React.useRef(null);
    const _scrollView = React.useRef(null);
    const _marker = React.useRef(null);

   //Get Data Realtime
   useEffect(() => {
    const subscriber = firestore()
      .collection('Reports')
      .onSnapshot(documentSnapshot => {
        setLoadMarkers(true);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [plce]);

    //https://stackoverflow.com/questions/25275696/javascript-format-date-time
    const formatDate = (date) =>
    {
        var hours = date.getHours();
        hours = hours < 10 ? '0'+hours : hours;
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes;
 
        return strTime + "  " + date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()
    }

      const checkReports = (repList, placeID) =>
      {
        let placeReports = [];
        let PlaceStatusReport = [];

        repList.map((rep) => {

            if(rep.place == placeID)
            {
                placeReports.push({
                    time: rep.time,
                    status: rep.status,
                })
            }
        });

        if (placeReports.length > 0)
        {
            let averageStatus = 0;
            let count = 0;

            placeReports.map((pR) =>{
                if(pR.status == "Not Busy")
                {
                    count = count + 1;
                }
                if(pR.status == "Busy")
                {
                    count = count + 2;
                }
                if(pR.status == "Very Busy")
                {
                    count = count + 3;
                }
            });
            
            averageStatus = Math.round(count / placeReports.length);
            const lastTime = placeReports[0].time;

            if(averageStatus == 1)
            {   
                PlaceStatusReport.push({
                    status: "Not Busy",
                    lastUpdated: formatDate(lastTime),
                })
            }
            if(averageStatus == 2)
            {
                PlaceStatusReport.push({
                    status: "Busy",
                    lastUpdated: formatDate(lastTime),
                })
            }
            if(averageStatus == 3)
            {
                PlaceStatusReport.push({
                    status: "Very Busy",
                    lastUpdated: formatDate(lastTime),
                })
            }
        }
        else
        {
            PlaceStatusReport.push({
                status: "No Status",
                lastUpdated: "No Status",
            })
        }
        return(PlaceStatusReport)

      }

    const getMarkers = async() =>
    {
        markersList.splice(0, markersList.length);

        const userRef = firestore().collection('Users').doc(user.uid);
        const userSnapshot = await userRef.get()

        const showBars = userSnapshot.data().showBars;
        const showClubs = userSnapshot.data().showClubs;
        const showRestaurants = userSnapshot.data().showRestaurants;

        if(showBars)
        {
            const bars = firestore().collection('Places').where('Type','==','Bar');
            const barsSnapshot = await bars.get();
        
            const reportsList = [];

            //Get Reports From Last Hour
            const currentHour = new Date();
            currentHour.setHours(currentHour.getHours()-1);
            const date = firestore.Timestamp.fromDate(currentHour);

            const reportsRef = firestore().collection('Reports').where('Time',">=",date).orderBy('Time','desc');
            const repSnapshot = await reportsRef.get();

            repSnapshot.forEach(doc =>
            {
                const place = doc.data().PlaceID;
                const time = doc.data().Time;
                const status = doc.data().Status;
                
                reportsList.push({
                    place: place,
                    time: time.toDate(),
                    status: status,
                })
            });

            barsSnapshot.forEach(doc => 
            {
                const placeId = doc.id;
                const placeName = doc.data().Name;
                const placeLocation = doc.data().Location;
                let placeStatus;
                let lastReport;

                if(reportsList.length > 0)
                {
                    const checkPlaceReports = checkReports(reportsList,placeId);
                    placeStatus = checkPlaceReports[0].status;
                    lastReport = checkPlaceReports[0].lastUpdated;
                }
                else
                {
                    placeStatus = "No Status";
                    lastReport = "No Status";
                }
                
                if(placeStatus == "Not Busy")
                {   
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: BusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Very Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: VeryBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "No Status")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NoStatusColor,
                        placeLastReport: lastReport,
                    });
                }
            });
        }

        if(showClubs)
        {
            const clubs = firestore().collection('Places').where('Type','==','Club');
            const clubsSnapshot = await clubs.get();

            const reportsList = [];

            //Get Reports From Last Hour
            const currentHour = new Date();
            currentHour.setHours(currentHour.getHours()-1);
            const date = firestore.Timestamp.fromDate(currentHour);

            const reportsRef = firestore().collection('Reports').where('Time',">=",date).orderBy('Time','desc');
            const repSnapshot = await reportsRef.get();

            repSnapshot.forEach(doc =>
            {
                const place = doc.data().PlaceID;
                const time = doc.data().Time;
                const status = doc.data().Status;
                
                reportsList.push({
                    place: place,
                    time: time.toDate(),
                    status: status,
                })
            });

            clubsSnapshot.forEach(doc => 
            {
                const placeId = doc.id;
                const placeName = doc.data().Name;
                const placeLocation = doc.data().Location;
                let placeStatus;
                let lastReport;

                if(reportsList.length > 0)
                {
                    const checkPlaceReports = checkReports(reportsList,placeId);
                    placeStatus = checkPlaceReports[0].status;
                    lastReport = checkPlaceReports[0].lastUpdated;
                }
                else
                {
                    placeStatus = "No Status";
                    lastReport = "No Status";
                }
                
                if(placeStatus == "Not Busy")
                {   
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: BusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Very Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: VeryBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "No Status")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NoStatusColor,
                        placeLastReport: lastReport,
                    });
                }
            });
        }

        if(showRestaurants)
        {
            const restaurants = firestore().collection('Places').where('Type','==','Restaurant');
            const restaurantsSnapshot = await restaurants.get();

            const reportsList = [];

            //Get Reports From Last Hour
            const currentHour = new Date();
            currentHour.setHours(currentHour.getHours()-1);
            const date = firestore.Timestamp.fromDate(currentHour);

            const reportsRef = firestore().collection('Reports').where('Time',">=",date).orderBy('Time','desc');
            const repSnapshot = await reportsRef.get();

            repSnapshot.forEach(doc =>
            {
                const place = doc.data().PlaceID;
                const time = doc.data().Time;
                const status = doc.data().Status;
                
                reportsList.push({
                    place: place,
                    time: time.toDate(),
                    status: status,
                })
            });

            restaurantsSnapshot.forEach(doc => 
            {
                const placeId = doc.id;
                const placeName = doc.data().Name;
                const placeLocation = doc.data().Location;
                let placeStatus;
                let lastReport;

                if(reportsList.length > 0)
                {
                    const checkPlaceReports = checkReports(reportsList,placeId);
                    placeStatus = checkPlaceReports[0].status;
                    lastReport = checkPlaceReports[0].lastUpdated;
                }
                else
                {
                    placeStatus = "No Status";
                    lastReport = "No Status";
                }
                
                if(placeStatus == "Not Busy")
                {   
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NotBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: BusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "Very Busy")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: VeryBusyColor,
                        placeLastReport: lastReport,
                    });
                }
                if (placeStatus == "No Status")
                {
                    markersList.push({
                        placeId: placeId,
                        placeName: placeName,
                        placeLocation: placeLocation,
                        placeStatus: placeStatus,
                        placeStatusColor: NoStatusColor,
                        placeLastReport: lastReport,
                    });
                }
            });
        }
        
        const data = markersList;
        return data;
    }

    if (loadMarkers)
    {
        getMarkers()
        .then(data => 
        {    
            if(selectedLocationIndex >= data.length)
            {
                setSelectedLocationIndex(0);
                setMList(data);
            }
            else
            {
                setMList(data);
            }
        })
        .then(()=>{setLoadMarkers(false);}).then(() =>
        {
            if(selectedLocationIndex != 0)
            {
                _scrollView.current.scrollToOffset({ animated: false, offset: (selectedLocationIndex * windowWdth) });
            }
            
        }); 
    }

    const drawMarkers = () =>
    {
        if (mList.length > 0)
        {
            return mList.map((mLst,index) =>  
                    <Marker 
                    ref={_marker}
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
        
    const renderCard = (item) =>
    {   
        return(
            <View style={styles.card}>
                <View style={{flex:1,alignItems:"center",justifyContent:"center", flexDirection:"row",marginLeft: cardWdth * 0.05,width:cardWdth*0.9}}>
                    <Text style={styles.cardTitle}>{item.placeName}</Text>
                </View>
                <View style={{flex:2}}> 
                    <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row"}}>
                        <Text style={{color:"rgb(60,60,60)"}}>Queue Status: </Text>
                        <Text numberOfLines={1} style={{fontSize:14,color:item.placeStatusColor, marginLeft:0}}>{item.placeStatus}</Text>
                    </View>
                    <View style={{marginLeft: cardWdth * 0.05, flexDirection:"row",marginTop:5}}> 
                        <Text style={{color:"rgb(60,60,60)"}}>Last Updated: </Text>
                        <Text numberOfLines={1} style={{fontSize:14,color: "white", marginLeft:0}}>{item.placeLastReport}</Text>
                    </View>
                    <View style={{justifyContent:"center", alignItems:"center",width:cardWdth,marginTop:15}}>
                        <TouchableOpacity onPress={() => {navigator.navigate("PlaceScreen",{screen:"PlaceScreen",params: { place: item},});}} style={{width: (cardWdth * 0.9), height: 50,backgroundColor:'#F95F6B',borderRadius: 10,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white"}}>Open</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>      
          )
    }

    const drawCardFlatList = () =>
    {
        if(!loadMarkers)
        {   
            if (mList.length > 0)
            {
                return <Animated.FlatList ref={_scrollView} horizontal scrollEventThrottle={1} pagingEnabled snapToInterval={windowWdth} snapToAlignment="center" onScroll={onScroll()} style={styles.scrollView} showsHorizontalScrollIndicator={false} data={mList} renderItem={({item}) => renderCard(item)} keyExtractor={item => item.placeId}/>
            }
        }
    }

    const onMarkerPress = (mapEventData) =>
    {
        const markerID = mapEventData._targetInst.return.index;
        let x = (markerID * windowWdth);

        _scrollView.current.scrollToOffset({ animated: false, offset: x });

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
    
    const whileLoading = () =>
    {
        if(loadMarkers)
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
        {drawCardFlatList()}
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