import React from 'react'
import './NewsLetter.css'
import new_collection from '../Assets/new_collections'

const NewsLetter = () => {
  return (
    <div className='newsletter'>
        <h1>Nhận ưu đãi độc quyền qua email của bạn</h1>
        <p>Theo dõi thông tin mới nhất của chúng tôi và cập nhật</p>
        <div>
            <input type="email" placeholder='Địa chỉ Email của bạn' />
            <button>Theo dõi</button>
        </div>
    </div>
  )
}

export default NewsLetter