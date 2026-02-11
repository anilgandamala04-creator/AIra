import { useEffect } from 'react';
import { findTopicInfo, formatTopicName } from '../utils/topicUtils';

const APP_NAME = 'AI Tutor';
const DEFAULT_DESC = 'Your intelligent learning companion. Curriculum-aligned lessons, AI chat, notes, flashcards, and mind maps.';

/**
 * Sets document title and Open Graph / Twitter meta tags for topic/lesson URLs
 * so shared links show a rich preview (image, title, description).
 */
export function useTopicMeta(topicId: string | undefined) {
  useEffect(() => {
    if (!topicId || typeof document === 'undefined') return;

    const { topic } = findTopicInfo(topicId);
    const title = topic?.name ?? formatTopicName(topicId);
    const description = topic?.description ?? DEFAULT_DESC;
    const url = window.location.origin + window.location.pathname;

    const prevTitle = document.title;
    document.title = `${title} | ${APP_NAME}`;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary', false);
    setMeta('twitter:title', title, false);
    setMeta('twitter:description', description, false);

    return () => {
      document.title = prevTitle;
    };
  }, [topicId]);
}
