import { IconName, ThemeColor } from './types';

export interface DockTemplate {
    name: string;
    icon: IconName;
    color: ThemeColor;
}

export interface RealmTemplate {
    id: string;
    name: string;
    icon: IconName;
    color: ThemeColor;
    description: string;
    docks: DockTemplate[];
}

export const REALM_TEMPLATES: RealmTemplate[] = [
    {
        id: 'developer',
        name: 'Developer',
        icon: 'code',
        color: 'purple',
        description: 'For coding and development work',
        docks: [
            { name: 'GitHub', icon: 'github', color: 'gray' },
            { name: 'Documentation', icon: 'book-open', color: 'blue' },
            { name: 'Stack Overflow', icon: 'layers', color: 'orange' },
        ]
    },
    {
        id: 'work',
        name: 'Work',
        icon: 'briefcase',
        color: 'blue',
        description: 'Professional and productivity',
        docks: [
            { name: 'Email', icon: 'mail', color: 'red' },
            { name: 'Calendar', icon: 'calendar', color: 'green' },
            { name: 'Documents', icon: 'folder', color: 'yellow' },
        ]
    },
    {
        id: 'social',
        name: 'Social',
        icon: 'message-circle',
        color: 'pink',
        description: 'Social media and messaging',
        docks: [
            { name: 'Twitter', icon: 'twitter', color: 'cyan' },
            { name: 'Messages', icon: 'message-circle', color: 'green' },
            { name: 'Reddit', icon: 'hash', color: 'orange' },
        ]
    },
    {
        id: 'entertainment',
        name: 'Entertainment',
        icon: 'film',
        color: 'red',
        description: 'Videos, music, and fun',
        docks: [
            { name: 'YouTube', icon: 'youtube', color: 'red' },
            { name: 'Music', icon: 'music', color: 'green' },
            { name: 'Streaming', icon: 'film', color: 'purple' },
        ]
    },
    {
        id: 'gaming',
        name: 'Gaming',
        icon: 'gamepad-2',
        color: 'green',
        description: 'Games and gaming communities',
        docks: [
            { name: 'Twitch', icon: 'twitch', color: 'purple' },
            { name: 'Discord', icon: 'message-circle', color: 'blue' },
            { name: 'Game Wikis', icon: 'book-open', color: 'yellow' },
        ]
    },
    {
        id: 'research',
        name: 'Research',
        icon: 'compass',
        color: 'teal',
        description: 'Learning and research',
        docks: [
            { name: 'Articles', icon: 'book-open', color: 'blue' },
            { name: 'References', icon: 'database', color: 'gray' },
            { name: 'Notes', icon: 'folder', color: 'yellow' },
        ]
    },
];
