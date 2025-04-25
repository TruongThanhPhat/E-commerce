import React from 'react'
import './Offers.css'
import exclutive_image from '../Assets/exclusive_image.png'

 const Offers = () => {
  return (
    <div className='offers'>
        <div className="offers-left">
            <h1>DUY NHẤT</h1>
            <h1>Ưu đãi dành cho bạn</h1>
            <p>SẢN PHẨM BÁN CHẠY NHẤT</p>
            <button>XEM NGAY</button>
        </div>
        <div className="offers-rigth">
            <img src={exclutive_image} alt=""/>
        </div>
    </div>
  )
}

export default Offers