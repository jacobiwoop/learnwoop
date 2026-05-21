import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-extrabold text-primary mb-3">Ravi de vous revoir !</h2>
                <p className="text-on-surface-variant font-medium">Entrez vos identifiants pour accéder à votre espace.</p>
            </div>

            {status && (
                <div className="mb-6 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-2xl text-sm font-bold">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-6">
                <div>
                    <InputLabel htmlFor="email" value="Adresse Email" className="mb-2 font-bold text-primary" />
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">mail</span>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="exemple@email.com"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <InputLabel htmlFor="password" value="Mot de passe" className="font-bold text-primary" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-bold text-secondary hover:underline"
                            >
                                Oublié ?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">lock</span>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-outline-variant/30 rounded-2xl focus:border-secondary focus:ring-secondary/20 transition-all font-medium"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        className="rounded-md border-outline-variant text-secondary focus:ring-secondary/20"
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                    />
                    <span className="ms-3 text-sm font-bold text-on-surface-variant">
                        Se souvenir de moi
                    </span>
                </div>

                <div className="mt-2">
                    <PrimaryButton 
                        className="w-full justify-center bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl shadow-lg shadow-secondary/20 transition-all active:scale-[0.98]" 
                        disabled={processing}
                    >
                        Se connecter
                    </PrimaryButton>
                </div>

                <div className="text-center mt-4">
                    <p className="text-on-surface-variant font-medium">
                        Pas encore de compte ?{' '}
                        <Link href={route('register')} className="text-secondary font-bold hover:underline">
                            S'inscrire gratuitement
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
