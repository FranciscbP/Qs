import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text,TouchableOpacity,Dimensions} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MapView, { PROVIDER_GOOGLE , Marker, Callout} from 'react-native-maps';

import {Picker} from '@react-native-picker/picker';

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function Place({route,navigation,stat})
{
    const navigator = useNavigation();
    const user = auth().currentUser;

    const place = route.params.params.place;

    const placeID = place.placeId;
    const placeName = place.placeName;
    
   //Status Colours
   const VeryBusyColor = "red";
   const BusyColor = "yellow";
   const NotBusyColor ="green";
   const NoStatusColor = "orange";

    //USeState Variables
    const [isFavourite, setIsFavourite] = useState(false);
    const [location,setLocation] = useState("");
    const [status,setStatus] = useState("");
    const [lastStatusTime, setLastStatusTime] = useState("");
    const [numberOfReports,setNumberOfReports] = useState(0);
    const [selectedValue, setSelectedValue] = useState("Not Busy");

    //Loads
    const [checkFavourite, setCheckFavourite] = useState(true);
    const [loadLocation, setLoadLocation] = useState(true);
    const [loadStatus, setLoadStatus] = useState(true);

    //Get Data Realtime
    useEffect(() => {
        const subscriber = firestore()
          .collection('Reports')
          .onSnapshot(documentSnapshot => {
            getStatus().then((data) => 
            {
                if(data.length > 0)
                {
                    let averageStatus = 0;
                    let count = 0;

                    data.map((d) =>{
                        if(d.status == "Not Busy")
                        {
                            count = count + 1;
                        }
                        if(d.status == "Busy")
                        {
                            count = count + 2;
                        }
                        if(d.status == "Very Busy")
                        {
                            count = count + 3;
                        }
                    });
                    
                    averageStatus = Math.round(count / data.length);
                    
                    if(averageStatus == 1)
                    {   
                        setStatus("Not Busy");
                    }
                    if(averageStatus == 2)
                    {
                        setStatus("Busy");
                    }
                    if(averageStatus == 3)
                    {
                        setStatus("Very Busy");
                    }

                    const lastTime = data[0].time;

                    setLastStatusTime(formatDate(lastTime));
                    setNumberOfReports(data.length);
                }
                else
                {
                    setStatus("No Status");
                }

            });
          });
    
        // Stop listening for updates when no longer required
        return () => subscriber();
      }, [stat]);

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

    const getStatus = async() =>
    {
        const updatesList = [];
        const currentHour = new Date();
        
        currentHour.setHours(currentHour.getHours()-1);

        const date = firestore.Timestamp.fromDate(currentHour);

        const favRef = firestore().collection('Reports').where('Time',">=",date).where('PlaceID','==', placeID).orderBy('Time','desc');
        const favSnapshot = await favRef.get();

        favSnapshot.forEach(doc =>
        {
            const time = doc.data().Time;
            const status = doc.data().Status;
            
            updatesList.push({
                time: time.toDate(),
                status: status,
            })
        });

        return updatesList;
    }

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
        getStatus().then((data) => 
        {
            if(data.length > 0)
            {
                let averageStatus = 0;
                let count = 0;

                data.map((d) =>{
                    if(d.status == "Not Busy")
                    {
                        count = count + 1;
                    }
                    if(d.status == "Busy")
                    {
                        count = count + 2;
                    }
                    if(d.status == "Very Busy")
                    {
                        count = count + 3;
                    }
                });
                
                averageStatus = Math.round(count / data.length);
                
                if(averageStatus == 1)
                {   
                    setStatus("Not Busy");
                    setSelectedValue("Not Busy");
                }
                if(averageStatus == 2)
                {
                    setStatus("Busy");
                    setSelectedValue("Busy");
                }
                if(averageStatus == 3)
                {
                    setStatus("Very Busy");
                    setSelectedValue("Very Busy");
                }

                const lastTime = data[0].time;
                
                setLastStatusTime(formatDate(lastTime));
                setNumberOfReports(data.length);
            }
            else
            {
                setStatus("No Status");
                setSelectedValue("Not Busy");
            }

        }).then(() => setLoadStatus(false));
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

    const updateStatus = async(status) =>
    {
        const updatesList = [];
        let currentHour = new Date();
        
        currentHour.setHours(currentHour.getHours()-1);

        const date = firestore.Timestamp.fromDate(currentHour);

        const favRef = firestore().collection('Reports').where('Time',">=",date).where('UserID','==', user.uid).where('PlaceID','==', placeID).orderBy('Time','desc');
        const favSnapshot = await favRef.get();

        favSnapshot.forEach(doc =>
        {
            const time = doc.data().Time;
            
            updatesList.push({
                time: time.toDate(),
            })
        });
        if(updatesList.length > 0)
        {
            const lastTime = updatesList[0].time;
            currentHour = new Date(); 
            currentHour.setHours(currentHour.getHours());

            let difference = Math.abs(lastTime.getTime()-currentHour.getTime());
            let resultInMinutes = Math.round(difference / 60000);

            if(resultInMinutes < 5)
            {
                alert("Please wait " + (5-resultInMinutes) + " minutes to send another report!")
            }
            else
            {
                firestore()
                .collection('Reports')
                .add({
                    PlaceID: placeID,
                    UserID: user.uid,
                    Status: status,
                    Time: firestore.FieldValue.serverTimestamp(),
                })
            }
        }
        else
        {
            firestore()
            .collection('Reports')
            .add({
                PlaceID: placeID,
                UserID: user.uid,
                Status: status,
                Time: firestore.FieldValue.serverTimestamp(),
            })
        }
  
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
                    latitudeDelta: 0.0008,
                    longitudeDelta: 0.0008,
                }}>
                    <Marker 
                        coordinate={{latitude: location.latitude,longitude: location.longitude}}
                    />
                </MapView>
            )
        }
    }

    const whileLoadingLastStatus = () =>
    {
        if(loadStatus)
        {
            return <Text style={{flex:1,fontSize:20}}>Loading...</Text>
        }
        else
        {
            if(status == "No Status")
            {
                return <Text style={{flex:1,fontSize:20, color:"white"}}>No Status</Text>
            }
            else
            {
                return <Text style={{flex:1,fontSize:20, color:"white"}}>{lastStatusTime}</Text>
            }
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

    const whileLoadingNumberOfReports = () =>
    {
        if(loadStatus)
        {
            return <Text style={{flex:1,fontSize:20}}>Loading...</Text>
        }
        else
        {
            if(status == "No Status")
            {
                return <Text style={{flex:1,fontSize:20, color:"white"}}>0</Text>
            }
            else
            {
                return <Text style={{flex:1,fontSize:20, color:"white"}}>{numberOfReports}</Text>
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
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row", height:30}}>
                        <Text style={{flex:3,fontSize:18,color:"rgb(60,60,60)"}}>Queue Status:</Text>
                        <View style={{alignItems:"flex-end", marginRight:5}}>
                            {whileLoadingQueueStatus()}
                        </View>
                       
                    </View>
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row", height:30}}>
                        <Text style={{flex:3,fontSize:18,color:"rgb(60,60,60)"}}>Last Report:</Text>
                        <View style={{alignItems:"flex-end", marginRight:5}}>
                            {whileLoadingLastStatus()}
                        </View>
                        
                    </View>
                    <View style={{marginTop:10,marginLeft:windowWdth*0.05,marginRight:windowWdth*0.05,alignItems:"center", flexDirection:"row", heigh:30}}>
                        <Text style={{flex:3,fontSize:18,color:"rgb(60,60,60)"}}>Last Hour Reports:</Text>
                        <View style={{alignItems:"flex-end", marginRight:5}}>
                            {whileLoadingNumberOfReports()}
                        </View>
                    </View>
                    <View style={{alignItems:"center", flex:1, justifyContent:"flex-end",marginBottom:30}}>
                        <View style={{marginTop:20,alignItems:"center",borderRadius: 10,overflow:"hidden",borderColor:"grey", width: windowWdth * 0.9}}>
                            <Picker
                                selectedValue={selectedValue}
                                style={{width: "100%", height: 50,backgroundColor: "grey",justifyContent:"center", textAlign:"center"}}
                                onValueChange={(itemValue) => {setSelectedValue(itemValue)}}
                            >
                                <Picker.Item label="Not Busy" value="Not Busy"/>
                                <Picker.Item label="Busy" value="Busy"/>
                                <Picker.Item label="Very Busy" value="Very Busy"/>
                            </Picker>
                        </View>

                        <TouchableOpacity onPress={()=> {updateStatus(selectedValue)}} style={{width: windowWdth * 0.9, height: 90, marginTop:20,backgroundColor:"#F95F6B",borderRadius: 15,justifyContent:"center", alignItems:"center"}}>
                            <Text style={{color:"white", fontSize:25}}>Send Report</Text>
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
        height:"100%",
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
        fontSize: 30,
        color: "#F95F6B",
    },

    subtitle: {
        justifyContent:"center",
        fontSize: 24,
        color: "white",
    },
})