import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, courses = [], availableCourses = [] }) {
    const displayCourses = courses;
    const isStudent = auth.user.role === 'etudiant';
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="Mes Cours" />

            <div className="flex flex-col gap-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-manrope text-3xl font-bold text-primary">Mes Cours</h1>
                        <p className="text-on-surface-variant font-medium mt-1">Gérez votre progression et continuez vos leçons.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isStudent && (
                            <button 
                                onClick={() => setIsEnrollModalOpen(true)}
                                className="bg-secondary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Rejoindre un cours
                            </button>
                        )}
                        <button className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-sm font-bold text-primary border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            Filtrer
                        </button>
                        <div className="h-10 w-px bg-outline-variant/30 hidden md:block"></div>
                        <p className="text-sm font-bold text-on-surface-variant">
                            <span className="text-primary">{displayCourses.length}</span> cours au total
                        </p>
                    </div>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['Tous mes cours', 'En cours', 'Terminés', 'Favoris'].map((filter, index) => (
                        <button 
                            key={index}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                index === 0 
                                ? 'bg-secondary text-white shadow-md shadow-secondary/20' 
                                : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:border-secondary/50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayCourses.map((course) => (
                        <Link 
                            key={course.id} 
                            href={route('courses.show', course.id)} 
                            className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm group border border-transparent hover:border-secondary/20 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="h-48 relative overflow-hidden">
                                <img 
                                    alt={course.titre} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    src={course.image} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                <span 
                                    className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm"
                                    style={{ backgroundColor: course.color, color: course.textColor }}
                                >
                                    {course.categorie}
                                </span>
                            </div>
                            
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="font-manrope text-xl font-bold text-primary mb-6 group-hover:text-secondary transition-colors line-clamp-2 min-h-[3.5rem]">
                                    {course.titre}
                                </h3>
                                
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-secondary text-lg">analytics</span>
                                            <span className="text-xs font-bold text-on-surface-variant">Progression</span>
                                        </div>
                                        <span className="text-sm font-black text-primary">{course.progression}%</span>
                                    </div>
                                    
                                    <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-secondary h-full rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${course.progression}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="mt-6 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                                        <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            Dernière activité hier
                                        </span>
                                        <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                                    ))}
                </div>

                {displayCourses.length === 0 && (
                    <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border-2 border-dashed border-outline-variant/50">
                        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">school</span>
                        <h3 className="text-xl font-bold text-primary mb-2">Aucun cours trouvé</h3>
                        <p className="text-on-surface-variant font-medium mb-6">Vous n'êtes inscrit à aucun cours pour le moment. Rejoignez un cours pour commencer votre aventure d'apprentissage !</p>
                        <button 
                            onClick={() => setIsEnrollModalOpen(true)}
                            className="bg-secondary text-white px-8 py-3 rounded-2xl font-bold hover:opacity-90 transition-opacity inline-block"
                        >
                            Rejoindre un cours
                        </button>
                    </div>
                )}
            </div>

            {isEnrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-primary">Rejoindre un cours</h2>
                            <button 
                                onClick={() => setIsEnrollModalOpen(false)}
                                className="p-2 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto mb-6">
                            <p className="text-sm text-on-surface-variant mb-4">Choisissez un cours pour commencer votre apprentissage :</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableCourses.length > 0 ? (
                                    availableCourses.map((course) => (
                                        <div key={course.id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center gap-4 group hover:border-secondary/30 transition-colors">
                                            <img 
                                                src={course.image} 
                                                alt={course.titre} 
                                                className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-primary truncate">{course.titre}</h4>
                                                <p className="text-xs text-on-surface-variant mt-1">
                                                    {course.sessions?.length || 0} sessions
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    router.post(route('courses.inscrire', course.id), {}, {
                                                        onSuccess: () => setIsEnrollModalOpen(false)
                                                    });
                                                }}
                                                className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                                            >
                                                Rejoindre
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-8 text-on-surface-variant">
                                        <span className="material-symbols-outlined text-4xl mb-2">sentiment_satisfied_alt</span>
                                        <p>Tous les cours sont déjà affichés</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={() => setIsEnrollModalOpen(false)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
