import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

function localToUtc(value) {
  const date = new Date(value);
  return date.toISOString();
}

export default function Show({ course }) {
    const { auth } = usePage().props;
    const isTeacher = auth.user.role === 'prof';
    
    const [activeTab, setActiveTab] = useState('module');
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Picker States
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerView, setPickerView] = useState('months'); // 'months' | 'years'
    const [viewedYear, setViewedYear] = useState(currentDate.getFullYear());
    
    // Utilities for dynamic calendar
    const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const weekDays = [...Array(7)].map((_, i) => {
        const monday = getMonday(currentDate);
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const formatHeaderDate = () => {
        const firstDay = weekDays[0];
        const lastDay = weekDays[6];
        const options = { month: 'long', year: 'numeric' };
        
        if (firstDay.getMonth() === lastDay.getMonth()) {
            return firstDay.toLocaleDateString('fr-FR', options);
        } else {
            return `${firstDay.toLocaleDateString('fr-FR', { month: 'short' })} - ${lastDay.toLocaleDateString('fr-FR', { month: 'short' })} ${lastDay.getFullYear()}`;
        }
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(viewedYear, monthIndex, 1);
        setCurrentDate(newDate);
        setIsPickerOpen(false);
    };

    const handleYearSelect = (year) => {
        setViewedYear(year);
        setPickerView('months');
    };

    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() - 5 + i);

    // État local pour les modules (UI instantanée / optimiste)
    const [localModules, setLocalModules] = useState(course.modules || []);

    // Synchronisation si les props changent
    useEffect(() => {
        setLocalModules(course.modules || []);
    }, [course.modules]);

    // État local pour les ressources
    const [localRessources, setLocalRessources] = useState(course.ressources || []);

    useEffect(() => {
        setLocalRessources(course.ressources || []);
    }, [course.ressources]);

    // État local pour les sessions (standalone et replays)
    const [localSessions, setLocalSessions] = useState(course.sessions || []);

    useEffect(() => {
        setLocalSessions(course.sessions || []);
    }, [course.sessions]);

    // Modal de programmation de session
    const [sessionModal, setSessionModal] = useState({
        isOpen: false,
        fields: {
            titre: '',
            type: 'live',
            date_heure: '',
            duree_minutes: 60,
            lien_live: '',
            lien_video: ''
        }
    });

    // Modal state for resources
    const [resourceModal, setResourceModal] = useState({
        isOpen: false,
        fields: {
            titre: '',
            description: '',
            type: 'pdf',
            source_type: 'fichier',
            fichier: null,
            url: '',
            session_id: ''
        }
    });
    const [uploadProgress, setUploadProgress] = useState(null);

    const handleOpenResourceModal = () => {
        setResourceModal({
            isOpen: true,
            fields: {
                titre: '',
                description: '',
                type: 'pdf',
                source_type: 'fichier',
                fichier: null,
                url: '',
                session_id: ''
            }
        });
        setUploadProgress(null);
    };

    const handleCloseResourceModal = () => {
        setResourceModal(prev => ({ ...prev, isOpen: false }));
        setUploadProgress(null);
    };

    const handleResourceSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('titre', resourceModal.fields.titre);
        data.append('description', resourceModal.fields.description || '');
        data.append('type', resourceModal.fields.type);
        data.append('source_type', resourceModal.fields.source_type);
        if (resourceModal.fields.source_type === 'fichier') {
            data.append('fichier', resourceModal.fields.fichier);
        } else {
            data.append('url', resourceModal.fields.url);
        }
        if (resourceModal.fields.session_id) {
            data.append('session_id', resourceModal.fields.session_id);
        }

        const originalRessources = [...localRessources];

        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const newRessource = {
            id: tempId,
            titre: resourceModal.fields.titre,
            description: resourceModal.fields.description,
            type: resourceModal.fields.type,
            url: resourceModal.fields.source_type === 'fichier' ? '#' : resourceModal.fields.url,
            taille_fichier: resourceModal.fields.source_type === 'fichier' ? (resourceModal.fields.fichier?.size || 0) : null,
            created_at: new Date().toISOString(),
            isSaving: true
        };
        
        setLocalRessources(prev => [...prev, newRessource]);

        router.post(route('ressources.store', course.id), data, {
            forceFormData: true,
            onProgress: (progress) => {
                if (progress) {
                    setUploadProgress(progress.percentage);
                }
            },
            onSuccess: () => {
                handleCloseResourceModal();
            },
            onError: () => {
                setLocalRessources(originalRessources);
                setUploadProgress(null);
                alert("Erreur lors de l'ajout de la ressource.");
            }
        });
    };

    const handleDeleteResource = (ressource) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la ressource "${ressource.titre}" ?`)) {
            const originalRessources = [...localRessources];
            setLocalRessources(prev => prev.map(r => r.id === ressource.id ? { ...r, isDeleting: true } : r));

            router.delete(route('ressources.destroy', ressource.id), {
                onError: () => {
                    setLocalRessources(originalRessources);
                    alert("Erreur lors de la suppression de la ressource.");
                }
            });
        }
    };

    // Helper functions for resources
    const getResourceStyle = (type) => {
        switch(type) {
            case 'pdf':
                return { icon: 'picture_as_pdf', color: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100/50' };
            case 'video':
                return { icon: 'video_file', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/50' };
            case 'slide':
                return { icon: 'co_present', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100/50' };
            case 'document':
                return { icon: 'description', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100/50' };
            case 'image':
                return { icon: 'image', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100/50' };
            case 'lien':
                return { icon: 'link', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100/50' };
            default:
                return { icon: 'folder_open', color: 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50' };
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return null;
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['octets', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Modal state for Modules/Lessons
    const [modal, setModal] = useState({
        isOpen: false,
        type: '', // 'addModule' | 'editModule' | 'addLesson' | 'editLesson'
        title: '',
        data: {},
        fields: { titre: '', duree_minutes: 15 }
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const handleModalSubmit = (e) => {
        e.preventDefault();
        const originalModules = [...localModules];

        if (modal.type === 'addModule') {
            const tempId = 'temp-' + Date.now();
            const newModule = {
                id: tempId,
                titre: modal.fields.titre,
                sessions: [],
                isSaving: true
            };

            setLocalModules(prev => [...prev, newModule]);
            closeModal();

            router.post(route('modules.store', course.id), { 
                titre: modal.fields.titre 
            }, {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de la création du module.");
                }
            });

        } else if (modal.type === 'editModule') {
            setLocalModules(prev => prev.map(m => m.id === modal.data.id ? { ...m, titre: modal.fields.titre, isSaving: true } : m));
            closeModal();

            router.put(route('modules.update', modal.data.id), { 
                titre: modal.fields.titre 
            }, {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de la modification du module.");
                }
            });

        } else if (modal.type === 'addLesson') {
            const tempId = 'temp-' + Date.now();
            const newLesson = {
                id: tempId,
                titre: modal.fields.titre,
                duree_minutes: parseInt(modal.fields.duree_minutes),
                statut: 'terminé',
                isSaving: true
            };

            setLocalModules(prev => prev.map(m => m.id === modal.data.moduleId ? { ...m, sessions: [...(m.sessions || []), newLesson] } : m));
            closeModal();

            router.post(route('modules.sessions.store', modal.data.moduleId), { 
                titre: modal.fields.titre,
                duree_minutes: parseInt(modal.fields.duree_minutes)
            }, {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de l'ajout de la leçon.");
                }
            });

        } else if (modal.type === 'editLesson') {
            setLocalModules(prev => prev.map(m => ({
                ...m,
                sessions: (m.sessions || []).map(s => s.id === modal.data.id ? { ...s, titre: modal.fields.titre, duree_minutes: parseInt(modal.fields.duree_minutes), isSaving: true } : s)
            })));
            closeModal();

            router.put(route('sessions.update', modal.data.id), { 
                titre: modal.fields.titre,
                duree_minutes: parseInt(modal.fields.duree_minutes)
            }, {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de la modification de la leçon.");
                }
            });
        }
    };

    // --- Fonctions CRUD Modules ---
    const handleAddModule = () => {
        setModal({
            isOpen: true,
            type: 'addModule',
            title: 'Créer un nouveau module',
            data: {},
            fields: { titre: '', duree_minutes: 15 }
        });
    };

    const handleEditModule = (module) => {
        setModal({
            isOpen: true,
            type: 'editModule',
            title: 'Modifier le module',
            data: module,
            fields: { titre: module.titre, duree_minutes: 15 }
        });
    };

    const handleDeleteModule = (module) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le module "${module.titre}" ainsi que toutes ses leçons ?`)) {
            const originalModules = [...localModules];
            setLocalModules(prev => prev.map(m => m.id === module.id ? { ...m, isDeleting: true } : m));

            router.delete(route('modules.destroy', module.id), {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de la suppression du module.");
                }
            });
        }
    };

    // --- Fonctions CRUD Leçons ---
    const handleAddLesson = (module) => {
        setModal({
            isOpen: true,
            type: 'addLesson',
            title: `Ajouter une leçon dans "${module.titre}"`,
            data: { moduleId: module.id },
            fields: { titre: '', duree_minutes: 15 }
        });
    };

    const handleEditLesson = (session) => {
        setModal({
            isOpen: true,
            type: 'editLesson',
            title: 'Modifier la leçon',
            data: session,
            fields: { titre: session.titre, duree_minutes: session.duree_minutes }
        });
    };

    const handleDeleteLesson = (session) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la leçon "${session.titre}" ?`)) {
            const originalModules = [...localModules];
            setLocalModules(prev => prev.map(m => ({
                ...m,
                sessions: (m.sessions || []).map(s => s.id === session.id ? { ...s, isDeleting: true } : s)
            })));

            router.delete(route('sessions.destroy', session.id), {
                onError: () => {
                    setLocalModules(originalModules);
                    alert("Erreur lors de la suppression de la leçon.");
                }
            });
        }
    };

    // --- Fonctions de programmation de session ---
    const handleOpenSessionModal = () => {
        setSessionModal({
            isOpen: true,
            fields: {
                titre: '',
                type: 'live',
                date_heure: localToUtc(new Date().toISOString().slice(0, 16)),
                duree_minutes: 60,
                lien_live: '',
                lien_video: ''
            }
        });
    };

    const handleCloseSessionModal = () => {
        setSessionModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleSessionSubmit = (e) => {
        e.preventDefault();
        
        const originalSessions = [...localSessions];
        const utcSessionData = {
            ...sessionModal.fields,
            date_heure: localToUtc(sessionModal.fields.date_heure)
        };
        
        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const newSession = {
            id: tempId,
            titre: sessionModal.fields.titre || 'Nouvelle Session',
            type: sessionModal.fields.type,
            date_heure: utcSessionData.date_heure,
            duree_minutes: parseInt(sessionModal.fields.duree_minutes),
            lien_live: sessionModal.fields.lien_live,
            lien_video: sessionModal.fields.lien_video,
            statut: sessionModal.fields.type === 'live' ? 'programmé' : 'terminé',
            isSaving: true
        };
        
        setLocalSessions(prev => [...prev, newSession]);
        handleCloseSessionModal();

        router.post(route('courses.sessions.store', course.id), utcSessionData, {
            onError: () => {
                setLocalSessions(originalSessions);
                alert("Erreur lors de la programmation de la session.");
            }
        });
    };

    const handleDeleteSession = (session) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la session "${session.titre}" ?`)) {
            const originalSessions = [...localSessions];
            setLocalSessions(prev => prev.filter(s => s.id !== session.id));

            router.delete(route('courses.sessions.destroy', session.id), {
                onError: () => {
                    setLocalSessions(originalSessions);
                    alert("Erreur lors de la suppression de la session.");
                }
            });
        }
    };

    // ─── Replays dynamiques (sessions de type 'rediffusion' avec un lien vidéo) ───
    const replays = (localSessions || []).filter(s => s.type === 'rediffusion' && s.lien_video);

    // ─── Logique du Calendrier Dynamique ─────────────────────────────────────────
    // La grille affiche les heures de CALENDAR_START_HOUR à CALENDAR_END_HOUR.
    // Chaque heure = HOUR_HEIGHT pixels en hauteur.
    const CALENDAR_START_HOUR = 7;  // La grille commence à 7h00
    const CALENDAR_END_HOUR   = 20; // La grille se termine à 20h00
    const HOUR_HEIGHT         = 80; // pixels par heure

    /**
     * Convertit une chaîne "HH:MM" en { hours, minutes }.
     */
    const parseTime = (timeStr) => {
        const [h, m] = (timeStr || '00:00').split(':').map(Number);
        return { hours: h, minutes: m };
    };

    /**
     * Calcule la position CSS top (px) et la hauteur (px) d'un événement
     * en fonction de son heure de début et de sa durée.
     */
    const getEventStyle = (startHour, startMinutes, durationMinutes) => {
        const clampedStart = Math.max(startHour + startMinutes / 60, CALENDAR_START_HOUR);
        const top    = (clampedStart - CALENDAR_START_HOUR) * HOUR_HEIGHT;
        const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24); // min 24px
        return { top: `${top}px`, height: `${height}px` };
    };

    /**
     * Construit la liste des événements à afficher pour la semaine visible.
     * Gère les deux modes : flexible (sessions datées) et régulier (horaires récurrents).
     *
     * Convention jour_semaine : 1=Lundi, 2=Mardi, …, 6=Samedi, 0=Dimanche
     * weekDays[0] = Lundi, weekDays[6] = Dimanche
     */
    const buildCalendarEvents = () => {
        const events = [];

        if (course.type_planification === 'flexible') {
            // Chaque session a une date_heure précise.
            (localSessions || []).forEach(session => {
                if (!session.date_heure) return;
                const sessionDate = new Date(session.date_heure);
                const dayIndex = weekDays.findIndex(
                    d => d.toDateString() === sessionDate.toDateString()
                );
                if (dayIndex === -1) return; // Pas dans cette semaine

                const startHour    = sessionDate.getHours();
                const startMinutes = sessionDate.getMinutes();
                const duration     = session.duree_minutes || 60;

                events.push({
                    key:      `session-${session.id}`,
                    dayIndex,
                    startHour,
                    startMinutes,
                    duration,
                    titre:    session.titre || 'Session',
                    type:     session.type,
                    statut:   session.statut,
                    lien:     session.lien_live || session.lien_video || null,
                    session:  session,
                });
            });
        } else {
            // Mode régulier : les horaires se répètent chaque semaine.
            // On les projette sur les jours de la semaine affichée.
            (course.horaires || []).forEach(horaire => {
                // Convertir jour_semaine (1=Lundi…6=Samedi, 0=Dimanche) en index weekDays
                // weekDays[0]=Lundi … weekDays[5]=Samedi, weekDays[6]=Dimanche
                let dayIndex;
                if (horaire.jour_semaine === 0) {
                    dayIndex = 6; // Dimanche → dernière colonne
                } else {
                    dayIndex = horaire.jour_semaine - 1; // 1→0, 2→1, … 6→5
                }

                const { hours: startH, minutes: startM } = parseTime(horaire.heure_debut);
                const { hours: endH,   minutes: endM   } = parseTime(horaire.heure_fin);
                const duration = (endH * 60 + endM) - (startH * 60 + startM);

                events.push({
                    key:      `horaire-${horaire.id}`,
                    dayIndex,
                    startHour:    startH,
                    startMinutes: startM,
                    duration:     Math.max(duration, 15),
                    titre:    course.titre || 'Cours',
                    type:     'regulier',
                    statut:   null,
                    lien:     null,
                });
            });
        }

        return events;
    };

    const calendarEvents = buildCalendarEvents();

    // ─── Helpers de couleur pour les événements ───────────────────────────────────
    const getEventColor = (type, statut) => {
        if (type === 'live') {
            return {
                bg:     'bg-secondary/10 border-secondary hover:shadow-secondary/20',
                border: 'border-l-4 border-secondary',
                text:   'text-secondary',
                badge:  'bg-secondary text-white',
                label:  'LIVE',
            };
        }
        if (type === 'rediffusion') {
            return {
                bg:     'bg-indigo-50 border-indigo-300 hover:shadow-indigo-100',
                border: 'border-l-4 border-indigo-400',
                text:   'text-indigo-700',
                badge:  'bg-indigo-500 text-white',
                label:  'REPLAY',
            };
        }
        // mode régulier
        return {
            bg:     'bg-primary/10 border-primary hover:shadow-primary/10',
            border: 'border-l-4 border-primary',
            text:   'text-primary',
            badge:  null,
            label:  null,
        };
    };

    const calendarHours = Array.from(
        { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
        (_, i) => CALENDAR_START_HOUR + i
    );

    const tabs = [
        { id: 'module', label: 'Module', icon: 'view_module' },
        { id: 'ressource', label: 'Ressource', icon: 'folder_open' },
        { id: 'note', label: 'Note', icon: 'edit_note' },
        { id: 'calendrier', label: 'Calendrier', icon: 'calendar_month' },
        { id: 'replay', label: 'Replay', icon: 'history' },
        { id: 'parametre', label: 'Paramètres', icon: 'settings' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Cours : ${course?.id || 'Chargement...'}`} />

            <div className="max-w-6xl mx-auto flex flex-col gap-6">
                {/* 2. Barre d'Onglets (au sommet désormais) */}
                <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-outline-variant/30 overflow-x-auto scrollbar-hide">
                    <nav className="flex items-center gap-2 min-w-max">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                    activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-on-surface-variant hover:bg-surface-container-high'
                                }`}
                            >
                                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 3. Zone de Contenu Dynamique */}
                <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30 min-h-[400px]">
                    {activeTab === 'module' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-manrope text-xl font-bold text-primary">Programme du cours</h3>
                                {isTeacher && (
                                    <button 
                                        onClick={handleAddModule}
                                        className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_circle</span>
                                        Ajouter un Module
                                    </button>
                                )}
                            </div>
                                 {localModules.length === 0 ? (
                                <div className="border-2 border-dashed border-outline-variant/30 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">view_module</span>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-on-surface">Aucun module pour le moment</p>
                                        <p className="text-sm text-on-surface-variant">Commencez par ajouter un module pour structurer le cours.</p>
                                    </div>
                                    {isTeacher && (
                                        <button 
                                            onClick={handleAddModule}
                                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Créer le premier module
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {localModules.map((module) => (
                                        <div 
                                            key={module.id} 
                                            className={`border border-outline-variant/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300 transition-all ${
                                                module.isDeleting ? 'opacity-40 animate-pulse pointer-events-none' : ''
                                            }`}
                                        >
                                            <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                                                <h4 className="font-bold text-primary flex items-center gap-2">
                                                    {module.titre}
                                                    {module.isSaving && (
                                                        <span className="text-[10px] font-black text-secondary animate-pulse uppercase tracking-widest bg-secondary/10 px-2 py-0.5 rounded">
                                                            Enregistrement...
                                                        </span>
                                                    )}
                                                </h4>
                                                {isTeacher && !module.isSaving && (
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleEditModule(module)}
                                                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-secondary transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteModule(module)}
                                                            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-red-500 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="divide-y divide-outline-variant/20">
                                                {module.sessions && module.sessions.length > 0 ? (
                                                    module.sessions.map((session) => (
                                                        session.isSaving ? (
                                                            <div key={session.id} className="w-full flex items-center justify-between p-4 bg-surface-container-lowest animate-pulse">
                                                                <div className="flex items-center gap-4 w-full">
                                                                    <span className="material-symbols-outlined text-secondary animate-spin text-sm">
                                                                        sync
                                                                    </span>
                                                                    <div className="h-4 bg-on-surface-variant/20 rounded-md w-1/3"></div>
                                                                    <div className="h-4 bg-on-surface-variant/20 rounded-md w-12 ml-auto"></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                key={session.id} 
                                                                className={`w-full flex items-center justify-between p-4 hover:bg-surface-container-lowest transition-colors group ${
                                                                    session.isDeleting ? 'opacity-40 animate-pulse pointer-events-none' : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`material-symbols-outlined ${session.statut === 'terminé' ? 'text-green-500' : 'text-on-surface-variant'}`}>
                                                                        {session.statut === 'terminé' ? 'check_circle' : 'play_circle'}
                                                                    </span>
                                                                    <span className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors text-left">
                                                                        {session.titre}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                                                                        {session.duree_minutes} min
                                                                    </span>
                                                                    {isTeacher && (
                                                                        <div className="flex items-center gap-1 border-l border-outline-variant/20 pl-2">
                                                                            <button 
                                                                                onClick={() => handleEditLesson(session)}
                                                                                className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-secondary"
                                                                            >
                                                                                <span className="material-symbols-outlined text-xs">edit</span>
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteLesson(session)}
                                                                                className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant hover:text-red-500"
                                                                            >
                                                                                <span className="material-symbols-outlined text-xs">delete</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    ))
                                                ) : (
                                                    <div className="p-6 text-center text-xs text-on-surface-variant italic">
                                                        Aucune leçon dans ce module.
                                                    </div>
                                                )}
                                                {isTeacher && (
                                                    <button 
                                                        onClick={() => handleAddLesson(module)}
                                                        className="w-full py-3 text-[10px] font-black text-on-surface-variant hover:text-secondary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">add</span>
                                                        Ajouter une leçon
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ressource' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-manrope text-xl font-bold text-primary">Ressources téléchargeables</h3>
                                {isTeacher && (
                                    <button 
                                        onClick={handleOpenResourceModal}
                                        className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                        Ajouter une Ressource
                                    </button>
                                )}
                            </div>

                            {localRessources.length === 0 ? (
                                <div className="border-2 border-dashed border-outline-variant/30 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">folder_open</span>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold text-on-surface">Aucune ressource pour le moment</p>
                                        <p className="text-sm text-on-surface-variant">Le professeur n'a pas encore partagé de fichiers ou de liens.</p>
                                    </div>
                                    {isTeacher && (
                                        <button 
                                            onClick={handleOpenResourceModal}
                                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Ajouter le premier fichier
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {localRessources.map((ressource) => {
                                        const style = getResourceStyle(ressource.type);
                                        const size = formatFileSize(ressource.taille_fichier);
                                        const dateStr = formatDate(ressource.created_at);

                                        return (
                                            <div 
                                                key={ressource.id} 
                                                className={`p-4 border-2 border-outline-variant/10 rounded-2xl flex items-center gap-4 hover:border-secondary/30 transition-all group relative overflow-hidden bg-surface-container-lowest shadow-sm ${
                                                    ressource.isDeleting ? 'opacity-40 animate-pulse pointer-events-none' : ''
                                                }`}
                                            >
                                                {ressource.isSaving ? (
                                                    <div className="flex items-center gap-4 w-full animate-pulse">
                                                        <div className="h-12 w-12 bg-on-surface-variant/10 rounded-xl shrink-0 animate-spin flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-secondary text-sm">sync</span>
                                                        </div>
                                                        <div className="flex-1 flex flex-col gap-2">
                                                            <div className="h-4 bg-on-surface-variant/20 rounded-md w-2/3"></div>
                                                            <div className="h-3 bg-on-surface-variant/10 rounded-md w-1/3"></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-transparent transition-colors ${style.color}`}>
                                                            <span className="material-symbols-outlined text-3xl">{style.icon}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-on-surface truncate pr-6 group-hover:text-primary transition-colors">{ressource.titre}</p>
                                                            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest flex flex-wrap gap-1.5 items-center mt-0.5">
                                                                <span>{ressource.type}</span>
                                                                {size && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{size}</span>
                                                                    </>
                                                                )}
                                                                {dateStr && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{dateStr}</span>
                                                                    </>
                                                                )}
                                                            </p>
                                                            {ressource.description && (
                                                                <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 italic">{ressource.description}</p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1.5">
                                                            <a 
                                                                href={ressource.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="h-8 w-8 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-secondary transition-all flex items-center justify-center"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">
                                                                    {ressource.type === 'lien' ? 'open_in_new' : 'download'}
                                                                </span>
                                                            </a>
                                                            {isTeacher && (
                                                                <button 
                                                                    onClick={() => handleDeleteResource(ressource)}
                                                                    className="h-8 w-8 hover:bg-surface-container-high rounded-xl text-on-surface-variant hover:text-red-500 transition-all flex items-center justify-center"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'note' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-manrope text-xl font-bold text-primary">Mes Notes Personnelles</h3>
                                <button className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Enregistrer
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-64 bg-surface-container-low border-2 border-outline-variant/30 rounded-2xl p-6 focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium leading-relaxed"
                                placeholder="Notez ici les points importants de la leçon..."
                            ></textarea>
                            <p className="text-[10px] text-on-surface-variant italic">Vos notes sont sauvegardées automatiquement et ne sont visibles que par vous.</p>
                        </div>
                    )}

                    {activeTab === 'calendrier' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-manrope text-xl font-bold text-primary">Emploi du temps du cours</h3>
                                {isTeacher && (
                                    <button 
                                        onClick={handleOpenSessionModal}
                                        className="bg-secondary text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">more_time</span>
                                        Programmer une Session
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-on-surface-variant opacity-0">Placeholder</h3> {/* Alignement */}
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setCurrentDate(new Date())}
                                        className="px-4 py-2 hover:bg-surface-container-high rounded-xl text-xs font-bold text-secondary transition-all border border-outline-variant/30"
                                    >
                                        Aujourd'hui
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={prevWeek}
                                            className="p-2 hover:bg-surface-container-high rounded-full transition-all"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setViewedYear(currentDate.getFullYear());
                                                setPickerView('months');
                                                setIsPickerOpen(true);
                                            }}
                                            className="px-4 py-1 hover:bg-surface-container-high rounded-xl transition-all group"
                                        >
                                            <span className="text-sm font-bold text-primary capitalize text-center group-hover:text-secondary">
                                                {formatHeaderDate()}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={nextWeek}
                                            className="p-2 hover:bg-surface-container-high rounded-full transition-all"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>

                                    {/* Badge de plage de dates */}
                                    <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl text-xs font-black border border-secondary/20 shadow-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">date_range</span>
                                        {weekDays[0].getDate()} — {weekDays[6].getDate()}
                                    </div>
                                </div>
                            </div>

                            {/* Grille de Calendrier Moderne */}
                            <div className="border border-outline-variant/30 rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                                <div className="min-w-[800px]">
                                    {/* En-tête des jours */}
                                    <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-surface-container-low border-b border-outline-variant/30">
                                        <div className="h-14"></div>
                                        {weekDays.map((date, i) => {
                                            const isToday = new Date().toDateString() === date.toDateString();
                                            return (
                                                <div key={i} className={`h-14 flex flex-col items-center justify-center border-l border-outline-variant/30 ${isToday ? 'bg-secondary/5' : ''}`}>
                                                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                                        {date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className={`text-sm font-bold ${isToday ? 'text-secondary' : 'text-primary'}`}>
                                                        {date.getDate()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Grille des heures — dynamique */}
                                    <div className="relative">
                                        {calendarHours.map((hour) => (
                                            <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] h-20">
                                                <div className="flex items-start justify-end pr-4 pt-2 text-[10px] font-bold text-on-surface-variant bg-surface-container-low/20 border-b border-outline-variant/10">
                                                    {hour}:00
                                                </div>
                                                {[...Array(7)].map((_, i) => (
                                                    <div key={i} className="border-l border-b border-outline-variant/10 relative"></div>
                                                ))}
                                            </div>
                                        ))}

                                        {/* Événements dynamiques positionnés en absolute */}
                                        {calendarEvents.map((evt) => {
                                            const colors = getEventColor(evt.type, evt.statut);
                                            const evtStyle = getEventStyle(evt.startHour, evt.startMinutes, evt.duration);
                                            const endTotalMins = evt.startHour * 60 + evt.startMinutes + evt.duration;
                                            const endH = Math.floor(endTotalMins / 60);
                                            const endM = endTotalMins % 60;
                                            const timeLabel = `${String(evt.startHour).padStart(2,'0')}:${String(evt.startMinutes).padStart(2,'0')} – ${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;

                                            return (
                                                <div
                                                    key={evt.key}
                                                    className="absolute p-1"
                                                    style={{
                                                        top:   evtStyle.top,
                                                        left:  `calc(80px + ${evt.dayIndex} * (100% - 80px) / 7)`,
                                                        width: 'calc((100% - 80px) / 7)',
                                                        height: evtStyle.height,
                                                    }}
                                                >
                                                    <div
                                                        className={`h-full w-full rounded-xl p-2 flex flex-col gap-0.5 hover:shadow-md transition-all cursor-pointer group overflow-hidden ${colors.bg} ${colors.border}`}
                                                    >
                                                        <div className="flex justify-between items-start gap-1">
                                                            <p className={`text-[9px] font-black uppercase tracking-tighter truncate ${colors.text}`}>
                                                                {timeLabel}
                                                            </p>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {colors.badge && (
                                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${colors.badge} ${evt.type === 'live' ? 'animate-pulse' : ''}`}>
                                                                        {colors.label}
                                                                    </span>
                                                                )}
                                                                {isTeacher && evt.session && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteSession(evt.session);
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-100/50 transition-colors flex items-center justify-center"
                                                                        title="Supprimer la session"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[12px]">delete</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <h4 className={`text-xs font-bold leading-tight line-clamp-2 group-hover:opacity-80 ${colors.text}`}>
                                                            {evt.titre}
                                                        </h4>
                                                        {evt.lien && (
                                                            <p className="text-[10px] text-on-surface-variant font-medium mt-auto flex items-center gap-1 truncate">
                                                                <span className="material-symbols-outlined text-[12px]">videocam</span>
                                                                <span className="truncate">{evt.lien}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Message si aucun événement cette semaine */}
                                        {calendarEvents.length === 0 && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
                                                <span className="material-symbols-outlined text-4xl text-outline-variant">event_busy</span>
                                                <p className="text-sm font-bold text-on-surface-variant">Aucune session cette semaine</p>
                                                <p className="text-xs text-on-surface-variant/70">
                                                    {course.type_planification === 'regulier'
                                                        ? 'Les créneaux récurrents apparaissent chaque semaine.'
                                                        : 'Naviguez dans le calendrier pour trouver les sessions programmées.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 border border-outline-variant/30">
                                <span className="material-symbols-outlined text-secondary">info</span>
                                <p className="text-xs font-medium text-on-surface-variant">
                                    Les horaires sont affichés selon votre fuseau horaire local. Cliquez sur une session pour plus de détails.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'replay' && (
                        <div className="flex flex-col gap-6">
                            <h3 className="font-manrope text-xl font-bold text-primary">Enregistrements Précédents</h3>
                            {replays.length === 0 ? (
                                <div className="border-2 border-dashed border-outline-variant/30 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                                    <span className="material-symbols-outlined text-5xl text-outline-variant">videocam_off</span>
                                    <p className="font-bold text-on-surface">Aucun enregistrement disponible</p>
                                    <p className="text-sm text-on-surface-variant">Les replays apparaîtront ici une fois les sessions terminées et les liens vidéos ajoutés.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {replays.map((replay) => (
                                        <a
                                            key={replay.id}
                                            href={replay.lien_video}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group cursor-pointer block"
                                        >
                                            <div className="aspect-video bg-surface-container-high rounded-2xl overflow-hidden relative mb-3">
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                    <span className="material-symbols-outlined text-white text-5xl">play_circle</span>
                                                </div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-outline-variant text-5xl">smart_display</span>
                                                </div>
                                                {replay.duree_minutes && (
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold">
                                                        {Math.floor(replay.duree_minutes / 60)}h{String(replay.duree_minutes % 60).padStart(2, '0')}
                                                    </div>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">{replay.titre}</h4>
                                            <p className="text-xs text-on-surface-variant font-medium mt-1">
                                                {replay.date_heure ? new Date(replay.date_heure).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                            </p>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'parametre' && (
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                                <h3 className="font-manrope text-2xl font-bold text-primary">Paramètres du cours</h3>
                                <p className="text-sm text-on-surface-variant">Gérez les configurations et les options de ce cours.</p>
                            </div>
                            
                            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300 delay-75">
                                <h4 className="font-bold text-primary">Détails du cours</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-on-surface-variant">Titre :</span>
                                        <span className="ml-2 font-bold text-on-surface">{course?.titre || 'Non défini'}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-on-surface-variant">Type :</span>
                                        <span className="ml-2 font-bold text-on-surface capitalize">{course?.type_planification === 'regulier' ? 'Régulier' : 'Flexible'}</span>
                                    </div>
                                </div>
                            </div>

                            {isTeacher ? (
                                <div className="border border-red-200 bg-red-50/20 rounded-3xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300 delay-150">
                                    <div className="flex items-center gap-3 text-red-700">
                                        <span className="material-symbols-outlined text-2xl">warning</span>
                                        <h4 className="font-bold text-lg">Zone de danger</h4>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">
                                        La suppression d'un cours est définitive et irréversible. Toutes les données associées (leçons, sessions, replays et ressources) seront supprimées à jamais.
                                    </p>
                                    <div className="flex justify-start">
                                        <button 
                                            onClick={() => {
                                                if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce cours ? Cette action est irréversible et supprimera toutes les sessions associées.")) {
                                                    router.delete(route('courses.destroy', course.id));
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete_forever</span>
                                            Supprimer définitivement ce cours
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-red-200 bg-red-50/20 rounded-3xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300 delay-150">
                                    <div className="flex items-center gap-3 text-red-700">
                                        <span className="material-symbols-outlined text-2xl">warning</span>
                                        <h4 className="font-bold text-lg">Zone de danger</h4>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">
                                        Si vous quittez ce cours, vous n'aurez plus accès aux modules, leçons, ressources et directs. Vos progrès actuels ne seront pas conservés.
                                    </p>
                                    <div className="flex justify-start">
                                        <button 
                                            onClick={() => {
                                                if (window.confirm("Êtes-vous sûr de vouloir quitter ce cours ?")) {
                                                    router.delete(route('courses.quitter', course.id));
                                                }
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">logout</span>
                                            Quitter ce cours
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Premium de Programmation de Session */}
            {sessionModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseSessionModal}
                    ></div>
                    
                    <form 
                        onSubmit={handleSessionSubmit}
                        className="relative bg-surface-container-lowest w-full max-w-md rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                            <h3 className="font-manrope text-sm font-bold text-primary">
                                Programmer une Session
                            </h3>
                            <button 
                                type="button"
                                onClick={handleCloseSessionModal}
                                className="p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            {/* Titre */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Titre de la session *
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={sessionModal.fields.titre}
                                    onChange={(e) => setSessionModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, titre: e.target.value }
                                    }))}
                                    placeholder="Ex: Atelier Pratique : Backend Logic"
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>

                            {/* Date et Heure */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Date et Heure *
                                </label>
                                <input 
                                    type="datetime-local"
                                    required
                                    value={sessionModal.fields.date_heure}
                                    onChange={(e) => setSessionModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, date_heure: e.target.value }
                                    }))}
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>

                            {/* Durée (minutes) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Durée (en minutes) *
                                </label>
                                <input 
                                    type="number"
                                    required
                                    min="1"
                                    value={sessionModal.fields.duree_minutes}
                                    onChange={(e) => setSessionModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, duree_minutes: parseInt(e.target.value) || 0 }
                                    }))}
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-surface-container-low/50 flex justify-end gap-2 border-t border-outline-variant/20">
                            <button 
                                type="button"
                                onClick={handleCloseSessionModal}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                            >
                                Programmer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal de Sélection de Date */}
            {isPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
                        onClick={() => setIsPickerOpen(false)}
                    ></div>
                    
                    <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header de la Modal */}
                        <div className="p-6 text-center border-b border-outline-variant/20 bg-surface-container-low">
                            <button 
                                onClick={() => setPickerView(pickerView === 'months' ? 'years' : 'months')}
                                className="flex items-center gap-2 mx-auto px-4 py-1.5 rounded-full hover:bg-surface-container-high transition-all group"
                            >
                                <span className="text-xl font-black text-primary group-hover:text-secondary transition-colors">
                                    {pickerView === 'months' ? viewedYear : 'Sélectionner l\'année'}
                                </span>
                                <span className="material-symbols-outlined text-primary group-hover:text-secondary">
                                    {pickerView === 'months' ? 'expand_more' : 'expand_less'}
                                </span>
                            </button>
                        </div>

                        {/* Corps de la Modal */}
                        <div className="p-6">
                            {pickerView === 'months' ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {months.map((month, index) => {
                                        const isSelected = currentDate.getMonth() === index && currentDate.getFullYear() === viewedYear;
                                        return (
                                            <button
                                                key={month}
                                                onClick={() => handleMonthSelect(index)}
                                                className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                                                    isSelected 
                                                    ? 'bg-primary text-white shadow-md' 
                                                    : 'text-on-surface-variant hover:bg-surface-container-high'
                                                }`}
                                            >
                                                {month.substring(0, 4)}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                    {years.map((year) => {
                                        const isSelected = viewedYear === year;
                                        return (
                                            <button
                                                key={year}
                                                onClick={() => handleYearSelect(year)}
                                                className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                                                    isSelected 
                                                    ? 'bg-secondary text-white shadow-md' 
                                                    : 'text-on-surface-variant hover:bg-surface-container-high'
                                                }`}
                                            >
                                                {year}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Action */}
                        <div className="p-4 bg-surface-container-low/50 flex justify-end">
                            <button 
                                onClick={() => setIsPickerOpen(false)}
                                className="px-6 py-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Formulaire Custom Premium */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
                        onClick={closeModal}
                    ></div>
                    
                    <form 
                        onSubmit={handleModalSubmit}
                        className="relative bg-surface-container-lowest w-full max-w-md rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                            <h3 className="font-manrope text-sm font-bold text-primary">
                                {modal.title}
                            </h3>
                            <button 
                                type="button"
                                onClick={closeModal}
                                className="p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    {modal.type.includes('Module') ? 'Titre du module' : 'Titre de la leçon'}
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={modal.fields.titre}
                                    onChange={(e) => setModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, titre: e.target.value }
                                    }))}
                                    placeholder={modal.type.includes('Module') ? "Ex: Introduction à React" : "Ex: Installation de l'environnement"}
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>

                            {!modal.type.includes('Module') && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                        Durée de la leçon (en minutes)
                                    </label>
                                    <input 
                                        type="number"
                                        required
                                        min="1"
                                        value={modal.fields.duree_minutes}
                                        onChange={(e) => setModal(prev => ({
                                            ...prev,
                                            fields: { ...prev.fields, duree_minutes: e.target.value }
                                        }))}
                                        placeholder="Ex: 15"
                                        className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-surface-container-low/50 flex justify-end gap-2 border-t border-outline-variant/20">
                            <button 
                                type="button"
                                onClick={closeModal}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* Modal Premium de Création de Ressource */}
            {resourceModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseResourceModal}
                    ></div>
                    
                    <form 
                        onSubmit={handleResourceSubmit}
                        className="relative bg-surface-container-lowest w-full max-w-md rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                            <h3 className="font-manrope text-sm font-bold text-primary">
                                Ajouter une ressource
                            </h3>
                            <button 
                                type="button"
                                onClick={handleCloseResourceModal}
                                className="p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                            {/* Titre */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Titre de la ressource *
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={resourceModal.fields.titre}
                                    onChange={(e) => setResourceModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, titre: e.target.value }
                                    }))}
                                    placeholder="Ex: Manuel de cours React"
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Description (facultative)
                                </label>
                                <textarea 
                                    value={resourceModal.fields.description || ''}
                                    onChange={(e) => setResourceModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, description: e.target.value }
                                    }))}
                                    placeholder="Ex: À lire avant le TP de la semaine."
                                    rows="2"
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                ></textarea>
                            </div>

                            {/* Type de ressource */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Type de ressource
                                </label>
                                <select 
                                    value={resourceModal.fields.type}
                                    onChange={(e) => setResourceModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, type: e.target.value }
                                    }))}
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                >
                                    <option value="pdf">PDF (Document de cours)</option>
                                    <option value="video">Vidéo locale / Enregistrement</option>
                                    <option value="slide">Slides de présentation (PPTX, PDF)</option>
                                    <option value="document">Autre Document (DOCX, Excel...)</option>
                                    <option value="image">Image (Illustration, Graphique)</option>
                                    <option value="lien">Lien Internet externe (Dépôt Git...)</option>
                                    <option value="autre">Autre format</option>
                                </select>
                            </div>

                            {/* Source type selector */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Source de la ressource
                                </label>
                                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/20">
                                    <button 
                                        type="button"
                                        onClick={() => setResourceModal(prev => ({
                                            ...prev,
                                            fields: { ...prev.fields, source_type: 'fichier', type: prev.fields.type === 'lien' ? 'pdf' : prev.fields.type }
                                        }))}
                                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                            resourceModal.fields.source_type === 'fichier'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                                        Fichier à téléverser
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setResourceModal(prev => ({
                                            ...prev,
                                            fields: { ...prev.fields, source_type: 'lien', type: 'lien' }
                                        }))}
                                        className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                            resourceModal.fields.source_type === 'lien'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-on-surface-variant hover:bg-surface-container-high'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">link</span>
                                        Lien Internet
                                    </button>
                                </div>
                            </div>

                            {/* Source input */}
                            {resourceModal.fields.source_type === 'fichier' ? (
                                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                        Sélectionnez le fichier * (50MB max)
                                    </label>
                                    <div className="relative border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 hover:border-secondary transition-all flex flex-col items-center gap-2 text-center group cursor-pointer bg-surface-container-low/50">
                                        <input 
                                            type="file"
                                            required
                                            onChange={(e) => setResourceModal(prev => ({
                                                ...prev,
                                                fields: { ...prev.fields, fichier: e.target.files[0] }
                                            }))}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-secondary group-hover:scale-110 transition-all">
                                            cloud_upload
                                        </span>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-xs font-bold text-on-surface select-none">
                                                {resourceModal.fields.fichier ? resourceModal.fields.fichier.name : "Cliquez ou glissez un fichier ici"}
                                            </p>
                                            <p className="text-[10px] text-on-surface-variant font-medium select-none">
                                                {resourceModal.fields.fichier ? `${formatFileSize(resourceModal.fields.fichier.size)}` : "PDF, ZIP, DOCX, Images..."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                        Adresse Web de la ressource (URL) *
                                    </label>
                                    <input 
                                        type="url"
                                        required
                                        value={resourceModal.fields.url}
                                        onChange={(e) => setResourceModal(prev => ({
                                            ...prev,
                                            fields: { ...prev.fields, url: e.target.value }
                                        }))}
                                        placeholder="https://github.com/mon-depot"
                                        className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                    />
                                </div>
                            )}

                            {/* Session id selector (optionnel, pour lier la ressource à un cours particulier) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                    Lier à une leçon (optionnel)
                                </label>
                                <select 
                                    value={resourceModal.fields.session_id}
                                    onChange={(e) => setResourceModal(prev => ({
                                        ...prev,
                                        fields: { ...prev.fields, session_id: e.target.value }
                                    }))}
                                    className="w-full bg-surface-container-low border-2 border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                                >
                                    <option value="">Ressource générale du cours</option>
                                    {localModules.map(m => (
                                        <optgroup key={m.id} label={m.titre}>
                                            {m.sessions && m.sessions.map(s => (
                                                <option key={s.id} value={s.id}>↳ {s.titre}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer & Upload Progress Bar */}
                        <div className="p-6 bg-surface-container-low/50 flex flex-col gap-4 border-t border-outline-variant/20">
                            {uploadProgress !== null && (
                                <div className="w-full flex flex-col gap-1 animate-in fade-in duration-200">
                                    <div className="flex justify-between text-[10px] font-black text-secondary uppercase tracking-wider">
                                        <span>Téléversement du fichier...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/10 p-0.5">
                                        <div 
                                            className="h-full bg-secondary rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button"
                                    onClick={handleCloseResourceModal}
                                    disabled={uploadProgress !== null}
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-40"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    disabled={uploadProgress !== null}
                                    className="bg-primary hover:opacity-90 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 flex items-center gap-2"
                                >
                                    {uploadProgress !== null && (
                                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                    )}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
