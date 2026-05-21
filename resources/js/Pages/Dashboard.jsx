import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Dashboard({ recentCourses = [], totalCoursesCount = 0, programme_du_jour = [], today }) {
    const user = usePage().props.auth.user;
    const isTeacher = user.role === 'prof';
    
    const formatStartTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };
    
    const getEventColor = (type, statut) => {
        if (type === 'live') {
            return { border: 'border-secondary', badgeBg: 'bg-secondary', badgeText: 'text-white' };
        }
        return { border: 'border-tertiary-fixed-dim', badgeBg: 'bg-surface-variant/50', badgeText: 'text-on-surface-variant' };
    };
    
    const handleJoinClass = (event) => {
        if (event.lien) {
            window.open(event.lien, '_blank');
        } else {
            router.visit(route('diffusion'));
        }
    };
    
    const getBadgeText = (event) => {
        if (event.is_live && event.type_cours === 'live') {
            return `En Direct à ${formatStartTime(event.heure_debut)}`;
        }
        if (event.heure_debut) {
            return formatStartTime(event.heure_debut);
        }
        return '';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Accueil" />

            {/* Welcome Section */}
            <section className="mb-8">
                <h2 className="font-manrope text-2xl md:text-3xl font-bold text-primary mb-2">
                    {isTeacher ? `Content de vous revoir, ${user.prenom} !` : `Bonjour, ${user.prenom} !`}
                </h2>
                <p className="text-lg text-on-surface-variant font-medium">
                    {isTeacher ? "Gérez vos cours et interagissez avec vos étudiants." : `Prêt à poursuivre votre apprentissage aujourd'hui ?`}
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Content (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Programme du jour */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-manrope text-xl font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">event_note</span>
                                Programme du jour
                            </h3>
                            <Link href={route('calendar')} className="text-secondary text-sm font-bold hover:underline">Voir tout le calendrier</Link>
                        </div>

                        {programme_du_jour.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programme_du_jour.map((event, index) => {
                                    const colors = getEventColor(event.type_cours, event.statut);
                                    const badgeText = getBadgeText(event);
                                    
                                    return (
                                        <div key={index} className={`bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/30 border-l-4 ${colors.border} flex flex-col gap-3 group hover:shadow-md transition-all`}>
                                            <div className="flex justify-between items-start">
                                                <span className={`${colors.badgeBg} ${colors.badgeText} px-3 py-1 rounded-full text-xs font-bold`}>
                                                    {badgeText}
                                                </span>
                                                <button className="material-symbols-outlined text-on-surface-variant">more_vert</button>
                                            </div>
                                            <div>
                                                <h4 className="font-manrope text-lg font-bold text-primary mb-1">{event.titre}</h4>
                                                <p className="text-sm text-on-surface-variant font-medium">{event.course_titre}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {event.is_live ? (
                                                    <button 
                                                        onClick={() => handleJoinClass(event)}
                                                        className="flex-1 bg-secondary text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                                                        Rejoindre la classe
                                                    </button>
                                                ) : (
                                                    <Link 
                                                        href={route('courses.show', event.course_id || 1)} 
                                                        className="flex-1 border-2 border-secondary text-secondary text-sm font-bold py-2 rounded-xl hover:bg-secondary/5 transition-colors text-center"
                                                    >
                                                        Détails du cours
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">event_busy</span>
                                <p className="text-sm font-medium text-on-surface-variant">
                                    Aucun cours prévu aujourd'hui ({new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })})
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Mes Cours (Grid) */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-manrope text-xl font-bold text-on-surface">
                                {isTeacher ? 'Mes Cours Enseignés' : 'Mes Cours Suivis'}
                            </h3>
                            {isTeacher ? (
                                <Link href={route('courses.create')} className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-sm">add_box</span>
                                    Nouveau Cours
                                </Link>
                            ) : (
                                totalCoursesCount >= 2 && (
                                    <Link href={route('courses.index')} className="text-secondary text-sm font-bold hover:underline">
                                        Voir mes {totalCoursesCount} cours
                                    </Link>
                                )
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {recentCourses.length > 0 ? (
                                recentCourses.map((course) => (
                                    <Link key={course.id} href={route('courses.show', course.id)} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm group border border-transparent hover:border-secondary/20 transition-all">
                                        <div className="h-40 relative">
                                            <img 
                                                alt={course.titre} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                                src={course.image_couverture || "https://lh3.googleusercontent.com/aida-public/AB6AXuDBtCOLErSI3tiAadp3mU_JUvjljFi0hT0vxNxxeuVAKNvgUUrSIkbp8_1kWeEUlDuoVKaJb61Xd11N_Y-5436rA6EcNvZWs9dhMlJGE-Q0bM1X2qfQPhjlszhwD9K-umjNaLIdctPxZXl-yijSYy8e6YfRRc861D_leP-2wjXhJm2wJxxNyh06Y0f0eAFChzqJ-nCCTRgEJQFWN5nufo8Y4E2qdf0wxkIDMZyU05J508l7s6ggwRzmst_5UCxbxxiFtvX09-fsJmk"} 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                                            <span className="absolute bottom-3 left-3 bg-[#ffdf9e] text-[#261a00] px-3 py-1 rounded-lg text-xs font-bold">
                                                {course.statut || "Général"}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <h4 className="font-manrope text-lg font-bold text-primary mb-4">{course.titre}</h4>
                                            <div className="flex justify-between items-center mb-2 text-xs font-bold">
                                                <span className="text-on-surface-variant">Progression Globale</span>
                                                <span className="text-primary">0%</span>
                                            </div>
                                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                                <div className="bg-secondary h-full rounded-full" style={{ width: '0%' }}></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 border-2 border-dashed border-outline-variant/30 rounded-2xl">
                                    <p className="text-on-surface-variant font-medium mb-2">Vous n'êtes inscrit à aucun cours pour le moment. Rejoignez un cours pour commencer votre aventure d'apprentissage !</p>
                                    {!isTeacher && (
                                        <Link 
                                            href={route('courses.index')} 
                                            className="inline-block bg-secondary text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                                        >
                                            Rejoindre un cours
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Widgets (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <section className="bg-primary p-6 rounded-3xl text-white shadow-xl overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10">
                            <h3 className="font-manrope text-xl font-bold mb-6">Statistiques</h3>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-[#00e3fd] text-sm">
                                            {isTeacher ? 'group' : 'timer'}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                            {isTeacher ? 'Étudiants' : 'Heures'}
                                        </span>
                                    </div>
                                    <p className="font-manrope text-3xl font-extrabold leading-none">
                                        {isTeacher ? '154' : '24.5'}
                                    </p>
                                    <p className="text-[10px] text-[#00e3fd] mt-2 font-bold">
                                        {isTeacher ? '+22 ce mois' : '+12% cette semaine'}
                                    </p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-[#fabd00] text-sm">
                                            {isTeacher ? 'library_books' : 'verified'}
                                        </span>
                                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                                            {isTeacher ? 'Cours' : 'Modules'}
                                        </span>
                                    </div>
                                    <p className="font-manrope text-3xl font-extrabold leading-none">
                                        {isTeacher ? '6' : '12'}
                                    </p>
                                    <p className="text-[10px] text-[#fabd00] mt-2 font-bold">
                                        {isTeacher ? '2 en préparation' : '4 en cours'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-4 text-xs font-bold">
                                    <span>{isTeacher ? 'Moyenne générale classe' : 'Objectif hebdomadaire'}</span>
                                    <span>{isTeacher ? '14.5/20' : '80%'}</span>
                                </div>
                                <div className="w-full bg-white/20 h-2 rounded-full">
                                    <div className={`h-full rounded-full ${isTeacher ? 'bg-[#fabd00]' : 'bg-[#00e3fd]'}`} style={{ width: isTeacher ? '72.5%' : '80%' }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Dernières Activités */}
                    <section className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30">
                        <h3 className="font-manrope text-lg font-bold text-primary mb-6 flex items-center justify-between">
                            Activités
                            <button className="material-symbols-outlined text-on-surface-variant hover:rotate-90 transition-transform">settings</button>
                        </h3>
                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Nouveau devoir en <span className="text-primary">Mathématiques</span></p>
                                    <p className="text-[10px] font-bold text-on-surface-variant mt-1 italic">Il y a 2 heures • Date limite: Dimanche</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#00e3fd]/10 text-on-secondary-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">chat</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">M. Sow a répondu à votre question</p>
                                    <p className="text-[10px] font-bold text-on-surface-variant mt-1 italic">Il y a 5 heures</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-8 text-secondary text-sm font-bold py-2 border-t border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                            Voir tout l'historique
                        </button>
                    </section>
                </div>
            </div>

            {/* Quick Action FAB */}
            <button className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 w-14 h-14 bg-secondary text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
            </button>
        </AuthenticatedLayout>
    );
}

