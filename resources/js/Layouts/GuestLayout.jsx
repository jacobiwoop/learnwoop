import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex font-manrope">
            {/* Left side: branding/welcome (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
                
                <div className="relative z-10 max-w-lg text-white">
                    <Link href="/" className="inline-block mb-12">
                        <span className="text-4xl font-extrabold tracking-tight">LMS<span className="text-secondary-container">.</span></span>
                    </Link>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6">
                        L'excellence de l'apprentissage à portée de main.
                    </h1>
                    <p className="text-xl opacity-80 font-medium leading-relaxed">
                        Rejoignez notre communauté et accédez à des ressources pédagogiques de classe mondiale, des sessions en direct et un suivi personnalisé.
                    </p>
                </div>
            </div>

            {/* Right side: Form */}
            <div className="w-full lg:w-1/2 bg-background flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8 text-center">
                        <Link href="/">
                            <span className="text-3xl font-extrabold tracking-tight text-primary">LMS<span className="text-secondary">.</span></span>
                        </Link>
                    </div>
                    
                    <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-primary/5 border border-outline-variant/30">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
