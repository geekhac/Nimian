'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FilterLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

export default function FilterLink({ 
  href, 
  children, 
  className,
  prefetch = false 
}: FilterLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}