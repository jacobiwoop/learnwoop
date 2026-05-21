import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LiveKitRoom, VideoTrack, useLocalParticipant, useParticipants, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function Show() {
    const user = usePage().props.auth.user;
    const isTeacher = user.role === 'prof';

    // LiveKit Connection States
    const [liveKitData, setLiveKitData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Token on Mount
    useEffect(() => {
        axios.get(route('livekit.token'))
            .then(res => {
                setLiveKitData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération du token LiveKit :", err);
                const errorMessage = err.response?.data?.error || "Impossible de se connecter au serveur de diffusion.";
                setError(errorMessage);
                setLoading(false);
            });
    }, []);

    const handleHangUp = () => {
        router.visit(route('dashboard'));
    };

    if (loading) {
        return (
            <AuthenticatedLayout fullWidth={true} fullHeight={true}>
                <Head title="Connexion au Direct..." />
                <div className="h-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold tracking-wide">Initialisation de la connexion sécurisée...</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (error || !liveKitData) {
        return (
            <AuthenticatedLayout fullWidth={true} fullHeight={true}>
                <Head title="Erreur de Connexion" />
                <div className="h-full bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 text-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-4xl">error</span>
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-lg font-black mb-2">Erreur de connexion au direct</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
                    </div>
                    <button 
                        onClick={handleHangUp}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <LiveKitRoom
            token={liveKitData.token}
            serverUrl={liveKitData.url}
            connect={true}
            video={true}
            audio={true}
            onDisconnected={handleHangUp}
        >
            <ActiveRoom user={user} isTeacher={isTeacher} handleHangUp={handleHangUp} />
        </LiveKitRoom>
    );
}

function ActiveRoom({ user, isTeacher, handleHangUp }) {
    // Media States from LiveKit SDK hooks
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useParticipants();

    // Sidebar States
    const [showParticipants, setShowParticipants] = useState(true);

    // Track state (Micro, Caméra, Partage d'écran)
    const isMuted = !localParticipant.isMicrophoneEnabled;
    const isCamOff = !localParticipant.isCameraEnabled;
    const isScreenSharing = localParticipant.isScreenShareEnabled;

    // Track query for camera tracks and screen shares
    const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
    const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);

    // Resolve which video track to display as main track
    // If someone shares their screen, display it in grand format
    const activeScreenShare = screenShareTracks[0];

    // Find the teacher's camera track if available, otherwise display active speaker or local
    const teacherTrack = cameraTracks.find(t => {
        try {
            const meta = JSON.parse(t.participant.metadata || '{}');
            return meta.role === 'prof';
        } catch (e) {
            return false;
        }
    });

    const activeVideoTrack = teacherTrack || cameraTracks[0];

    // Helper functions to toggle tracks
    const toggleMicrophone = async () => {
        await localParticipant.setMicrophoneEnabled(isMuted);
    };

    const toggleCamera = async () => {
        await localParticipant.setCameraEnabled(isCamOff);
    };

    const toggleScreenShare = async () => {
        await localParticipant.setScreenShareEnabled(!isScreenSharing);
    };

    return (
        <AuthenticatedLayout fullWidth={true} fullHeight={true}>
            <Head title="Direct & Diffusion (LiveKit)" />

            <div className="h-[calc(100vh-144px)] lg:h-[calc(100vh-64px)] bg-slate-950 text-slate-100 rounded-none overflow-hidden relative flex flex-col md:flex-row shadow-2xl border border-slate-800">
                
                {/* Espace Principal de Diffusion (Style Zoom/Meet Haut de Gamme) */}
                <div className="flex-1 flex flex-col justify-between p-6 relative bg-[#121214] z-10">
                    
                    {/* Zone d'affichage vidéo grand format */}
                    <div className="flex-1 flex items-center justify-center relative rounded-3xl overflow-hidden border border-[#232427] bg-[#1a1b1e] shadow-inner">
                        
                        {activeScreenShare ? (
                            // Render Active Screen Share
                            <div className="w-full h-full relative z-20">
                                <VideoTrack trackRef={activeScreenShare} className="w-full h-full object-contain" />
                                {activeScreenShare.participant === localParticipant && (
                                    <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
                                        <span className="material-symbols-outlined text-6xl text-secondary animate-bounce">screen_share</span>
                                        <h3 className="text-lg font-black text-slate-100">Vous partagez votre écran</h3>
                                        <p className="text-xs text-slate-400 max-w-sm">Tous les participants de la classe virtuelle voient votre écran actuellement.</p>
                                        <button 
                                            onClick={toggleScreenShare}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all"
                                        >
                                            Arrêter le partage
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : activeVideoTrack && activeVideoTrack.participant.isCameraEnabled ? (
                            // Render Active Video Stream (Teacher or local)
                            <VideoTrack 
                                trackRef={activeVideoTrack} 
                                className={`w-full h-full object-cover ${
                                    activeVideoTrack.participant === localParticipant ? 'transform -scale-x-100' : ''
                                }`} 
                            />
                        ) : (
                            // Show Placeholder when Camera is off
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary text-3xl font-black shadow-2xl relative animate-pulse">
                                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
                                    {activeVideoTrack ? (
                                        activeVideoTrack.participant.identity.substring(0, 2).toUpperCase()
                                    ) : (
                                        user.prenom[0] + user.nom[0]
                                    )}
                                </div>
                                <p className="text-sm font-bold text-slate-400">
                                    {activeVideoTrack && activeVideoTrack.participant !== localParticipant 
                                        ? "Caméra de l'intervenant désactivée" 
                                        : "Votre caméra est désactivée"
                                    }
                                </p>
                            </div>
                        )}

                        {/* Label d'identification en bas à gauche de la vidéo style Google Meet */}
                        <div className="absolute bottom-4 left-4 bg-slate-950/70 border border-slate-800/40 backdrop-blur-md pl-2 pr-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-lg z-10 select-none">
                            
                            {/* Avatar avec cercle de pulsation réactif à la voix */}
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                {/* Onde de choc qui pulse si le participant parle */}
                                {((activeScreenShare && activeScreenShare.participant.isSpeaking) || (!activeScreenShare && activeVideoTrack && activeVideoTrack.participant.isSpeaking)) && (
                                    <span className="absolute inset-0 rounded-full bg-secondary/30 border border-secondary animate-ping"></span>
                                )}
                                
                                {/* Le rond central avec l'initiale */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${
                                    ((activeScreenShare && activeScreenShare.participant.isSpeaking) || (!activeScreenShare && activeVideoTrack && activeVideoTrack.participant.isSpeaking))
                                        ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_8px_rgba(235,94,85,0.4)]' 
                                        : 'bg-primary/20 border-primary/30 text-primary'
                                }`}>
                                    {activeScreenShare 
                                        ? (activeScreenShare.participant.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase()
                                        : activeVideoTrack
                                            ? (activeVideoTrack.participant.name || 'Vous').split(' ').map(n => n[0]).join('').toUpperCase()
                                            : (user.prenom[0] + user.nom[0]).toUpperCase()
                                    }
                                </div>
                            </div>

                            {/* Texte du nom */}
                            <span className="text-[11px] text-slate-300 font-semibold tracking-wide">
                                {activeScreenShare 
                                    ? `Écran de ${activeScreenShare.participant.name || 'un participant'}`
                                    : activeVideoTrack && activeVideoTrack.participant !== localParticipant
                                        ? activeVideoTrack.participant.name
                                        : 'Vous'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Barre de Contrôle Inférieure Premium */}
                    <div className="grid grid-cols-3 items-center pt-6 pb-2 z-20">
                        {/* Zone Gauche : Indicateur de Direct */}
                        <div className="flex items-center gap-2.5 pl-2 select-none">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase hidden sm:inline">En direct</span>
                        </div>

                        {/* Zone Centre : Contrôles principaux */}
                        <div className="flex justify-center items-center gap-3">
                            {/* Bouton Split Microphone */}
                            <div className="flex items-center bg-[#202124] hover:bg-[#2c2d30] border border-[#3c4043] rounded-lg transition-all text-slate-200">
                                <button 
                                    onClick={toggleMicrophone}
                                    className={`flex items-center gap-2 px-4 py-2 border-r border-[#3c4043] rounded-l-lg text-sm font-semibold transition-all ${
                                        isMuted ? 'text-red-400 hover:text-red-300' : 'text-slate-200 hover:text-white'
                                    }`}
                                    title={isMuted ? "Activer le micro" : "Désactiver le micro"}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {isMuted ? 'mic_off' : 'mic'}
                                    </span>
                                    <span>Microphone</span>
                                </button>
                                <button 
                                    className="px-2 py-2 hover:bg-[#35363a] rounded-r-lg transition-all flex items-center justify-center self-stretch"
                                    title="Paramètres audio"
                                >
                                    <span className="material-symbols-outlined text-md">keyboard_arrow_down</span>
                                </button>
                            </div>

                            {/* Bouton Split Caméra */}
                            <div className="flex items-center bg-[#202124] hover:bg-[#2c2d30] border border-[#3c4043] rounded-lg transition-all text-slate-200">
                                <button 
                                    onClick={toggleCamera}
                                    className={`flex items-center gap-2 px-4 py-2 border-r border-[#3c4043] rounded-l-lg text-sm font-semibold transition-all ${
                                        isCamOff ? 'text-red-400 hover:text-red-300' : 'text-slate-200 hover:text-white'
                                    }`}
                                    title={isCamOff ? "Activer la caméra" : "Désactiver la caméra"}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {isCamOff ? 'videocam_off' : 'videocam'}
                                    </span>
                                    <span>Camera</span>
                                </button>
                                <button 
                                    className="px-2 py-2 hover:bg-[#35363a] rounded-r-lg transition-all flex items-center justify-center self-stretch"
                                    title="Paramètres vidéo"
                                >
                                    <span className="material-symbols-outlined text-md">keyboard_arrow_down</span>
                                </button>
                            </div>

                            {/* Bouton Partage d'Écran */}
                            <button 
                                onClick={toggleScreenShare}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                    isScreenSharing 
                                    ? 'bg-secondary text-white border-secondary hover:opacity-90' 
                                    : 'bg-[#202124] hover:bg-[#2c2d30] border-[#3c4043] text-slate-200 hover:text-white'
                                }`}
                                title={isScreenSharing ? "Arrêter le partage" : "Partager l'écran"}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {isScreenSharing ? 'cancel_presentation' : 'present_to_all'}
                                </span>
                                <span>Share screen</span>
                            </button>

                            {/* Bouton Raccrocher / Quitter */}
                            <button 
                                onClick={handleHangUp}
                                className="flex items-center gap-2 bg-[#202124] hover:bg-red-950/20 border border-red-500/50 hover:border-red-500 text-red-500 hover:text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                title="Quitter la diffusion"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span>Leave</span>
                            </button>
                        </div>

                        {/* Zone Droite : Pilule de participants style Google Meet */}
                        <div className="flex justify-end pr-2">
                            <button 
                                onClick={() => setShowParticipants(!showParticipants)}
                                className={`flex items-center gap-2.5 p-1 pr-3.5 rounded-full border transition-all ${
                                    showParticipants 
                                    ? 'border-cyan-400 bg-cyan-950/30 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]' 
                                    : 'border-[#3c4043] bg-[#202124] hover:bg-[#2c2d30] text-slate-200 hover:text-white'
                                }`}
                                title="Participants et Chat"
                            >
                                <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-[11px] font-black lowercase select-none">
                                    {user.prenom[0].toLowerCase()}
                                </div>
                                <span className="text-xs font-bold select-none">
                                    {remoteParticipants.length + 1}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Volet Latéral Interactif (Liste des Participants) */}
                {showParticipants && (
                    <div className="absolute right-0 top-0 h-full w-full md:w-80 border-l border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col justify-between animate-in slide-in-from-right duration-300 z-30 shadow-2xl">
                        
                        {/* Header du volet */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                Participants ({remoteParticipants.length + 1})
                            </h3>

                            <button 
                                onClick={() => setShowParticipants(false)}
                                className="text-slate-400 hover:text-slate-200 flex items-center justify-center p-1 rounded-full hover:bg-slate-800"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Corps du volet */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                            <div className="flex flex-col gap-3">
                                {/* Local Participant (You) */}
                                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-850/50 border border-slate-800/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-black">
                                            {user.prenom[0]}{user.nom[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{user.prenom} {user.nom}</span>
                                            <span className="text-[9px] font-medium text-primary">
                                                {isTeacher ? 'Animateur (Vous)' : 'Vous'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 text-slate-400">
                                        {isMuted ? (
                                            <span className="material-symbols-outlined text-red-500 text-sm">mic_off</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-green-500 text-sm">mic</span>
                                        )}
                                    </div>
                                </div>

                                {/* Remote Participants */}
                                {remoteParticipants.map(p => {
                                    let metadata = {};
                                    try {
                                        metadata = JSON.parse(p.metadata || '{}');
                                    } catch (e) {}

                                    const isRemoteTeacher = metadata.role === 'prof';
                                    const participantInitials = (p.name || 'Elève').split(' ').map(n => n[0]).join('').toUpperCase();

                                    return (
                                        <div key={p.sid} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-850/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold relative">
                                                    {participantInitials}
                                                    {p.isSpeaking && (
                                                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-secondary text-white border-2 border-slate-900 shadow-sm animate-pulse">
                                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{p.name || 'Participant'}</span>
                                                    <span className="text-[9px] font-medium text-slate-500 capitalize">
                                                        {isRemoteTeacher ? 'Enseignant' : 'Étudiant'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 text-slate-500 animate-fade-in">
                                                {p.isMicrophoneEnabled ? (
                                                    <span className="material-symbols-outlined text-slate-400 text-sm animate-pulse">mic</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-red-500/80 text-sm">mic_off</span>
                                                )}
                                                {p.isCameraEnabled ? (
                                                    <span className="material-symbols-outlined text-slate-400 text-sm">videocam</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-500 text-sm">videocam_off</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {remoteParticipants.length === 0 && (
                                    <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-3xl">group</span>
                                        <p className="text-[10px] font-bold uppercase tracking-wider">Aucun autre participant</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
