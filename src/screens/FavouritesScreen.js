import React, { useState, useEffect } from "react";
import { View,Image, StyleSheet, Text, FlatList, Dimensions} from 'react-native'
import { useNavigation } from "@react-navigation/native";
import Logo from "../assets/logo.png";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TouchableOpacity } from "react-native-gesture-handler";

const windowWdth = Dimensions.get('window').width;
const cardWdth = windowWdth * 0.9;

export default function Favourites({navigation})
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

    //Reload Screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            setLoading(true);       
        });
        return unsubscribe;
      }, [navigation]);

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

            favouriteIdList.map((fList) =>
            {   
                placeSnapshot.forEach(doc => 
                {
                    const placeId = doc.id;
                    const placeName = doc.data().Name;
                    const placeStatus = doc.data().Status;

                    if(fList.placeId == placeId)
                    {
                        if(placeStatus == "Not Busy")
                        {   
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: NotBusyColor,
                            });
                        }
                        if (placeStatus == "Busy")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: BusyColor,
                            });
                        }
                        if (placeStatus == "Very Busy")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: VeryBusyColor,
                            });
                        }
                        if (placeStatus == "No Status")
                        {
                            favouritesList.push({
                                placeId: placeId,
                                placeName: placeName,
                                placeStatus: placeStatus,
                                placeStatusColor: NoStatusColor,
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
                <Text style={{color:"white"}}>{"Status: "}</Text>
                <Text numberOfLines={1} style={{color:item.placeStatusColor}}>{item.placeStatus}</Text>
            </View>
          )
      }

      const renderCardLastUpdated = (item) =>
      {
        return(
            <View style={{flexDirection:"row", marginLeft:cardWdth*0.05, marginTop: 5}}>
                <Text style={{color:"white"}}>{"Last Updated: "}</Text>
                <Text numberOfLines={1} style={{color:item.placeStatusColor}}>{item.placeStatus}</Text>
            </View>
          )
      }

      const renderItem = (item) => 
      {
          return(
          <View >
              <TouchableOpacity style={styles.itemBox}>
                  <Text style={{fontWeight: "bold",justifyContent:"center",fontSize: 20,color: "white", marginLeft:cardWdth *0.05 ,marginTop:10, marginBottom:10}}>{item.placeName}</Text>
                  {renderCardStatus(item)}
                  {renderCardLastUpdated(item)}
              </TouchableOpacity>
          </View>
          
      )};

      const whileLoading = () =>
      {
          if(loading)
          {
            return <Text style={{alignSelf: 'center'}}>Loading...</Text>;
          }
          else
          {  
            return <FlatList showsVerticalScrollIndicator={false} data={favouritePlacesList} renderItem={({item}) => renderItem(item)} keyExtractor={item => item.placeId} key={item => item.placeId}  />          
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
        backgroundColor: 'rgb(82,82,82)',
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
        backgroundColor: 'rgb(97,97,97)',
        borderRadius: 10,
    },
})