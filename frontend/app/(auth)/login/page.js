import LoginForm from "@/components/auth/LoginForm/LoginForm";

export default function LoginPage() {

    return (
        <main className="
            flex min-h-screen
            items-center justify-center
            bg-white px-6
            text-gray-900
            dark:bg-gray-950
            dark:text-white
        ">

            <div className="w-full max-w-md">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Login to your CreatorLink account.
                    </p>
                </div>

                <LoginForm />

            </div>

        </main>
    );
}