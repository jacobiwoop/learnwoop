import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';

function localToUtc(value) {
  // value is 'YYYY-MM-DDTHH:MM' (no timezone info)
  // JavaScript Date interprets it as local time, so we convert to UTC string
  const date = new Date(value); 
  return date.toISOString();
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        titre: '',
        description: '',
        image_couverture: '',
        type_planification: 'flexible', // 'flexible' ou 'regulier'
        sessions: [
            { titre: 'Session 1', date_heure: '', duree_minutes: 60, type: 'live' }
        ],
        horaires: [] // Pour le mode régulier: { jour_semaine: 1, heure_debut: '08:00', heure_fin: '10:00' }
    });

    const joursSemaine = [
        { index: 1, label: 'Lundi' },
        { index: 2, label: 'Mardi' },
        { index: 3, label: 'Mercredi' },
        { index: 4, label: 'Jeudi' },
        { index: 5, label: 'Vendredi' },
        { index: 6, label: 'Samedi' },
        { index: 0, label: 'Dimanche' },
    ];

    // --- Fonctions pour le mode Flexible (Sessions) ---
    const addSession = () => {
        setData('sessions', [
            ...data.sessions,
            { titre: `Session ${data.sessions.length + 1}`, date_heure: localToUtc(new Date().toISOString().slice(0, 16)), duree_minutes: 60, type: 'live' }
        ]);
    };

    const updateSession = (index, field, value) => {
        const newSessions = [...data.sessions];
        if (field === 'date_heure') {
            newSessions[index][field] = localToUtc(value);
        } else {
            newSessions[index][field] = value;
        }
        setData('sessions', newSessions);
    };

    const removeSession = (index) => {
        const newSessions = data.sessions.filter((_, i) => i !== index);
        setData('sessions', newSessions);
    };

    // --- Fonctions pour le mode Régulier (Horaires) ---
    const toggleJour = (indexJour) => {
        const existe = data.horaires.find(h => h.jour_semaine === indexJour);
        if (existe) {
            setData('horaires', data.horaires.filter(h => h.jour_semaine !== indexJour));
        } else {
            setData('horaires', [...data.horaires, { jour_semaine: indexJour, heure_debut: '08:00', heure_fin: '10:00' }]);
        }
    };

    const updateHoraire = (indexJour, field, value) => {
        setData('horaires', data.horaires.map(h => {
            if (h.jour_semaine === indexJour) {
                return { ...h, [field]: value };
            }
            return h;
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('courses.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Créer un nouveau cours" />

            <div className="max-w-4xl mx-auto py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-primary font-manrope">Créer un nouveau cours</h1>
                    <Link href={route('courses.index')} className="text-secondary font-bold hover:underline">
                        Retour aux cours
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-8 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/30">
                    
                    {/* Informations générales */}
                    <section>
                        <h2 className="text-xl font-bold text-primary mb-4 border-b border-outline-variant/30 pb-2">Informations Générales</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-1">Titre du cours</label>
                                <input 
                                    type="text" 
                                    className="w-full rounded-xl border-outline-variant focus:border-secondary focus:ring-secondary/20"
                                    value={data.titre}
                                    onChange={e => setData('titre', e.target.value)}
                                    placeholder="Ex: Introduction à React"
                                    required
                                />
                                {errors.titre && <div className="text-red-500 text-sm mt-1">{errors.titre}</div>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-1">Description</label>
                                <textarea 
                                    className="w-full rounded-xl border-outline-variant focus:border-secondary focus:ring-secondary/20"
                                    rows="4"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Décrivez les objectifs de ce cours..."
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* Planification (Choix du mode) */}
                    <section>
                        <div className="flex items-center justify-between mb-6 border-b border-outline-variant/30 pb-2">
                            <h2 className="text-xl font-bold text-primary">Planification</h2>
                        </div>
                        
                        {/* Type de planification (Boutons radio) */}
                        <div className="flex gap-4 mb-8">
                            <label className={`flex-1 cursor-pointer p-4 rounded-2xl border-2 transition-all ${data.type_planification === 'regulier' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="type_planification" 
                                        value="regulier"
                                        checked={data.type_planification === 'regulier'}
                                        onChange={(e) => setData('type_planification', e.target.value)}
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="font-bold text-on-surface text-lg">Cours Régulier</div>
                                        <div className="text-sm text-on-surface-variant">Se répète chaque semaine aux mêmes heures (Emploi du temps).</div>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex-1 cursor-pointer p-4 rounded-2xl border-2 transition-all ${data.type_planification === 'flexible' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="radio" 
                                        name="type_planification" 
                                        value="flexible"
                                        checked={data.type_planification === 'flexible'}
                                        onChange={(e) => setData('type_planification', e.target.value)}
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="font-bold text-on-surface text-lg">Cours Flexible</div>
                                        <div className="text-sm text-on-surface-variant">Dates et heures spécifiques créées ponctuellement.</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {errors.type_planification && <div className="text-red-500 text-sm mt-1">{errors.type_planification}</div>}

                        {/* --- MODE REGULIER (Mini-Calendrier) --- */}
                        {data.type_planification === 'regulier' && (
                            <div className="bg-surface-container p-6 rounded-2xl">
                                <h3 className="font-bold text-on-surface mb-4">Sélectionnez les jours et horaires :</h3>
                                {errors.horaires && <div className="text-red-500 text-sm mb-4">Veuillez sélectionner au moins un jour et définir des horaires valides.</div>}
                                
                                <div className="space-y-3">
                                    {joursSemaine.map(jour => {
                                        const isSelected = data.horaires.some(h => h.jour_semaine === jour.index);
                                        const horaireData = data.horaires.find(h => h.jour_semaine === jour.index);

                                        return (
                                            <div key={jour.index} className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-xl border transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-lowest'}`}>
                                                <label className="flex items-center gap-3 min-w-[150px] cursor-pointer mb-3 sm:mb-0">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => toggleJour(jour.index)}
                                                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                                                    />
                                                    <span className={`font-bold ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{jour.label}</span>
                                                </label>

                                                {isSelected && (
                                                    <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-4 duration-300">
                                                        <span className="text-sm text-on-surface-variant ml-2">De</span>
                                                        <input 
                                                            type="time" 
                                                            value={horaireData.heure_debut}
                                                            onChange={(e) => updateHoraire(jour.index, 'heure_debut', e.target.value)}
                                                            className="text-sm rounded-lg border-outline-variant focus:border-secondary focus:ring-secondary/20 py-1 px-2 w-28"
                                                            required
                                                        />
                                                        <span className="text-sm text-on-surface-variant">à</span>
                                                        <input 
                                                            type="time" 
                                                            value={horaireData.heure_fin}
                                                            onChange={(e) => updateHoraire(jour.index, 'heure_fin', e.target.value)}
                                                            className="text-sm rounded-lg border-outline-variant focus:border-secondary focus:ring-secondary/20 py-1 px-2 w-28"
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- MODE FLEXIBLE (Sessions détaillées) --- */}
                        {data.type_planification === 'flexible' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-on-surface-variant">Ajoutez les dates précises pour ce cours ponctuel.</p>
                                    <button 
                                        type="button" 
                                        onClick={addSession}
                                        className="text-sm font-bold bg-secondary/10 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span> Ajouter
                                    </button>
                                </div>

                                {data.sessions.map((session, index) => (
                                    <div key={index} className="bg-surface-container p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center relative group">
                                        {data.sessions.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeSession(index)}
                                                className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        )}
                                        
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-on-surface-variant mb-1">Titre (optionnel)</label>
                                            <input 
                                                type="text" 
                                                className="w-full text-sm rounded-lg border-outline-variant focus:border-secondary focus:ring-secondary/20 py-1.5"
                                                value={session.titre}
                                                onChange={e => updateSession(index, 'titre', e.target.value)}
                                                placeholder="Ex: Session d'introduction"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-on-surface-variant mb-1">Date et Heure</label>
                                            <input 
                                                type="datetime-local" 
                                                className="w-full text-sm rounded-lg border-outline-variant focus:border-secondary focus:ring-secondary/20 py-1.5"
                                                value={session.date_heure}
                                                onChange={e => updateSession(index, 'date_heure', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="w-full md:w-32">
                                            <label className="block text-xs font-bold text-on-surface-variant mb-1">Durée (min)</label>
                                            <input 
                                                type="number" 
                                                className="w-full text-sm rounded-lg border-outline-variant focus:border-secondary focus:ring-secondary/20 py-1.5"
                                                value={session.duree_minutes}
                                                onChange={e => updateSession(index, 'duree_minutes', parseInt(e.target.value))}
                                                min="15" step="15"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="flex justify-end pt-4">
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
                        >
                            <span className="material-symbols-outlined">save</span>
                            Enregistrer le cours
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
