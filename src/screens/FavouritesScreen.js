import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, FlatList, Dimensions,TouchableOpacity} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function Favourites({navigation,plce})
{
    const navigator = useNavigation();

    const user = auth().currentUser;
    const favouriteIdList = [];
    const favouritesList = [];
    const [favouritePlacesList, setFavouritePlacesList] = useState(favouritesList);
    const [loading, setLoading] = useState(false);

    //Marker busy state Colours
    const VeryBusyColor = "red";
    const BusyColor = "yellow";
    const NotBusyColor ="green";
    const NoStatusColor = "orange";

   //Get Data Realtime
   useEffect(() => {
    const subscriber = firestore()
      .collection('Reports')
      .onSnapshot(documentSnapshot => {
        setLoading(true);
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [plce]);

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            setLoading(true);       
        });
        return unsubscribe;
      }, [navigation]);

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

      const getFavourites = async() =>
      {

        favouriteIdList.splice(0, favouriteIdList.length);
        favouritesList.splice(0, favouritesList.length);

        const favRef = firestore().collection('Favourites').where('UserID','==', user.uid);
        const favSnapshot = await favRef.get();

        favSnapshot.forEach(doc =>
        {
            const favPlaceId = doc.data().PlaceID;

            favouriteIdList.push({
                placeId: favPlaceId,
            })
        });

        if(favouriteIdList.length > 0)
        {   
            const placeRef = firestore().collection('Places');
            const placeSnapshot = await placeRef.get();

            const reportsList = [];

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

            favouriteIdList.map((fList) =>
            {   
                placeSnapshot.forEach(doc => 
                {
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    let placeStatus;
                    let lastReport;

                    if(fList.placeId == placeId)
                    {   
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
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: NotBusyColor,
                                placeLastReport: lastReport,
                            });
                        }
                        if (placeStatus == "Busy")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: BusyColor,
                                placeLastReport: lastReport,
                            });
                        }
                        if (placeStatus == "Very Busy")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: VeryBusyColor,
                                placeLastReport: lastReport,
                            });
                        }
                        if (placeStatus == "No Status")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: NoStatusColor,
                                placeLastReport: lastReport,
                            });
                        }
                    }
                });
            });
        }
        const data = favouritesList;
        return data;
      }

      if(loading)
      {
        getFavourites().then(data => {setFavouritePlacesList(data)})
        .then(()=>{setLoading(false)}); 
      }

      const renderCardStatus = (item) =>
      {
          return(
            <View style={{flexDirection:"row", marginLeft:cardWdth*0.05}}>
                <Text style={{color:"grey"}}>{"Status: "}</Text>
                <Text numberOfLines={1} style={{color:item.placeStatusColor}}>{item.placeStatus}</Text>
            </View>
          )
      }

      const renderCardLastUpdated = (item) =>
      {
        return(
            <View style={{flexDirection:"row", marginLeft:cardWdth*0.05, marginTop: 5}}>
                <Text style={{color:"grey"}}>{"Last Updated: "}</Text>
                <Text numberOfLines={1} style={{color:"white"}}>{item.placeLastReport}</Text>
            </View>
          )
      }

      const renderItem = (item) => 
      {
          return(
          <View>
              <TouchableOpacity style={styles.itemBox} onPress={() => {navigator.navigate("PlaceScreen",{screen:"PlaceScreen",params: { place: item},});}}>
                  <Text style={{fontWeight: "bold",justifyContent:"center",fontSize: 20,color: "white", marginLeft:cardWdth *0.05 ,marginTop:10, marginBottom:10}}>{item.placeName}</Text>
                  {renderCardStatus(item)}
                  {renderCardLastUpdated(item)}
              </TouchableOpacity>
          </View>      
        )
    };

      const whileLoading = () =>
      {
          if(loading)
          {
            return <Text style={{alignSelf: 'center'}}></Text>;
          }
          else
          {  
            return <FlatList showsVerticalScrollIndicator={false} data={favouritePlacesList} renderItem={({item}) => renderItem(item)} keyExtractor={item => item.placeId}/>          
          }
      }

    return(
    <View style={styles.container}>
        <Image source={Logo} style={styles.logo}></Image>
        <View style={styles.mainContainer}>
            <Text style={{marginBottom: '5%',fontSize: 25, color:'#F95F6B'}}>Favourites</Text>
            <View style={{width:"100%", height:"70%"}}>
                {whileLoading()}
            </View>
        </View>
    </View>
    );
}

const styles = StyleSheet.create({
    container:
    { 
        flex:1,
        backgroundColor: 'rgb(81,81,81)',
        alignItems:'center',
        justifyContent:'center'
    },
    mainContainer:
    {
        width: '90%',
        height: '70%',
    },
    logo:
    {
        tintColor:'#F95F6B',
        maxWidth:200,
        maxHeight:200,
    },
    itemBox:
    {   
        marginBottom: 10,
        overflow:"hidden",
        height: 115,
        width: cardWdth,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: 'grey',
        backgroundColor: "rgb(61,61,61)",
        borderRadius: 10,
    },
})