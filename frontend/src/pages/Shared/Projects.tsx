import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    isOwner?: boolean;
}

const Projects: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'mine' | 'others'>('all');

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            const projectsWithOwnership = response.data.map((project: any) => ({
                ...project,
                isOwner: project.ownerId === user?.id
            }));
            setProjects(projectsWithOwnership);
        } catch (err) {
            console.error('Projeler alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.owner.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filter === 'all' ||
            (filter === 'mine' && project.isOwner) ||
            (filter === 'others' && !project.isOwner);

        return matchesSearch && matchesFilter;
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
                    <h1 className="text-3xl font-bold text-gray-800">Projeler</h1>
                    <p className="text-gray-600 mt-2">Sistemdeki tüm projeleri görüntüleyin</p>
                </div>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Proje ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tüm Projeler</option>
                        <option value="mine">Sadece Benimkiler</option>
                        <option value="others">Diğer Projeler</option>
                    </select>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Geri Dön
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800 truncate">{project.title}</h3>
                                    {project.isOwner && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                                            Benim
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-600 mb-6 min-h-[60px]">
                                    {project.description || 'Açıklama bulunmuyor'}
                                </p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span>Sahibi:</span>
                                        <span className="font-medium">{project.owner.email}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Görev Sayısı:</span>
                                        <span className="font-medium">{project.tasks?.length || 0}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => navigate(`/user/my-tasks?projectId=${project.id}`)}
                                        className="text-blue-500 hover:text-blue-700 text-sm"
                                        disabled={!project.isOwner}
                                    >
                                        {project.isOwner ? 'Görevleri Gör' : 'Sadece Görüntüleme'}
                                    </button>
                                    {project.isOwner && (
                                        <button
                                            onClick={() => navigate('/user/my-projects')}
                                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                        >
                                            Yönet
                                        </button>
                                    )}
                                </div>
                            </div>

                            {project.tasks && project.tasks.length > 0 && (
                                <div className="bg-gray-50 px-6 py-3 border-t">
                                    <div className="flex space-x-4 text-xs">
                                        <span className="text-green-600">
                                            ✅ {project.tasks.filter((t: any) => t.status === 'completed').length} tamamlandı
                                        </span>
                                        <span className="text-yellow-600">
                                            🚧 {project.tasks.filter((t: any) => t.status === 'in-progress').length} devam ediyor
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">Proje bulunamadı</h3>
                    <p className="text-gray-500 mb-6">Filtre kriterlerinize uygun proje bulunamadı.</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilter('all');
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 text-lg"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            )}
        </div>
    );
};

export default Projects;