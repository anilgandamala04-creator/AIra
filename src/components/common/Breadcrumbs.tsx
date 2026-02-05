import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { staggerContainer, staggerItemFast } from '../../utils/animations';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * Accessible breadcrumb navigation component with smooth list animation
 */
export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-sm min-w-0 overflow-hidden ${className}`}
        >
            <motion.ol
                className="flex flex-wrap items-center gap-2 min-w-0"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const position = index + 1;

                    return (
                        <motion.li
                            key={index}
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                            className="flex items-center gap-2"
                            variants={staggerItemFast}
                        >
                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" aria-hidden="true" />
                            {isLast || !item.path ? (
                                <span
                                    className={`${isLast ? 'text-gray-800 dark:text-slate-100 font-medium' : 'text-gray-500 dark:text-slate-400'} truncate max-w-[140px] sm:max-w-[200px] md:max-w-none`}
                                    itemProp="name"
                                    aria-current={isLast ? 'page' : undefined}
                                    title={item.label}
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="text-gray-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors duration-200 truncate max-w-[140px] sm:max-w-[200px] md:max-w-none"
                                    itemProp="item"
                                    title={item.label}
                                >
                                    <span itemProp="name" className="truncate block">{item.label}</span>
                                </Link>
                            )}
                            <meta itemProp="position" content={position.toString()} />
                        </motion.li>
                    );
                })}
            </motion.ol>
        </nav>
    );
}
