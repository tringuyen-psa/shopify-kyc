'use client';

import Button from '@/components/ui/Button';
import { useConnectJSContext } from '@/app/hooks/EmbeddedComponentProvider';
import Link from 'next/link';

export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const connectJSContext = useConnectJSContext();

    return (
        <>
            <header className="flex flex-col justify-between md:flex-row">
                <div className="flex flex-row">
                    <h1 className="text-3xl font-bold">Your account</h1>
                </div>
                <div className="mt-4 flex flex-row items-center gap-2 md:mt-0">
                    <nav className="flex gap-4">
                        <Link
                            href="/account"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            General
                        </Link>
                        <Link
                            href="/account/documents"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Documents
                        </Link>
                        <Link
                            href="/account/tax"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Tax
                        </Link>
                    </nav>
                    <div>
                        <Button
                            className="text-md p-2 hover:bg-white/80 hover:text-primary"
                            variant="ghost"
                            onClick={async () => {
                                await connectJSContext.connectInstance?.logout();
                                // signOut({ callbackUrl: '/' });
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </header>
            {children}
        </>
    );
}
