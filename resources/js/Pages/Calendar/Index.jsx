import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

function localToUtc(value) {
  const date = new Date(value);
  return date.toISOString();
}

export default function Calendar({ courses = [], programme_du_jour = [], today }) {
    const { auth } = usePage().props;
    const isTeacher = auth.user.role === 'prof';
    
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Picker States
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [pickerView, setPickerView] = useState('months');
    const [viewedYear, setViewedYear] = useState(currentDate.getFullYear());
    
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

    const CALENDAR_START_HOUR = 7;
    const CALENDAR_END_HOUR = 20;
    const HOUR_HEIGHT = 80;

    const parseTime = (timeStr) => {
        const [h, m] = (timeStr || '00:00').split(':').map(Number);
        return { hours: h, minutes: m };
    };

    const getEventStyle = (startHour, startMinutes, durationMinutes) => {
        const clampedStart = Math.max(startHour + startMinutes / 60, CALENDAR_START_HOUR);
        const top = (clampedStart - CALENDAR_START_HOUR) * HOUR_HEIGHT;
        const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 24);
        return { top: `${top}px`, height: `${height}px` };
    };

    const buildCalendarEvents = () => {
        const events = [];

        courses.forEach(course => {
            const courseData = typeof course === 'object' ? course : JSON.parse(course);
            const courseId = courseData.id || (typeof course === 'object' ? course.id : null);
            
            if (courseData.type_planification === 'flexible') {
                (courseData.sessions || []).forEach(session => {
                    if (!session.date_heure) return;
                    const sessionDate = new Date(session.date_heure);
                    const dayIndex = weekDays.findIndex(
                        d => d.toDateString() === sessionDate.toDateString()
                    );
                    if (dayIndex === -1) return;

                    const startHour = sessionDate.getHours();
                    const startMinutes = sessionDate.getMinutes();
                    const duration = session.duree_minutes || 60;

                    events.push({
                        key: `session-${session.id}`,
                        dayIndex,
                        startHour,
                        startMinutes,
                        duration,
                        titre: session.titre || 'Session',
                        course_titre: courseData.titre,
                        course_id: courseId,
                        type: session.type,
                        statut: session.statut,
                        lien: session.lien_live || session.lien_video || null,
                        session: session,
                    });
                });
            } else {
                (courseData.horaires || []).forEach(horaire => {
                    let dayIndex;
                    if (horaire.jour_semaine === 0) {
                        dayIndex = 6;
                    } else {
                        dayIndex = horaire.jour_semaine - 1;
                    }

                    const { hours: startH, minutes: startM } = parseTime(horaire.heure_debut);
                    const { hours: endH, minutes: endM } = parseTime(horaire.heure_fin);
                    const duration = (endH * 60 + endM) - (startH * 60 + startM);

                    events.push({
                        key: `horaire-${horaire.id}`,
                        dayIndex,
                        startHour: startH,
                        startMinutes: startM,
                        duration: Math.max(duration, 15),
                        titre: courseData.titre,
                        course_titre: courseData.titre,
                        course_id: courseId,
                        type: 'regulier',
                        statut: null,
                        lien: null,
                    });
                });
            }
        });

        return events;
    };

    const calendarEvents = buildCalendarEvents();

    const getEventColor = (type, statut) => {
        if (type === 'live') {
            return {
                bg: 'bg-secondary/10 border-secondary hover:shadow-secondary/20',
                border: 'border-l-4 border-secondary',
                text: 'text-secondary',
                badge: 'bg-secondary text-white',
                label: 'LIVE',
            };
        }
        if (type === 'rediffusion') {
            return {
                bg: 'bg-indigo-50 border-indigo-300 hover:shadow-indigo-100',
                border: 'border-l-4 border-indigo-400',
                text: 'text-indigo-700',
                badge: 'bg-indigo-500 text-white',
                label: 'REPLAY',
            };
        }
        return {
            bg: 'bg-primary/10 border-primary hover:shadow-primary/10',
            border: 'border-l-4 border-primary',
            text: 'text-primary',
            badge: null,
            label: null,
        };
    };

    const calendarHours = Array.from(
        { length: CALENDAR_END_HOUR - CALENDAR_START_HOUR },
        (_, i) => CALENDAR_START_HOUR + i
    );

    return (
        <AuthenticatedLayout>
            <Head title="Calendrier Général" />

            <section className="mb-8">
                <h2 className="font-manrope text-2xl md:text-3xl font-bold text-primary mb-2">
                    Calendrier Général
                </h2>
                <p className="text-lg text-on-surface-variant font-medium">
                    Vos cours et sessions pour cette semaine
                </p>
            </section>

            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/30">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
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
                                <span className="text-sm font-bold text-primary capitalize group-hover:text-secondary">
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
                        <div className="bg-secondary/10 text-secondary px-4 py-2 rounded-xl text-xs font-black border border-secondary/20 shadow-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">date_range</span>
                            {weekDays[0].getDate()} — {weekDays[6].getDate()}
                        </div>
                    </div>
                </div>

                <div className="border border-outline-variant/30 rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
                    <div className="min-w-[800px]">
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
                                            top: evtStyle.top,
                                            left: `calc(80px + ${evt.dayIndex} * (100% - 80px) / 7)`,
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
                                                </div>
                                            </div>
                                            <h4 className={`text-xs font-bold leading-tight line-clamp-2 group-hover:opacity-80 ${colors.text}`}>
                                                {evt.titre}
                                            </h4>
                                            <span className={`text-[8px] font-medium mt-1 ${colors.text}`}>
                                                {evt.course_titre}
                                            </span>
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

                            {calendarEvents.length === 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
                                    <span className="material-symbols-outlined text-4xl text-outline-variant">event_busy</span>
                                    <p className="text-sm font-bold text-on-surface-variant">Aucune session cette semaine</p>
                                    <p className="text-xs text-on-surface-variant/70">
                                        Naviguez dans le calendrier pour voir vos cours.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 border border-outline-variant/30 mt-8">
                <span className="material-symbols-outlined text-secondary">info</span>
                <p className="text-xs font-medium text-on-surface-variant">
                    Les horaires sont affichés selon votre fuseau horaire local.
                </p>
            </div>

            {isPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
                        onClick={() => setIsPickerOpen(false)}
                    ></div>
                    
                    <div className="relative bg-surface-container-lowest w-full max-w-sm rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in duration-200">
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
        </AuthenticatedLayout>
    );
}
