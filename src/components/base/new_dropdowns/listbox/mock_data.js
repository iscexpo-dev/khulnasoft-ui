export const mockOptions = [
  {
    value: 'prod',
    text: 'Product',
  },
  {
    value: 'ppl',
    text: 'People',
  },
  {
    value: 'fin',
    text: 'Finance',
  },
  {
    value: 'leg',
    text: 'Legal',
    disabled: true,
  },
  {
    value: 'eng',
    text: 'Engineering',
    disabled: true,
  },
  {
    value: 'sales',
    text: 'Sales',
    disabled: false,
  },
  {
    value: 'marketing',
    text: 'Marketing',
  },
  {
    value: 'acc',
    text: 'Accounting',
    disabled: true,
  },
  {
    value: 'hr',
    text: 'Human Resource Management',
  },
  {
    value: 'rnd',
    text: 'Research and Development',
  },
  {
    value: 'cust',
    text: 'Customer Service',
  },
  {
    value: 'sup',
    text: 'Support',
  },
  {
    value: null,
    text: 'None',
    disabled: true,
  },
];

export const mockOptionsValues = mockOptions.map(({ value }) => value);

export const mockGroups = [
  {
    text: 'Branches',
    options: [
      { text: 'main', value: 'main' },
      { text: 'feature-123', value: 'feature-123' },
    ],
  },
  {
    text: 'Tags',
    options: [
      { text: 'v1.0', value: 'v1.0' },
      { text: 'v2.0', value: 'v2.0' },
      { text: 'v2.1', value: 'v2.1' },
    ],
  },
];

export const mockGroupOptionsValues = mockGroups
  .map((group) => group.options)
  .flat()
  .map(({ value }) => value);

export const mockGroupsWithTextSrOnly = [
  {
    text: 'Default',
    options: [
      {
        text: 'main',
        value: 'main',
      },
      {
        text: 'development',
        value: 'development',
      },
    ],
    textSrOnly: true,
  },
  {
    text: 'Feature branches',
    options: [
      {
        text: 'feature/add-avatar',
        value: 'add',
      },
      {
        text: 'feature/improve-panel',
        value: 'improve',
      },
    ],
  },
  {
    text: 'Bugfix branches',
    options: [
      {
        text: 'fix/border-of-avatar',
        value: 'fix-border',
      },
      {
        text: 'fix/radius-panel',
        value: 'fix-radius',
      },
    ],
  },
];

export const mockUsers = [
  {
    value: 'mikegreiling',
    text: 'Mike Greiling',
    secondaryText: '@mikegreiling',
    icon: 'foo',
  },
  {
    value: 'ohoral',
    text: 'Olena Horal-Koretska',
    secondaryText: '@ohoral',
    icon: 'bar',
  },
  {
    value: 'jdoe',
    text: 'Jane Doe',
    secondaryText: '@jdoe',
    disabled: true,
  },
  {
    value: 'markian',
    text: 'Mark Florian',
    secondaryText: '@markian',
    icon: 'bin',
  },
];
