import React from 'react'
import './Hero.css'
import hand_icon from '../Assets/hand_icon.png'
import arrow_icon from '../Assets/arrow.png'
import hero_image from '../Assets/hero_image.png'
const Hero = () => {
  return (
    <div className='hero'>
        <div className="hero-left">
            <h2>HOT</h2>
            <div>
                <div className="hero-hand-icon">
                    <p>MỚI</p>
                    <img src={hand_icon} alt="" />
                </div>
                <p>Bộ sưu tập</p>
                <p>Phù hợp nhất cho mọi người</p>
            </div>
            <div className="hero-latest-btn">
                <div>Bộ sưu tập mới nhất</div>
                <img src={arrow_icon} alt="" />
            </div>
        </div>
        <div className="hero-right">
            <img src={hero_image} alt="" />
        </div>
    </div>
  )
}

export default Hero