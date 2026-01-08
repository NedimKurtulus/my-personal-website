import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Stats {
    totalProjects: number;
    totalTasks: number;
    myProjects: number;
    myTasks: number;
    pendingTasks: number;
}

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({
        totalProjects: 0,
        totalTasks: 0,
        myProjects: 0,
        myTasks: 0,
        pendingTasks: 0
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Kullanıcı rolüne göre farklı API çağrıları
            if (user?.role === 'admin') {
                const [projectsRes, tasksRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/tasks')
                ]);

                setStats({
                    totalProjects: projectsRes.data.length,
                    totalTasks: tasksRes.data.length,
                    myProjects: projectsRes.data.filter((p: any) => p.ownerId === user.id).length,
                    myTasks: tasksRes.data.filter((t: any) => t.assignedUserId === user.id).length,
                    pendingTasks: tasksRes.data.filter((t: any) => t.status === 'pending').length
                });

                setRecentProjects(projectsRes.data.slice(0, 5));
                setRecentTasks(tasksRes.data.slice(0, 5));
            } else {
                // Normal kullanıcı için sadece kendi verileri
                const [projectsRes, tasksRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/tasks')
                ]);

                const myProjects = projectsRes.data.filter((p: any) => p.ownerId === user?.id);
                const myTasks = tasksRes.data.filter((t: any) => t.assignedUserId === user?.id);

                setStats({
                    totalProjects: myProjects.length,
                    totalTasks: myTasks.length,
                    myProjects: myProjects.length,
                    myTasks: myTasks.length,
                    pendingTasks: myTasks.filter((t: any) => t.status === 'pending').length
                });

                setRecentProjects(myProjects.slice(0, 5));
                setRecentTasks(myTasks.slice(0, 5));
            }
        } catch (err) {
            console.error('Dashboard verileri alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-8">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-md p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Task Manager Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                {user?.role === 'admin' ? 'ADMIN' : 'USER'}
                            </span>
                            <span>{user?.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto p-6">
                {/* Hoşgeldin Mesajı */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Hoş geldin, {user?.email}!
                    </h1>
                    <p className="text-gray-600">
                        {user?.role === 'admin'
                            ? 'Sistem yöneticisi olarak tüm verilere erişimin var.'
                            : 'Kendi proje ve görevlerini yönetebilirsin.'}
                    </p>
                </div>

                {/* Hızlı İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">
                            {user?.role === 'admin' ? 'Toplam Proje' : 'Projelerim'}
                        </h3>
                        <p className="text-3xl font-bold mt-2">{stats.totalProjects}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">
                            {user?.role === 'admin' ? 'Toplam Görev' : 'Görevlerim'}
                        </h3>
                        <p className="text-3xl font-bold mt-2">{stats.totalTasks}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">
                            Bekleyen Görevler
                        </h3>
                        <p className="text-3xl font-bold mt-2">{stats.pendingTasks}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-600">Rol</h3>
                        <p className="text-3xl font-bold mt-2">
                            {user?.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                        </p>
                    </div>
                </div>

                {/* Hızlı Eylem Butonları */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* ADMIN Butonları */}
                    {user?.role === 'admin' && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold mb-4">Admin İşlemleri</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
                                >
                                    Kullanıcıları Yönet
                                </button>
                                <button
                                    onClick={() => navigate('/admin/all-projects')}
                                    className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
                                >
                                    Tüm Projeler
                                </button>
                                <button
                                    onClick={() => navigate('/admin/all-tasks')}
                                    className="bg-purple-500 text-white p-3 rounded hover:bg-purple-600"
                                >
                                    Tüm Görevler
                                </button>
                                <button
                                    onClick={() => navigate('/shared/tags')}
                                    className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
                                >
                                    Etiketleri Yönet
                                </button>
                            </div>
                        </div>
                    )}

                    {/* USER Butonları */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">Hızlı İşlemler</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/user/my-projects')}
                                className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
                            >
                                Projelerim
                            </button>
                            <button
                                onClick={() => navigate('/user/my-tasks')}
                                className="bg-green-500 text-white p-3 rounded hover:bg-green-600"
                            >
                                Görevlerim
                            </button>
                            <button
                                onClick={() => navigate('/user/profile')}
                                className="bg-gray-500 text-white p-3 rounded hover:bg-gray-600"
                            >
                                Profilim
                            </button>
                            <button
                                onClick={() => navigate('/shared/tags')}
                                className="bg-yellow-500 text-white p-3 rounded hover:bg-yellow-600"
                            >
                                Etiketler
                            </button>
                        </div>
                    </div>
                </div>

                {/* Son Projeler */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                            {user?.role === 'admin' ? 'Son Projeler' : 'Son Projelerim'}
                        </h3>
                        <button
                            onClick={() => navigate(user?.role === 'admin' ? '/admin/all-projects' : '/user/my-projects')}
                            className="text-blue-500 hover:underline"
                        >
                            Tümünü Gör
                        </button>
                    </div>

                    {recentProjects.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left">Başlık</th>
                                        <th className="p-3 text-left">Açıklama</th>
                                        {user?.role === 'admin' && <th className="p-3 text-left">Sahibi</th>}
                                        <th className="p-3 text-left">Görev Sayısı</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentProjects.map((project) => (
                                        <tr key={project.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{project.title}</td>
                                            <td className="p-3">{project.description || '-'}</td>
                                            {user?.role === 'admin' && (
                                                <td className="p-3">{project.owner?.email || 'Unknown'}</td>
                                            )}
                                            <td className="p-3">{project.tasks?.length || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center p-4">Henüz proje bulunmuyor.</p>
                    )}
                </div>

                {/* Son Görevler */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                            {user?.role === 'admin' ? 'Son Görevler' : 'Son Görevlerim'}
                        </h3>
                        <button
                            onClick={() => navigate(user?.role === 'admin' ? '/admin/all-tasks' : '/user/my-tasks')}
                            className="text-blue-500 hover:underline"
                        >
                            Tümünü Gör
                        </button>
                    </div>

                    {recentTasks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left">Başlık</th>
                                        <th className="p-3 text-left">Durum</th>
                                        <th className="p-3 text-left">Proje</th>
                                        {user?.role === 'admin' && <th className="p-3 text-left">Atanan</th>}
                                        <th className="p-3 text-left">Etiketler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTasks.map((task) => (
                                        <tr key={task.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{task.title}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            <td className="p-3">{task.project?.title || '-'}</td>
                                            {user?.role === 'admin' && (
                                                <td className="p-3">{task.assignedUser?.email || 'Atanmadı'}</td>
                                            )}
                                            <td className="p-3">
                                                {task.tags?.map((tag: any) => (
                                                    <span key={tag.id} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs mr-1">
                                                        {tag.name}
                                                    </span>
                                                )) || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center p-4">Henüz görev bulunmuyor.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;