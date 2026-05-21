import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children, fullWidth = false, fullHeight = false }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-background text-on-surface font-sans">
            {/* TopNavBar */}
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-surface-container-lowest shadow-sm border-b border-outline-variant/30">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="font-manrope text-xl md:text-2xl font-bold text-primary">BeninEdu Learn</span>
                    </Link>
                </div>
                
                <div className="flex-1 max-w-xl mx-4 md:mx-12 hidden md:block">
                    <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
                        <input 
                            className="w-full bg-surface-container-low border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-secondary/20 text-sm" 
                            placeholder="Rechercher un cours, un sujet..." 
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    <div className="hidden sm:flex gap-2 md:gap-4">
                        <button className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>

                    <div className="relative">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all">
                                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-surface-container-high bg-gray-200">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={`${user.prenom} ${user.nom}`} />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-primary font-bold">
                                                {user.prenom[0]}{user.nom[0]}
                                            </div>
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                                        {user.prenom}
                                    </span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profil</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">Déconnexion</Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {/* SideNavBar (Desktop) */}
            <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 p-4 z-40 bg-surface-container-lowest border-r border-outline-variant/30 pt-20">
                <div className="mb-8 px-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                        </div>
                        <h2 className="font-manrope font-bold text-primary text-lg">Excellence Academy</h2>
                    </div>
                    <p className="text-xs text-on-surface-variant ml-11">Porto-Novo Campus</p>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <NavLink href={route('dashboard')} active={route().current('dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all">
                        <span className="material-symbols-outlined">home</span>
                        <span className="font-medium">Accueil</span>
                    </NavLink>
                    <NavLink href={route('diffusion')} active={route().current('diffusion')} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
                        <span className="material-symbols-outlined">videocam</span>
                        <span className="font-medium">Diffusion</span>
                    </NavLink>
                    <NavLink href={route('courses.index')} active={route().current('courses.index')} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
                        <span className="material-symbols-outlined">library_books</span>
                        <span className="font-medium">Mes Cours</span>
                    </NavLink>
                    <NavLink href="#" active={false} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container-high">
                        <span className="material-symbols-outlined">draw</span>
                        <span className="font-medium">Tableau Blanc</span>
                    </NavLink>
                </div>

                <div className="mt-auto border-t border-outline-variant/30 pt-4 flex flex-col gap-2">
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="text-on-surface-variant hover:bg-red-50 hover:text-red-600 rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Déconnexion</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className={`lg:ml-64 ${
                fullHeight 
                    ? 'pt-16 pb-20 lg:pb-0' 
                    : 'pt-20 pb-24 lg:pb-8'
            } ${fullWidth ? 'w-auto px-0' : 'px-4 md:px-8 max-w-7xl mx-auto'}`}>
                {header && (
                    <div className="mb-8">
                        {header}
                    </div>
                )}
                {children}
            </main>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-6 bg-surface-container-lowest border-t border-outline-variant/30 shadow-lg">
                <Link href={route('dashboard')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${route().current('dashboard') ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold">Accueil</span>
                </Link>
                <Link href={route('courses.index')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${route().current('courses.index') ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">book</span>
                    <span className="text-[10px] font-bold">Cours</span>
                </Link>
                <Link href={route('diffusion')} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${route().current('diffusion') ? 'bg-primary text-white' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">videocam</span>
                    <span className="text-[10px] font-bold">Diffusion</span>
                </Link>
                <Link href={route('profile.edit')} className="flex flex-col items-center justify-center p-2 text-on-surface-variant">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-bold">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
