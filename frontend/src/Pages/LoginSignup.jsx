import React, { useState } from 'react';
import './CSS/LoginSignup.css';
import Back from '../Components/Assets/Back.png';
import Mira from '../Components/Assets/Mira.jpg';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/login', { // Ensure the endpoint is correct
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  };

  const signup = async () => {
    console.log("Sign Up Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }

  };

  return (
    <div className='login-signup-container'>
      <div className='login-signup-content'>
        <img src={Mira} className='mira-img' alt="Mira" />
        <div className='loginsignup'>
          <div className='loginsignup-container'>
            <img src={Back} alt="Back" className='back-img' />
            <h1>{state}</h1>
            <div className='loginsignup-fields'>
              {state === "Sign Up" ? <input type="text" name='username' value={formData.username} onChange={changeHandler} placeholder='Your Name' /> : null}
              <input name='email' value={formData.email} onChange={changeHandler} type="text" placeholder='Email address' />
              <input name='password' value={formData.password} onChange={changeHandler} type='password' placeholder='Password' />
            </div>
            <button onClick={() => { state === "Login" ? login() : signup() }}>Continue</button>
            {state === "Sign Up" ? <p className='loginsignup-login'>Bạn đã có tài khoản?<span onClick={() => { setState("Login") }}>Đăng Nhập</span></p> :
              <p className='loginsignup-login'>Bạn chưa tạo tài khoản?<span onClick={() => { setState("Sign Up") }}>Đăng ký</span></p>}
            <div className="loginsinup-agree">
              <input type='checkbox' name='' id='' />
              <p>Tiếp tục, tôi đồng ý</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
