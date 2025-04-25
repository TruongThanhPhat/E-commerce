import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import cross_icon from '../../assets/cross_icon.png';
import eye_icon from '../../assets/eye_icon.png'; // Biểu tượng để hiển thị mật khẩu
import eye_off_icon from '../../assets/eye_off_icon.png'; // Biểu tượng để ẩn mật khẩu
import edit_icon from '../../assets/edit_icon.png'; // Biểu tượng để chỉnh sửa thông tin

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [showPasswords, setShowPasswords] = useState({}); // State để theo dõi trạng thái hiển thị mật khẩu của từng người dùng
    const [editingUser, setEditingUser] = useState(null); // State để theo dõi người dùng đang được chỉnh sửa
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:4000/users');
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        try {
            await fetch(`http://localhost:4000/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            fetchUsers(); // Refresh the list after deletion
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    const toggleShowPassword = (id) => {
        setShowPasswords((prevState) => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const startEditing = (user) => {
        setEditingUser(user._id);
        setEditFormData({
            name: user.name,
            email: user.email,
            password: user.password
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`http://localhost:4000/users/${editingUser}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });
            setEditingUser(null);
            fetchUsers(); // Refresh the list after updating
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        return new Date(dateString).toLocaleString('vi-VN', options);
    };

    return (
        <div className='user-management'>
            <h1>Quản lý tài khoản người dùng</h1>
            <div className="user-management-header">
                <p>Tên</p>
                <p>Email</p>
                <p>Mật khẩu</p>
                <p>Ngày tạo</p>
                <p>Ngày cập nhật</p>
                <p>UPDATE</p>
            </div>
            <div className="user-management-list">
                <hr />
                {users.map((user, index) => (
                    <div key={index} className="user-management-item">
                        <p>{user.name}</p>
                        <p>{user.email}</p>
                        <p>
                            {showPasswords[user._id] ? user.password : '••••••'}
                            <img 
                                onClick={() => toggleShowPassword(user._id)} 
                                className='user-management-toggle-password' 
                                src={showPasswords[user._id] ? eye_off_icon : eye_icon} 
                                alt="Toggle Password" 
                            />
                        </p>
                        <p>{formatDate(user.date)}</p>
                        <p>{user.updated_at ? formatDate(user.updated_at) : 'Chưa cập nhật'}</p>
                        <div className="user-management-actions">
                            <img 
                                onClick={() => deleteUser(user._id)} 
                                className='user-management-delete-icon' 
                                src={cross_icon} 
                                alt="Delete" 
                            />
                            <img 
                                onClick={() => startEditing(user)} 
                                className='user-management-edit-icon' 
                                src={edit_icon} 
                                alt="Edit" 
                            />
                        </div>
                    </div>
                ))}
            </div>
            {editingUser && (
                <div className="edit-user-form">
                    <h2>Chỉnh sửa thông tin người dùng</h2>
                    <form onSubmit={handleEditSubmit}>
                        <label>Tên</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={editFormData.name} 
                            onChange={handleEditChange} 
                        />
                        <label>Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={editFormData.email} 
                            onChange={handleEditChange} 
                        />
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={editFormData.password} 
                            onChange={handleEditChange} 
                        />
                        <button type="submit">Cập nhật</button>
                        <button type="button" onClick={() => setEditingUser(null)}>Hủy</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
