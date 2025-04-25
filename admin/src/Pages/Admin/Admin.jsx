import React from 'react'
import'./Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes,Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import ThongKe from '../../Components/ThongKe/ThongKe'
import UserManagement from '../../Components/UserManagement/UserManagement'
import DonHang from '../../Components/DonHang/DonHang'

const Admin = () => {
  return (
    <div className='admin'>
        <Sidebar/>
        <Routes>
            <Route path='/addproduct' element={<AddProduct/>}/>
            <Route path='/listproduct' element={<ListProduct/>}/>
            <Route path='/thongke' element={<ThongKe/>}/>
            <Route path='/usermanagement' element={<UserManagement/>}/>
            <Route path='/donhang' element={<DonHang/>}/>
        </Routes>
    </div>
  )
}

export default Admin