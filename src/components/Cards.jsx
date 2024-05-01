import React, { useContext, useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthProvider";
import Swal from 'sweetalert2'

const Cards = ({ item }) => {
  const {name, image, price, recipe, _id} = item;
     // console.log(item)
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const {user} = useContext(AuthContext);
  console.log(user);

  const navigate = useNavigate();
  const location = useLocation();
  //add to cart

  const handleAddtoCart = () => {
    if (user && user.email) {
        const cartItem = {
            menuItemId: _id,
            name,
            quantity: 1, // Corrected spelling to 'quantity'
            image,
            price,
            email: user.email
        };

        fetch('https://fttoodie-server.onrender.com/carts', {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(cartItem)
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to add item to cart");
            }
            return res.json();
        })
        .then((data) => {
            // Check if data contains expected fields
            if (data && data._id) { // Assuming '_id' is the field indicating successful addition
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Booked successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                throw new Error("Failed to add item to cart");
            }
        })
        .catch((error) => {
            console.error("Error adding item to cart:", error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to add item to cart. product added already."
            });
        });
    } else {
        // Handle case when user is not logged in
    }
};

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
  };
  return (
    <div to={`/menu/${item._id}`} className="card shadow-xl relative mr-5 md:my-5">
      <div
        className={`rating gap-1 absolute right-2 top-2 p-4 heartStar bg-green ${
          isHeartFilled ? "text-rose-500" : "text-white"
        }`}
        onClick={handleHeartClick}
      >
        <FaHeart className="w-5 h-5 cursor-pointer" />
      </div>
      <Link to={`/menu/${item._id}`}>
        <figure>
          <img src={item.image} alt="Shoes" className="hover:scale-105 transition-all duration-300 md:h-72" />
        </figure>
      </Link>
      <div className="card-body">
       <Link to={`/menu/${item._id}`}><h2 className="card-title">{item.name}!</h2></Link>
        <p>Description of the item</p>
        <div className="card-actions justify-between items-center mt-2">
          <h5 className="font-semibold">
            <span className="text-sm text-red">$ </span> {item.price}
          </h5>
          <button className="btn bg-green text-white" onClick={()=>handleAddtoCart(item)}>Add to cart </button>
        </div>
      </div>
    </div>
  )
}

export default Cards
