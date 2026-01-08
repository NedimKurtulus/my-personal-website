import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Project {
    id: number;
    title: string;
    description: string;
    tasks: Array<{
        id: number;
        title: string;
        status: string;
    }>;
    createdAt?: string;
}

const MyProjects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ownerId: user?.id || 0
    });

    useEffect(() => {
        if (user) {
            fetchMyProjects();
        }
    }, [user]);

    const fetchMyProjects = async () => {
        try {
            const response = await api.get('/projects');
            // Sadece kendi projelerini filtrele
            const myProjects = response.data.filter((p: any) => p.ownerId === user?.id);
            setProjects(myProjects);
        } catch (err) {
            console.error('Projelerim alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await api.patch(`/projects/${editingProject.id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            fetchMyProjects();
            resetForm();
        } catch (err) {
            console.error('Proje kaydedilemedi:', err);
        }
    };

    const deleteProject = async (id: number) => {
        if (window.confirm('Bu projeyi ve tüm görevlerini silmek istediğinize emin misiniz?')) {
            try {
                await api.delete(`/projects/${id}`);
                setProjects(projects.filter(p => p.id !== id));
            } catch (err) {
                console.error('Proje silinemedi:', err);
            }
        }
    };

    const editProject = (project: Project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            ownerId: user?.id || 0
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            ownerId: user?.id || 0
        });
        setEditingProject(null);
        setShowForm(false);
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-gray-800">Projelerim</h1>
                    <p className="text-gray-600 mt-2">Kendi projelerinizi görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Projelerimde ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                    >
                        + Yeni Proje
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
                        {editingProject ? 'Projemi Düzenle' : 'Yeni Proje Oluştur'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proje Başlığı *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Proje başlığını girin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Proje açıklamasını girin"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                                {editingProject ? 'Güncelle' : 'Oluştur'}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                            <span className="text-2xl">📁</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Toplam Proje</p>
                            <p className="text-3xl font-bold">{projects.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Toplam Görev</p>
                            <p className="text-3xl font-bold">
                                {projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Ort. Görev/Proje</p>
                            <p className="text-3xl font-bold">
                                {projects.length > 0
                                    ? (projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) / projects.length).toFixed(1)
                                    : '0'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Cards */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800 truncate">{project.title}</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => editProject(project)}
                                            className="text-yellow-500 hover:text-yellow-600"
                                            title="Düzenle"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-6 min-h-[60px]">
                                    {project.description || 'Açıklama bulunmuyor'}
                                </p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span>Görev Durumu:</span>
                                        <span>{project.tasks?.length || 0} görev</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{
                                            width: project.tasks?.length > 0
                                                ? `${(project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100}%`
                                                : '0%'
                                        }}></div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">
                                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : ''}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/user/my-tasks?projectId=${project.id}`)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                                    >
                                        Görevleri Gör
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-3 border-t">
                                <div className="flex space-x-4 text-xs">
                                    <span className="text-green-600">
                                        ✅ {project.tasks?.filter(t => t.status === 'completed').length || 0} tamamlandı
                                    </span>
                                    <span className="text-yellow-600">
                                        🚧 {project.tasks?.filter(t => t.status === 'in-progress').length || 0} devam ediyor
                                    </span>
                                    <span className="text-red-600">
                                        ⏳ {project.tasks?.filter(t => t.status === 'pending').length || 0} beklemede
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Henüz projeniz yok</h3>
                    <p className="text-gray-500 mb-6">İlk projenizi oluşturarak başlayın!</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 text-lg"
                    >
                        İlk Projemi Oluştur
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyProjects;