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
        ownerId: number;
    };
    tags: Array<{
        id: number;
        name: string;
    }>;
    createdAt?: string;
}

const MyTasks: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('projectId');

    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState(projectId || 'all');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [tags, setTags] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: projectId ? parseInt(projectId) : 0,
        status: 'pending',
        tagIds: [] as number[]
    });

    useEffect(() => {
        if (user) {
            fetchMyData();
        }
    }, [user]);

    const fetchMyData = async () => {
        try {
            const [tasksRes, projectsRes, tagsRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/projects'),
                api.get('/tags')
            ]);

            // Sadece kendi projelerindeki görevleri filtrele
            const myProjects = projectsRes.data.filter((p: any) => p.ownerId === user?.id);
            const myTasks = tasksRes.data.filter((t: any) =>
                myProjects.some((p: any) => p.id === t.projectId)
            );

            setTasks(myTasks);
            setProjects(myProjects);
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
            fetchMyData();
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
            status: task.status,
            tagIds: task.tags.map(tag => tag.id)
        });
        setShowForm(true);
    };

    const updateTaskStatus = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/tasks/${id}`, { status: newStatus });
            setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error('Durum güncellenemedi:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            projectId: projectId ? parseInt(projectId) : 0,
            status: 'pending',
            tagIds: []
        });
        setEditingTask(null);
        setShowForm(false);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesProject = projectFilter === 'all' || task.project.id.toString() === projectFilter;

        return matchesSearch && matchesStatus && matchesProject;
    });

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
                    <h1 className="text-3xl font-bold text-gray-800">Görevlerim</h1>
                    <p className="text-gray-600 mt-2">Projelerinizdeki görevleri görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Görevlerimde ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duruma Göre Filtrele</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="pending">Beklemede</option>
                            <option value="in-progress">Devam Ediyor</option>
                            <option value="completed">Tamamlandı</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Projeye Göre Filtrele</label>
                        <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tüm Projelerim</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setStatusFilter('all');
                                setProjectFilter('all');
                                setSearchTerm('');
                            }}
                            className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">
                        {editingTask ? 'Görevimi Düzenle' : 'Yeni Görev Oluştur'}
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
                                            {project.title}
                                        </option>
                                    ))}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler</label>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded">
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
                                                className="mr-1"
                                            />
                                            <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                                                {tag.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
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

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${task.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : task.status === 'in-progress'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                            {task.status === 'completed' ? 'Tamamlandı' :
                                                task.status === 'in-progress' ? 'Devam Ediyor' : 'Beklemede'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{task.description || 'Açıklama bulunmuyor'}</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <span className="mr-1">📁</span>
                                            <span>{task.project.title}</span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className="mr-1">🏷️</span>
                                            <div className="flex flex-wrap gap-1">
                                                {task.tags.map(tag => (
                                                    <span key={tag.id} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {task.tags.length === 0 && <span className="text-gray-400">Etiket yok</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="mr-1">📅</span>
                                            {task.createdAt ? new Date(task.createdAt).toLocaleDateString('tr-TR') : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2 ml-4">
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                        className="px-3 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="pending">Beklemede</option>
                                        <option value="in-progress">Devam Ediyor</option>
                                        <option value="completed">Tamamlandı</option>
                                    </select>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => editTask(task)}
                                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Henüz göreviniz yok</h3>
                    <p className="text-gray-500 mb-6">İlk görevinizi oluşturarak başlayın!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-lg"
                    >
                        İlk Görevimi Oluştur
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyTasks;