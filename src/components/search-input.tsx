
"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchInput() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/courses?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    }

    return (
        <form onSubmit={handleSearch}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-foreground/70" />
                <Input 
                    id="course-search"
                    name="search"
                    placeholder="Search for courses..."
                    className="pl-10 w-full max-w-xs md:w-80 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/70 border-primary-foreground/20 focus:bg-primary-foreground/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </form>
    )
}
