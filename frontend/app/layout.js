import "./globals.css";

import ReduxProvider from "@/components/common/ReduxProvider/ReduxProvider";
import ThemeProvider from "@/components/theme/ThemeProvider/ThemeProvider";


export const metadata = {
    title: "CreatorLink",
    description: "Creator and brand collaboration platform"
};


export default function RootLayout({ children }) {

    return (
        <html lang="en" suppressHydrationWarning>

            <body>

                <ReduxProvider>

                    <ThemeProvider>
                        {children}
                    </ThemeProvider>

                </ReduxProvider>

            </body>

        </html>
    );
}