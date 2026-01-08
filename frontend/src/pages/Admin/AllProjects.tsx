import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Project {
    id: number;
    title: string;
    description: string;
    owner: {
        id: number;
        email: string;
    };
    tasks: any[];
    createdAt?: string;
}

const AllProjects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
        if (user?.role === 'admin') {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (err) {
            console.error('Projeler alınamadı:', err);
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
            fetchProjects();
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
            ownerId: project.owner.id
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
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-gray-800">Tüm Projeler</h1>
                    <p className="text-gray-600 mt-2">Sistemdeki tüm projeleri görüntüleyin ve yönetin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Proje ara..."
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
                        {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proje Sahibi ID *</label>
                            <input
                                type="number"
                                required
                                value={formData.ownerId}
                                onChange={(e) => setFormData({ ...formData, ownerId: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Kullanıcı ID'si girin"
                            />
                            <p className="text-sm text-gray-500 mt-1">Not: Geçerli bir kullanıcı ID'si girmelisiniz</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                            <span className="text-2xl">👥</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Farklı Kullanıcı</p>
                            <p className="text-3xl font-bold">
                                {Array.from(new Set(projects.map(p => p.owner.id))).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">Ort. Görev/Proje</p>
                            <p className="text-3xl font-bold">
                                {(projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) / projects.length).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sahibi</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görevler</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{project.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{project.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 max-w-xs truncate">
                                            {project.description || 'Açıklama yok'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 text-sm font-bold">
                                                    {project.owner.email.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{project.owner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-900 mr-2">{project.tasks?.length || 0} görev</span>
                                            <button
                                                onClick={() => navigate(`/admin/all-tasks?projectId=${project.id}`)}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                Göster
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => editProject(project)}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-sm"
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/all-tasks?projectId=${project.id}`)}
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
                                            >
                                                Görevler
                                            </button>
                                            <button
                                                onClick={() => deleteProject(project.id)}
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

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Proje bulunamadı</h3>
                        <p className="text-gray-500">Arama kriterlerinize uygun proje bulunamadı.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            İlk Projeyi Oluştur
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllProjects;