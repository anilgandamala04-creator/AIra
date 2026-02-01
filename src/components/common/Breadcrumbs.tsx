import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Accessible breadcrumb navigation component
 */
export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-sm ${className}`}
        >
            <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
                {/* Home link */}
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <Link
                        to="/dashboard"
                        className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                        itemProp="item"
                        aria-label="Home"
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                    <meta itemProp="position" content="1" />
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const position = index + 2;

                    return (
                        <li
                            key={index}
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                            className="flex items-center gap-2"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" aria-hidden="true" />
                            {isLast || !item.path ? (
                                <span
                                    className={isLast ? 'text-gray-800 dark:text-slate-100 font-medium' : 'text-gray-500 dark:text-slate-400'}
                                    itemProp="name"
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                                    itemProp="item"
                                >
                                    <span itemProp="name">{item.label}</span>
                                </Link>
                            )}
                            <meta itemProp="position" content={position.toString()} />
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
