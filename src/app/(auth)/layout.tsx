
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center space-x-2 text-foreground">
                <Image src="/Whitedge-Logo.png" alt="Whiteboard Consultants Logo" width={80} height={80} priority />
            </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
