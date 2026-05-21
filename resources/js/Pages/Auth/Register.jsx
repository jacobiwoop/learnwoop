import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'etudiant',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />

            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-primary mb-3">Rejoignez-nous</h2>
                <p className="text-on-surface-variant font-medium">Créez votre compte en quelques secondes.</p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-5">
                {/* Type de compte */}
                <div className="flex flex-col gap-3">
                    <InputLabel value="Type de compte" className="font-bold text-primary" />
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setData('role', 'etudiant')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                data.role === 'etudiant'
                                ? 'border-secondary bg-secondary/5 shadow-md ring-2 ring-secondary/20'
                                : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-3xl ${data.role === 'etudiant' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                person
                            </span>
                            <span className={`text-xs font-bold ${data.role === 'etudiant' ? 'text-secondary' : 'text-on-surface-variant'}`}>Étudiant</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('role', 'prof')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                data.role === 'prof'
                                ? 'border-secondary bg-secondary/5 shadow-md ring-2 ring-secondary/20'
                                : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-3xl ${data.role === 'prof' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                school
                            </span>
                            <span className={`text-xs font-bold ${data.role === 'prof' ? 'text-secondary' : 'text-on-surface-variant'}`}>Encadreur</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="nom" value="Nom" className="mb-2 font-bold text-primary" />
                        <TextInput
                            id="nom"
                            name="nom"
                            value={data.nom}
                            className="block w-full px-4 py-3 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="family-name"
                            isFocused={true}
                            onChange={(e) => setData('nom', e.target.value)}
                            required
                        />
                        <InputError message={errors.nom} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="prenom" value="Prénom" className="mb-2 font-bold text-primary" />
                        <TextInput
                            id="prenom"
                            name="prenom"
                            value={data.prenom}
                            className="block w-full px-4 py-3 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="given-name"
                            onChange={(e) => setData('prenom', e.target.value)}
                            required
                        />
                        <InputError message={errors.prenom} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Adresse Email" className="mb-2 font-bold text-primary" />
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">mail</span>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-12 pr-4 py-3 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="exemple@email.com"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Mot de passe" className="mb-2 font-bold text-primary" />
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">lock</span>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-12 pr-4 py-3 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmer le mot de passe"
                        className="mb-2 font-bold text-primary"
                    />
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">lock_reset</span>
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-12 pr-4 py-3 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <PrimaryButton 
                        className="w-full justify-center bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]" 
                        disabled={processing}
                    >
                        Créer mon compte
                    </PrimaryButton>
                </div>

                <div className="text-center mt-2">
                    <p className="text-on-surface-variant font-medium">
                        Déjà inscrit ?{' '}
                        <Link href={route('login')} className="text-secondary font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
