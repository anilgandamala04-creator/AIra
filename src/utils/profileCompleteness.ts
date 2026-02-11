import type { UserProfile } from '../types';

export interface ProfileCompletenessItem {
  key: string;
  label: string;
  done: boolean;
}

export interface ProfileCompleteness {
  percent: number;
  items: ProfileCompletenessItem[];
}

/**
 * Compute profile completion from avatar, display name, curriculum path, and timezone.
 * Optionally pass auth user for avatar (profile.avatar may be synced from auth).
 */
export function getProfileCompleteness(
  profile: UserProfile | null,
  avatarUrl?: string | null
): ProfileCompleteness {
  const items: ProfileCompletenessItem[] = [
    {
      key: 'avatar',
      label: 'Profile photo',
      done: !!(avatarUrl || profile?.avatar),
    },
    {
      key: 'displayName',
      label: 'Display name',
      done: !!(profile?.displayName?.trim() || profile?.name?.trim()),
    },
    {
      key: 'curriculum',
      label: 'Curriculum path',
      done: !!(
        profile?.curriculumType &&
        (profile.curriculumType === 'school'
          ? profile.board && profile.grade && profile.subject
          : profile.exam && profile.subject)
      ),
    },
    {
      key: 'timezone',
      label: 'Timezone',
      done: !!(profile?.timezone?.trim()),
    },
  ];

  if (!profile) {
    return { percent: 0, items };
  }

  const done = items.filter((i) => i.done).length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 0;

  return { percent, items };
}
