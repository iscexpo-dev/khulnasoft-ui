export const mockItems = [
  {
    text: 'Mark as draft',
    href: 'https://khulnasoft.com',
    extraAttrs: {
      target: '_blank',
      rel: 'nofollow',
      'data-method': 'put',
    },
  },
  {
    text: 'Create new',
    href: 'https://github.com/khulnasoft/khulnasoft/-/merge_requests/new',
    extraAttrs: {
      rel: 'nofollow',
      target: '_blank',
    },
  },
  {
    text: 'Edit merge request',
    to: '/edit',
    extraAttrs: {
      'data-uuid': '1234',
    },
  },
  {
    text: 'Lock discussion',
    to: { path: '/lock', query: { show: 1234 } },
  },
  {
    text: 'Close merge request',
    variant: 'danger',
    action: () => {
      // eslint-disable-next-line no-console
      console.log('CLOSED');
    },
    extraAttrs: {
      rel: 'nofollow',
      'data-method': 'put',
    },
  },
];

export const mockButtons = [
  {
    text: 'Checks',
  },
  {
    text: 'Projects',
  },
  {
    text: 'Standards',
  },
];

export const mockItemsCustomItem = [
  {
    text: 'Assigned to you',
    href: 'https://khulnasoft.com/dashboard/merge_requests?assignee_username=root',
    count: '2',
    extraAttrs: {
      target: '_blank',
      rel: 'nofollow',
    },
  },
  {
    text: 'Review requests from you',
    href: 'https://khulnasoft.com/dashboard/merge_requests?reviewer_username=root',
    count: 0,
    extraAttrs: {
      target: '_blank',
      rel: 'nofollow',
    },
  },
  {
    text: 'I am only visible on mobile!',
    action: () => {
      // eslint-disable-next-line no-console
      console.log('clicked!');
    },
    wrapperClass: 'sm:!gl-hidden',
  },
];

export const mockGroupsCustomItem = [
  {
    name: 'Merge requests',
    items: [
      {
        text: 'Assigned to you',
        href: 'https://khulnasoft.com/dashboard/merge_requests?assignee_username=root',
        count: 1,
      },
      {
        text: 'Review requests from you',
        href: 'https://khulnasoft.com/dashboard/merge_requests?reviewer_username=root',
        count: 4,
      },
    ],
  },
];

export const mockGroups = [
  {
    name: 'This project',
    items: [
      {
        text: 'New issue',
        href: 'https://github.com/khulnasoft/khulnasoft/-/work_items/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'New merge request',
        href: 'https://github.com/khulnasoft/khulnasoft/-/merge_requests/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'New snippet',
        href: 'https://github.com/khulnasoft/khulnasoft/-/snippets/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
    ],
  },
  {
    name: 'KhulnaSoft',
    items: [
      {
        text: 'New project',
        href: 'https://khulnasoft.com/projects/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'New group',
        href: 'https://khulnasoft.com/groups/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'New snippet',
        href: 'https://khulnasoft.com/snippets/new',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
    ],
  },
];

export const mockProfileGroups = [
  {
    items: [
      {
        text: 'Set status',
        href: 'https://khulnasoft.com',
        icon: 'status_success',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'Edit profile',
        href: '#',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
      {
        text: 'Preferences',
        href: '#',
        extraAttrs: {
          target: '_blank',
          rel: 'nofollow',
        },
      },
    ],
  },
  {
    items: [
      {
        text: 'Sign out',
        action: () => {
          // eslint-disable-next-line no-alert
          window.confirm('Are you sure?');
        },
      },
    ],
  },
];
