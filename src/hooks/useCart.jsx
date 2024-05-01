import React from 'react'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthProvider'
import { useQuery } from '@tanstack/react-query';

const useCart = () => {
    const {user} = useContext(AuthContext);
     // console.log(user.email)
     const token = localStorage.getItem('access-token')
    const {refetch, data:cart = []}= useQuery({
      queryKey: ['carts', user?.email],
      queryFn: async () => {
        const response = await fetch(`https://fttoodie-server.onrender.com/carts?email=${user?.email}`,{
          headers: {
            authorization: `Bearer ${token}`
        }
        });
        return response.json();
      },

    })

  return [cart, refetch]
}

export default useCart
