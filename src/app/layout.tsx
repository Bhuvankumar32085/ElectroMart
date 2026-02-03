import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/component/Provider";
import ReduxProvider from "@/redux/ReduxProvider";
import HookHelper from "@/HookHelper";

export const metadata: Metadata = {
  title: "ElectroMart",
  description: "Best electronics store",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Provider>
            <HookHelper />
            {children}
          </Provider>
        </ReduxProvider>
      </body>
    </html>
  );
}
