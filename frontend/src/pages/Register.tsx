import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [adminCode, setAdminCode] = useState('');
    const [showAdminCode, setShowAdminCode] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasyon
        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        // Admin seçildiyse kod kontrolü
        if (role === 'admin' && adminCode !== 'NeMutluTürkümDiyene') {
            setError('Admin aktivasyon kodu yanlış!');
            return;
        }

        try {
            await register(email, password, confirmPassword, role, adminCode);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kayıt başarısız');
        }
    };

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        setShowAdminCode(newRole === 'admin');
        if (newRole !== 'admin') {
            setAdminCode('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h2>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Şifre</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Büyük/küçük harf, sayı ve özel karakter içermeli
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Şifre Tekrar</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Hesap Türü</label>
                        <div className="flex space-x-4 mt-2">
                            <button
                                type="button"
                                onClick={() => handleRoleChange('user')}
                                className={`flex-1 py-2 rounded ${role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                👤 Normal Kullanıcı
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRoleChange('admin')}
                                className={`flex-1 py-2 rounded ${role === 'admin'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                👑 Yönetici
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {role === 'user'
                                ? 'Normal kullanıcı olarak kaydolacaksınız'
                                : 'Yönetici olarak kaydolacaksınız'
                            }
                        </p>
                    </div>

                    {/* Admin Code (Conditional) */}
                    {showAdminCode && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                            <label className="block text-gray-700 font-semibold">
                                🔐 Admin Aktivasyon Kodu
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-yellow-300 rounded mt-1"

                                value={adminCode}
                                onChange={(e) => setAdminCode(e.target.value)}
                                required={role === 'admin'}
                            />
                            <p className="text-sm text-yellow-700 mt-2">
                                ⚠️ Admin olmak için özel kodu girmelisiniz.

                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full p-2 rounded text-white ${role === 'admin'
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {role === 'admin' ? '👑 Yönetici Olarak Kaydol' : '👤 Kayıt Ol'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="mt-4 text-center">
                    Hesabınız var mı?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-500 hover:underline"
                    >
                        Giriş Yapın
                    </button>
                </p>

                {/* Info Box */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="text-blue-800">
                        <span className="font-semibold">Not:</span> Yönetici hesabı oluşturmak için
                        özel aktivasyon kodunu bilmelisiniz. Normal kullanıcılar proje ve görev
                        yönetimi yapabilir, yöneticiler tüm sistemi kontrol edebilir.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;