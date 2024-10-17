import React, { createContext, useState, useEffect } from 'react';

import api from '../services/api';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext({});

function AuthProvider({ children }){
  const [user, setUser] = useState(null); 
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();


  useEffect(() => {
    async function loadStorage(){
      const storageUser = await AsyncStorage.getItem('@finToken');

      if(storageUser){
        const response = await api.get({
          headers:{
            'Authorization': `${storageUser}`
          }
        })
        .catch(()=>{
          setUser(null);
        })

        api.defaults.headers['Authorization'] = `${storageUser}`;
        if(response) {
          setUser(response.data);
        }
        setLoading(false);

      }
      setLoading(false);
    }

    loadStorage();
  }, [])


  async function signUp(email, password, nome){
    setLoadingAuth(true);

    try{
      const response = await api.post('api/User', {
       name: nome,
       password: password,
       email: email,
      })
      setLoadingAuth(false);

      navigation.goBack();


    }catch(err){
      console.log("ERRO AO CADASTRAR", err);
      setLoadingAuth(false);
    }
  }

  async function signIn(email, password){
    setLoadingAuth(true);

    try{
      const response = await api.post('api/User/login', {
        email: email,
        password: password
      });

      const { Id, Name, Token } = response.data;

      const data = {
        id: Id,
        name: Name,
        token: Token,
        email,
      };

      await AsyncStorage.setItem('@finToken', Token);

      api.defaults.headers['Authorization'] = `${Token}`;

      setUser({
        Id,
        Name,
        email,
      });

      setLoadingAuth(false);

    }catch(err){
      console.log("ERRO AO LOGAR ", err);
      setLoadingAuth(false);
    }

  }


  async function signOut(){
    await AsyncStorage.clear()
    .then(() => {
      setUser(null);
    })
  }

  return(
    <AuthContext.Provider value={{ signed: !!user, user, signUp, signIn, signOut, loadingAuth, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;

