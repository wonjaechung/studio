'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, FileText, BookOpen, Calculator } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/drills', label: 'Drills', icon: Brain },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/', label: 'Stats Lab', icon: Calculator },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              AP Learning Platform
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}