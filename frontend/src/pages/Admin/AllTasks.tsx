import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    project: {
        id: number;
        title: string;
    };
    assignedUser?: {
        id: number;
        email: string;
    };
    tags: Array<{
        id: number;
        name: string;
    }>;
    createdAt?: string;
}

const AllTasks: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: 0,
        assignedUserId: 0,
        status: 'pending',
        tagIds: [] as number[]
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        try {
            const [tasksRes, projectsRes, usersRes, tagsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/projects'),
                api.get('/users'),
                api.get('/tags')
            ]);

            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
            setUsers(usersRes.data);
            setTags(tagsRes.data);
        } catch (err) {
            console.error('Veriler alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.patch(`/tasks/${editingTask.id}`, formData);
            } else {
                await api.post('/tasks', formData);
            }
            fetchAllData();
            resetForm();
        } catch (err) {
            console.error('Görev kaydedilemedi:', err);
        }
    };

    const deleteTask = async (id: number) => {
        if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/tasks/${id}`);
                setTasks(tasks.filter(t => t.id !== id));
            } catch (err) {
                console.error('Görev silinemedi:', err);
            }
        }
    };

    const editTask = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description,
            projectId: task.project.id,
            assignedUserId: task.assignedUser?.id || 0,
            status: task.status,
            tagIds: task.tags.map(tag => tag.id)
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            projectId: 0,
            assignedUserId: 0,
            status: 'pending',
            tagIds: []
        });
        setEditingTask(null);
        setShowForm(false);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.assignedUser?.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
                    <h1 className="text-3xl font-bold text-gray-800">Tüm Görevler</h1>
                    <p className="text-gray-600 mt-2">Sistemdeki tüm görevleri görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Görev ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="in-progress">Devam Ediyor</option>
                        <option value="completed">Tamamlandı</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        + Yeni Görev
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">
                        {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Görev Başlığı *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Görev başlığını girin"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durum *</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Beklemede</option>
                                    <option value="in-progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Görev açıklamasını girin"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Proje *</label>
                                <select
                                    required
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>Proje seçin</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.title} (ID: {project.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Atanan Kullanıcı</label>
                                <select
                                    value={formData.assignedUserId}
                                    onChange={(e) => setFormData({ ...formData, assignedUserId: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>Kullanıcı seçin</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler</label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <label key={tag.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.tagIds.includes(tag.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, tagIds: [...formData.tagIds, tag.id] });
                                                } else {
                                                    setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tag.id) });
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                            {tag.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                {editingTask ? 'Güncelle' : 'Oluştur'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Toplam Görev</p>
                            <p className="text-3xl font-bold">{tasks.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-lg mr-4">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Beklemede</p>
                            <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'pending').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                            <span className="text-2xl">🚧</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Devam Ediyor</p>
                            <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'in-progress').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Tamamlandı</p>
                            <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'completed').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proje</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atanan</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiketler</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{task.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{task.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">
                                            {task.description || 'Açıklama yok'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : task.status === 'in-progress'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {task.status === 'completed' ? 'Tamamlandı' :
                                                task.status === 'in-progress' ? 'Devam Ediyor' : 'Beklemede'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{task.project.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {task.assignedUser ? (
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm font-bold">
                                                        {task.assignedUser.email.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{task.assignedUser.email}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Atanmadı</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {task.tags.map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {task.tags.length === 0 && (
                                                <span className="text-gray-400 text-xs">Etiket yok</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => editTask(task)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-sm"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
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

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Görev bulunamadı</h3>
                        <p className="text-gray-500">Arama kriterlerinize uygun görev bulunamadı.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            İlk Görevi Oluştur
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllTasks;