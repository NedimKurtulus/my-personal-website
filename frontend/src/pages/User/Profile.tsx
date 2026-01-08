import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface UserProfile {
    id: number;
    email: string;
    role: string;
    profilePhoto?: string;
    createdAt: string;
    projects?: Array<{
        id: number;
        title: string;
        taskCount: number;
    }>;
}

const Profile: React.FC = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const userId = id ? parseInt(id) : currentUser?.id;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);

    // Form states
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setProfile(response.data);
            setEmail(response.data.email);
        } catch (err) {
            console.error('Profil bilgileri alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/users/${userId}`, { email });
            setProfile(prev => prev ? { ...prev, email } : null);
            setEditMode(false);
            showMessage('Profil başarıyla güncellendi!', 'success');
        } catch (err) {
            console.error('Profil güncellenemedi:', err);
            showMessage('Profil güncellenirken hata oluştu', 'error');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showMessage('Yeni şifreler eşleşmiyor!', 'error');
            return;
        }

        try {
            // Not: Backend'de password update endpoint'i gerekli
            await api.patch(`/users/${userId}/password`, {
                currentPassword,
                newPassword
            });

            setPasswordMode(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showMessage('Şifre başarıyla değiştirildi!', 'success');
        } catch (err) {
            console.error('Şifre değiştirilemedi:', err);
            showMessage('Şifre değiştirilirken hata oluştu', 'error');
        }
    };

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const isViewingOwnProfile = !id || parseInt(id) === currentUser?.id;
    const isAdminViewing = currentUser?.role === 'admin' && id;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Yükleniyor...</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Profil Bulunamadı</h2>
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Message Alert */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isViewingOwnProfile ? 'Profilim' : 'Kullanıcı Profili'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isViewingOwnProfile
                            ? 'Profil bilgilerinizi görüntüleyin ve düzenleyin'
                            : `${profile.email} kullanıcısının profil bilgileri`}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                    Geri Dön
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center space-x-6 mb-6">
                            <div className="flex-shrink-0">
                                <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center">
                                    {profile.profilePhoto ? (
                                        <img
                                            src={profile.profilePhoto}
                                            alt={profile.email}
                                            className="h-24 w-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl text-blue-600 font-bold">
                                            {profile.email.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800">{profile.email}</h2>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {profile.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        Üyelik: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                {isViewingOwnProfile && (
                                    <div className="flex space-x-3 mt-4">
                                        <button
                                            onClick={() => setEditMode(true)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                                        >
                                            Profili Düzenle
                                        </button>
                                        <button
                                            onClick={() => setPasswordMode(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                                        >
                                            Şifre Değiştir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Profile Form */}
                        {editMode && isViewingOwnProfile && (
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Profili Düzenle</h3>
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditMode(false);
                                                setEmail(profile.email);
                                            }}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Change Password Form */}
                        {passwordMode && isViewingOwnProfile && (
                            <div className="border-t pt-6 mt-6">
                                <h3 className="text-lg font-semibold mb-4">Şifre Değiştir</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            En az 8 karakter, büyük/küçük harf, sayı ve özel karakter içermeli
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                        >
                                            Şifreyi Değiştir
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPasswordMode(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                            }}
                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Projects Section */}
                    {profile.projects && profile.projects.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                {isViewingOwnProfile ? 'Projelerim' : 'Projeler'} ({profile.projects.length})
                            </h3>
                            <div className="space-y-4">
                                {profile.projects.map(project => (
                                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{project.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{project.taskCount} görev</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/user/my-tasks?projectId=${project.id}`)}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                Görevleri Gör
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Stats & Actions */}
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">İstatistikler</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Toplam Proje</span>
                                <span className="font-bold">{profile.projects?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Toplam Görev</span>
                                <span className="font-bold">
                                    {profile.projects?.reduce((acc, p) => acc + p.taskCount, 0) || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Üyelik Süresi</span>
                                <span className="font-bold">
                                    {Math.floor((new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))} gün
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Rol</span>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${profile.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {profile.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/user/my-projects')}
                                className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 text-left flex items-center"
                            >
                                <span className="mr-3">📁</span>
                                Projelerime Git
                            </button>
                            <button
                                onClick={() => navigate('/user/my-tasks')}
                                className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 text-left flex items-center"
                            >
                                <span className="mr-3">📋</span>
                                Görevlerime Git
                            </button>
                            {currentUser?.role === 'admin' && !isViewingOwnProfile && (
                                <button
                                    onClick={() => navigate(`/admin/users`)}
                                    className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 text-left flex items-center"
                                >
                                    <span className="mr-3">👥</span>
                                    Kullanıcı Yönetimine Dön
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdminViewing && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-red-800 mb-3">Yönetici İşlemleri</h3>
                            <p className="text-sm text-red-700 mb-4">
                                Bu kullanıcıyı yönetmek için dikkatli olun.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate(`/admin/users`)}
                                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                                >
                                    Rolünü Değiştir
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
                                            // Delete user logic here
                                            navigate('/admin/users');
                                        }
                                    }}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                                >
                                    Kullanıcıyı Sil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;