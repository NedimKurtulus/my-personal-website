import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface User {
    id: number;
    email: string;
    role: string;
    profilePhoto?: string;
    projects?: any[];
    createdAt?: string;
}

const Users: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Kullanıcılar alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (id === user?.id) {
            alert('Kendi hesabınızı silemezsiniz!');
            return;
        }

        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
            } catch (err) {
                console.error('Kullanıcı silinemedi:', err);
            }
        }
    };

    const updateUserRole = async (id: number, newRole: string) => {
        try {
            await api.patch(`/users/${id}`, { role: newRole });
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Rol güncellenemedi:', err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 Yetkisiz Erişim!</h2>
                    <p className="text-gray-600 mb-4">Bu sayfayı görüntülemek için admin yetkisine sahip olmalısınız.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Dashboard'a Dön
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
                    <p className="text-gray-600 mt-2">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                            <span className="text-2xl">👥</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Toplam Kullanıcı</p>
                            <p className="text-3xl font-bold">{users.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                            <span className="text-2xl">👑</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Admin Sayısı</p>
                            <p className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                            <span className="text-2xl">👤</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Kullanıcı Sayısı</p>
                            <p className="text-3xl font-bold">{users.filter(u => u.role === 'user').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Ort. Proje/Kullanıcı</p>
                            <p className="text-3xl font-bold">
                                {(users.reduce((acc, u) => acc + (u.projects?.length || 0), 0) / users.length).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeler</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredUsers.map((userItem) => (
                                <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{userItem.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-bold">
                                                    {userItem.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{userItem.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={userItem.role}
                                            onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${userItem.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                }`}
                                        >
                                            <option value="user">Kullanıcı</option>
                                            <option value="admin">Yönetici</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{userItem.projects?.length || 0} proje</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/user/profile/${userItem.id}`)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
                                            >
                                                Profil
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/all-projects?userId=${userItem.id}`)}
                                                className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 text-sm"
                                            >
                                                Projeleri
                                            </button>
                                            <button
                                                onClick={() => deleteUser(userItem.id)}
                                                disabled={userItem.id === user?.id}
                                                className={`px-3 py-1 rounded-lg text-sm ${userItem.id === user?.id
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-500 text-white hover:bg-red-600'
                                                    }`}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Kullanıcı bulunamadı</h3>
                        <p className="text-gray-500">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Bilgi</h3>
                <ul className="text-blue-700 list-disc pl-5 space-y-1">
                    <li>Kullanıcıların rollerini değiştirebilirsiniz</li>
                    <li>Bir kullanıcıyı sildiğinizde ona ait tüm projeler ve görevler de silinir</li>
                    <li>Kendi hesabınızı silemezsiniz</li>
                    <li>Her kullanıcının profil sayfasına giderek detayları görebilirsiniz</li>
                </ul>
            </div>
        </div>
    );
};

export default Users;