import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121134-113210',
  {
    variant: { 'Visible levels': '1' },
    props: {
      level1: figma.nestedProps('Level one', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
    },
    example: ({ level1 }) => html`
      <gl-breadcrumb
        :items="[
          { text: '${level1.text}', href: '/'${level1.avatar} },
        ]"
      />
    `,
    imports: ["import { GlBreadcrumb } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121134-113210',
  {
    variant: { 'Visible levels': '2' },
    props: {
      level1: figma.nestedProps('Level one', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level2: figma.nestedProps('Level two', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
    },
    example: ({ level1, level2 }) => html`
      <gl-breadcrumb
        :items="[
          { text: '${level1.text}', href: '/'${level1.avatar} },
          { text: '${level2.text}', href: '/level-2'${level2.avatar} },
        ]"
      />
    `,
    imports: ["import { GlBreadcrumb } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121134-113210',
  {
    variant: { 'Visible levels': '3' },
    props: {
      level1: figma.nestedProps('Level one', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level2: figma.nestedProps('Level two', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level3: figma.nestedProps('Level three', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
    },
    example: ({ level1, level2, level3 }) => html`
      <gl-breadcrumb
        :items="[
          { text: '${level1.text}', href: '/'${level1.avatar} },
          { text: '${level2.text}', href: '/level-2'${level2.avatar} },
          { text: '${level3.text}', href: '/level-2/level-3'${level3.avatar} },
        ]"
      />
    `,
    imports: ["import { GlBreadcrumb } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121134-113210',
  {
    variant: { 'Visible levels': '4' },
    props: {
      level1: figma.nestedProps('Level one', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level2: figma.nestedProps('Level two', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level3: figma.nestedProps('Level three', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level4: figma.nestedProps('Level four', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
    },
    example: ({ level1, level2, level3, level4 }) => html`
      <gl-breadcrumb
        :items="[
          { text: '${level1.text}', href: '/'${level1.avatar} },
          { text: '${level2.text}', href: '/level-2'${level2.avatar} },
          { text: '${level3.text}', href: '/level-2/level-3'${level3.avatar} },
          { text: '${level4.text}', href: '/level-2/level-3/level-4'${level4.avatar} },
        ]"
      />
    `,
    imports: ["import { GlBreadcrumb } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121134-113210',
  {
    variant: { 'Visible levels': '5' },
    props: {
      level1: figma.nestedProps('Level one', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level2: figma.nestedProps('Level two', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level3: figma.nestedProps('Level three', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level4: figma.nestedProps('Level four', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
      level5: figma.nestedProps('Level five', {
        text: figma.string('Title'),
        avatar: figma.enum('Has avatar', {
          true: ", avatarPath: 'https://example.com/avatar.png'",
          false: '',
        }),
      }),
    },
    example: ({ level1, level2, level3, level4, level5 }) => html`
      <gl-breadcrumb
        :items="[
          { text: '${level1.text}', href: '/'${level1.avatar} },
          { text: '${level2.text}', href: '/level-2'${level2.avatar} },
          { text: '${level3.text}', href: '/level-2/level-3'${level3.avatar} },
          { text: '${level4.text}', href: '/level-2/level-3/level-4'${level4.avatar} },
          { text: '${level5.text}', href: '/level-2/level-3/level-4/level-5'${level5.avatar} },
        ]"
      />
    `,
    imports: ["import { GlBreadcrumb } from '@khulnasoft/ui'"],
  },
);
