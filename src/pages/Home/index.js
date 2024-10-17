import React, { useContext, useEffect, useState } from 'react';
import { TouchableOpacity, Modal } from 'react-native';

import { AuthContext } from '../../contexts/auth'

import Header from '../../components/Header';
import { 
  Background, 
  ListBalance,
  Area,
  Title,
  List
 } from './styles'; 

import api from '../../services/api'
import { format } from 'date-fns';

import { useIsFocused } from '@react-navigation/native';
import BalanceItem from '../../components/BalanceItem';
import HistoricoList from '../../components/HistoricoList';
import CalendarModal from '../../components/CalendarModal'

import Icon from 'react-native-vector-icons/MaterialIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Home(){
  const isFocused = useIsFocused();
  const [listBalance, setListBalance] = useState([]);
  const [movements, setMovements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const [dateMovements, setDateMovements] = useState(new Date())


  useEffect(()=>{
    let isActive = true;

    async function getMovements(){

      let date = new Date(dateMovements)
      let onlyDate = date.valueOf() + date.getTimezoneOffset() * 60 * 1000;
      let dateFormated = format(onlyDate, 'dd/MM/yyyy');
      const storageUser = await AsyncStorage.getItem('@finToken');

      const receives = await api.get('api/Receive', {
        params:{
          date: dateFormated,
          userId: user.id
        },
        headers:{
          'Authorization': `Bearer ${storageUser}`
        }
      })

      const balance = await api.get('api/User', {
        params:{
          date: dateFormated,
          userId: user.id 
        }
      })

      if(isActive){
        setMovements(receives.data)
        setListBalance(balance.data);
      }
    }

    getMovements();

    return () => isActive = false;

  }, [isFocused, dateMovements])


  async function handleDelete(id) {
    try {
      await api.delete(`api/Receive/${id}`);
      setDateMovements(new Date());
    } catch (err) {
      console.log(err);
    }
  }

  function filterDateMovements(dateSelected){
    // console.log(dateSelected);
    setDateMovements(dateSelected);
  }


  return(
    <Background>
      <Header title="Minhas movimentações" />

      <ListBalance
        data={listBalance}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={ item => item.tag }
        renderItem={ ({ item }) => ( <BalanceItem data={item} /> )}
      />

      <Area>
        <TouchableOpacity onPress={ () => setModalVisible(true) }>
          <Icon name="event" color="#121212" size={30} />
        </TouchableOpacity>
        <Title>Ultimas movimentações</Title>
      </Area>

      <List
        data={movements}
        keyExtractor={ item => item.id }
        renderItem={ ({ item }) => <HistoricoList data={item} deleteItem={handleDelete} />  }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <CalendarModal
          setVisible={ () => setModalVisible(false) }
          handleFilter={filterDateMovements}
        />
      </Modal>


    </Background>
  )
}