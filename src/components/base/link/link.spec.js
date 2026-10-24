import { mount } from "@vue/test-utils";
import { createTestRouter } from "~helpers/router";
import {
  linkVariantInline,
  linkVariantMeta,
  linkVariantMention,
  linkVariantMentionCurrent,
  linkVariantUnstyled,
} from "../../../utils/constants";
import { isGlobalVue3 } from "../../../utils/vue_utils";
import Link from "./link.vue";

const routerLinkStubProps = {
  to: {
    type: [String, Object],
    required: true,
  },
  replace: Boolean,
  activeClass: String,
  exactActiveClass: String,
  prefetch: Boolean,
};

const navigate = jest.fn();

// Adapted from https://github.com/vuejs/vue-test-utils/blob/dev/packages/test-utils/src/components/RouterLinkStub.js
const RouterLinkStubVue2 = {
  name: "RouterLinkStub",
  props: routerLinkStubProps,
  render: function render(h) {
    return h("a", undefined, this.$scopedSlots.default());
  },
};

// Adapted from https://github.com/vuejs/test-utils/blob/main/src/components/RouterLinkStub.ts
const RouterLinkStubVue3 = {
  name: "RouterLinkStub",
  props: {
    ...routerLinkStubProps,
    custom: Boolean,
  },
  render: function render(h) {
    const children = this.$scopedSlots?.default?.({
      href: this.to,
      isActive: true,
      isExactActive: true,
      navigate,
    });

    return this.custom ? children : h("a", undefined, children);
  },
};

const RouterLinkStub = isGlobalVue3 ? RouterLinkStubVue3 : RouterLinkStubVue2;

describe("link component", () => {
  let wrapper;

  const createWrapper = (options) => {
    wrapper = mount(Link, options);
  };

  const clickLink = (event) => wrapper.find("a").trigger("click", event);

  describe("default settings", () => {
    beforeEach(() => {
      createWrapper();
    });

    it("should not have a target attribute", () => {
      expect(wrapper.attributes("target")).toBeUndefined();
    });

    it("should not have a rel attribute", () => {
      expect(wrapper.attributes("rel")).toBeUndefined();
    });

    it("should have a default href as #", () => {
      expect(wrapper.attributes("href")).toBe("#");
    });
  });

  it("passes HTML attributes to anchor tag", () => {
    createWrapper({ attrs: { "aria-current": "true" } });

    expect(wrapper.attributes("aria-current")).toBe("true");
  });

  it.each`
    variant                      | expectedClass
    ${linkVariantInline}         | ${["gl-link", "gl-link-inline"]}
    ${undefined}                 | ${["gl-link"]}
    ${linkVariantMeta}           | ${["gl-link", "gl-link-meta"]}
    ${linkVariantMention}        | ${["gl-link", "gl-link-mention"]}
    ${linkVariantMentionCurrent} | ${["gl-link", "gl-link-mention-current"]}
    ${linkVariantUnstyled}       | ${[]}
  `(
    "adds $expectedClass class when variant=$variant",
    ({ variant, expectedClass }) => {
      createWrapper({
        propsData: {
          variant,
          expectedClass,
        },
      });

      expect(wrapper.classes()).toStrictEqual(expectedClass);
    }
  );

  it.each`
    variant                      | shouldShowIcon | description
    ${linkVariantInline}         | ${true}        | ${"shows"}
    ${linkVariantMeta}           | ${true}        | ${"shows"}
    ${null}                      | ${true}        | ${"shows"}
    ${linkVariantMention}        | ${false}       | ${"does not show"}
    ${linkVariantMentionCurrent} | ${false}       | ${"does not show"}
    ${linkVariantUnstyled}       | ${false}       | ${"does not show"}
  `(
    "$description external icon for $variant variant when showExternalIcon=true",
    ({ variant, shouldShowIcon }) => {
      createWrapper({
        propsData: {
          variant,
          href: "https://example.com",
          showExternalIcon: true,
          target: "_blank",
        },
      });

      if (shouldShowIcon) {
        expect(wrapper.classes()).toContain("gl-link-external");
        expect(wrapper.attributes("data-alt")).toBe("(external link)");
      } else {
        expect(wrapper.classes()).not.toContain("gl-link-external");
        expect(wrapper.attributes("data-alt")).toBeUndefined();
      }
    }
  );

  it.each`
    description           | propsData
    ${"an internal href"} | ${{ href: "/foo", showExternalIcon: true }}
    ${"no external icon"} | ${{ href: "https://example.com", target: "_blank" }}
  `("does not set data-alt for a link with $description", ({ propsData }) => {
    createWrapper({ propsData });

    expect(wrapper.classes()).not.toContain("gl-link-external");
    expect(wrapper.attributes("data-alt")).toBeUndefined();
  });

  describe("target blank", () => {
    it("should set secure rels for hrefs in a different domain", () => {
      createWrapper({
        propsData: {
          target: "_blank",
          href: "http://example.com",
        },
      });

      expect(wrapper.attributes("rel")).toBe("noopener noreferrer");
    });

    it("should set noopener noreferrer rel for hrefs for the same domain", () => {
      createWrapper({
        propsData: {
          target: "_blank",
          href: window.location.hostname,
        },
      });
      expect(wrapper.attributes("rel")).toBe("noopener noreferrer");
    });

    it("should keep rel attribute for hrefs in the same domain", () => {
      createWrapper({
        attrs: { rel: "nofollow", href: window.location.hostname },
      });

      expect(wrapper.attributes("rel")).toBe("nofollow");
    });
  });

  describe("unsafe urls", () => {
    // eslint-disable-next-line no-script-url
    const unsafeUrl = "javascript:alert(1)";

    // GlSafeLinkDirective is actually responsible to handle the unsafe URLs
    // and GlLink uses this directive to make all the links secure by default
    it("should set href to blank", () => {
      createWrapper({
        propsData: {
          href: unsafeUrl,
        },
      });

      expect(wrapper.attributes("href")).toBe("about:blank");
    });

    it("should allow unsafe URL if isUnsafeLink is true", () => {
      createWrapper({
        propsData: {
          href: unsafeUrl,
          isUnsafeLink: true,
        },
      });

      expect(wrapper.attributes("href")).toBe(unsafeUrl);
    });
  });

  it("has expected default structure", () => {
    createWrapper();

    expect(wrapper.element.tagName).toBe("A");
    expect(wrapper.attributes("href")).toBe("#");
    expect(wrapper.attributes("rel")).toBeUndefined();
    expect(wrapper.attributes("aria-disabled")).toBeUndefined();
    expect(wrapper.attributes("disabled")).toBeUndefined();
    expect(wrapper.text()).toBe("");
  });

  it("renders content from default slot", () => {
    createWrapper({
      slots: {
        default: "foobar",
      },
    });

    expect(wrapper.text()).toBe("foobar");
  });

  it("sets attribute href to user supplied value", () => {
    createWrapper({
      propsData: {
        href: "/foobar",
      },
    });

    expect(wrapper.attributes("href")).toBe("/foobar");
  });

  it("sets attribute href when user supplied href is hash target", () => {
    createWrapper({
      propsData: {
        href: "#foobar",
      },
    });

    expect(wrapper.attributes("href")).toBe("#foobar");
  });

  it("should set href to string `to` prop", () => {
    createWrapper({
      propsData: {
        to: "/foobar",
      },
    });

    expect(wrapper.attributes("href")).toBe("/foobar");
  });

  it("should set href to path from `to` prop", () => {
    createWrapper({
      propsData: {
        to: { path: "/foobar" },
      },
    });

    expect(wrapper.attributes("href")).toBe("/foobar");
  });

  it("should set href to path + query + hash from `to` prop", () => {
    createWrapper({
      propsData: {
        to: {
          path: "/foobar",
          query: { page: 2, search: "hello world" },
          hash: "section",
        },
      },
    });

    expect(wrapper.attributes("href")).toBe(
      "/foobar?page=2&search=hello%20world#section"
    );
  });

  it("should set href to query string only from `to` prop", () => {
    createWrapper({
      propsData: {
        to: { query: { foo: "bar" } },
      },
    });

    expect(wrapper.attributes("href")).toBe("?foo=bar");
  });

  it('should default rel to `noopener noreferrer` when target==="_blank"', () => {
    createWrapper({
      propsData: {
        href: "/foobar",
        target: "_blank",
      },
    });

    expect(wrapper.attributes("rel")).toBe("noopener noreferrer");
  });

  it('should merge rel with noopener noreferrer when target==="_blank"', () => {
    createWrapper({
      propsData: {
        href: "/foobar",
        target: "_blank",
        rel: "alternate",
      },
    });

    expect(wrapper.attributes("rel")).toBe("alternate noopener noreferrer");
  });

  it('should add "active" class when prop active=true', async () => {
    createWrapper({
      propsData: {
        active: true,
      },
    });

    expect(wrapper.classes()).toContain("active");
  });

  describe("when disabled", () => {
    beforeEach(() => {
      createWrapper({
        propsData: {
          disabled: true,
        },
      });
    });

    it('adds aria-disabled="true"', () => {
      expect(wrapper.attributes("aria-disabled")).toBe("true");
    });

    it("adds disabled class", () => {
      expect(wrapper.classes()).toContain("disabled");
    });

    it('adds tabindex="-1"', () => {
      expect(wrapper.attributes("tabindex")).toBe("-1");
    });

    it("adds the disabled attribute", () => {
      expect(wrapper.attributes("disabled")).toBeDefined();
    });
  });

  describe("when `$router` throws", () => {
    // Vue 2 VueRouter installed after the vnode is created leaves a `$router`
    // getter that throws, see https://github.com/khulnasoft/khulnasoft/issues/634928
    const beforeCreate = function beforeCreate() {
      Object.defineProperty(this, "$router", {
        get() {
          throw new TypeError("this._routerRoot is undefined");
        },
      });
    };

    it.each`
      description        | propsData
      ${"with `href`"}   | ${{ href: "/foo" }}
      ${"when disabled"} | ${{ to: "/foo", disabled: true }}
    `("renders an anchor $description", ({ propsData }) => {
      createWrapper({ propsData, beforeCreate });

      expect(wrapper.element.tagName).toBe("A");
      expect(wrapper).not.toHaveLoggedVueErrors();
    });
  });

  it("focus and blur methods work", () => {
    createWrapper({
      attachTo: document.body,
      propsData: {
        href: "#foobar",
      },
    });

    expect(document.activeElement).not.toBe(wrapper.element);
    wrapper.vm.focus();
    expect(document.activeElement).toBe(wrapper.element);
    wrapper.vm.blur();
    expect(document.activeElement).not.toBe(wrapper.element);
  });

  describe("click handling", () => {
    it("should invoke click handler bound by Vue when clicked on", async () => {
      const clickHandlerMock = jest.fn();

      createWrapper({
        listeners: {
          click: clickHandlerMock,
        },
      });
      expect(clickHandlerMock).not.toHaveBeenCalled();
      await clickLink();
      expect(clickHandlerMock).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it("should invoke multiple click handlers bound by Vue when clicked on", async () => {
      const clickHandlerMock1 = jest.fn();
      const clickHandlerMock2 = jest.fn();

      createWrapper({
        listeners: {
          click: [clickHandlerMock1, clickHandlerMock2],
        },
      });

      expect(clickHandlerMock1).not.toHaveBeenCalled();
      expect(clickHandlerMock2).not.toHaveBeenCalled();
      await clickLink();
      expect(clickHandlerMock1).toHaveBeenCalled();
      expect(clickHandlerMock2).toHaveBeenCalled();
    });

    it("should NOT invoke click handler bound by Vue when disabled and clicked", async () => {
      const clickHandlerMock = jest.fn();

      createWrapper({
        propsData: {
          disabled: true,
        },
        listeners: {
          click: clickHandlerMock,
        },
      });

      expect(clickHandlerMock).not.toHaveBeenCalled();
      await clickLink();
      expect(clickHandlerMock).not.toHaveBeenCalled();
    });

    it('should emit "clicked::link" on $root when clicked on', async () => {
      const clickHandlerMock = jest.fn();
      const App = {
        render(h) {
          return h("div", [h(Link, { props: { href: "/foo" } }, "link")]);
        },
      };

      wrapper = mount(App);
      wrapper.vm.$root.$on("clicked::link", clickHandlerMock);
      await clickLink();
      expect(clickHandlerMock).toHaveBeenCalled();
    });

    it('should not emit "clicked::link" on $root when clicked on when disabled', async () => {
      const clickHandlerMock = jest.fn();
      const App = {
        render(h) {
          return h("div", [
            h(Link, { props: { href: "/foo", disabled: true } }, "link"),
          ]);
        },
      };

      wrapper = mount(App);
      wrapper.vm.$root.$on("clicked::link", clickHandlerMock);
      await clickLink();
      expect(clickHandlerMock).not.toHaveBeenCalled();
    });

    describe("when href is #", () => {
      it("prevents default but does not stopPropagation or stopImmediatePropagation", async () => {
        const event = {
          preventDefault: jest.fn(),
          stopPropagation: jest.fn(),
          stopImmediatePropagation: jest.fn(),
        };
        const clickHandlerMock = jest.fn();

        createWrapper({
          propsData: {
            href: "#",
          },
          listeners: {
            click: clickHandlerMock,
          },
        });

        await clickLink(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
        expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      });
    });
  });

  describe("router-link support", () => {
    const { mountOptions: routerMountOptions } = createTestRouter([
      {
        path: "/",
        component: {
          name: "R",
          render(h) {
            return h("div", "ROOT");
          },
        },
      },
      {
        path: "/a",
        component: {
          name: "A",
          render(h) {
            return h("div", "A");
          },
        },
      },
      {
        path: "/b",
        component: {
          name: "B",
          render(h) {
            return h("div", "B");
          },
        },
      },
    ]);

    it("correctly renders `<router-link>` component", () => {
      const App = {
        components: { Link },
        render(h) {
          return h("main", [
            h(Link, { props: { to: "/a" } }, "to-a"),
            h(Link, { props: { href: "/a" } }, "href-a"),
            h(Link, { props: { to: { path: "/b" } } }, "to-path-b"),
          ]);
        },
      };

      wrapper = mount(App, {
        ...routerMountOptions,
        attachTo: document.body,
      });

      const links = wrapper.findAll("a");
      expect(links).toHaveLength(3);
      expect(
        links.wrappers.map((link) =>
          link.findComponent({ name: "RouterLink" }).exists()
        )
      ).toStrictEqual([true, false, true]);
    });

    it("passes router link props to `<router-link>` component", () => {
      const routerProps = {
        to: "/a",
        activeClass: "active",
        exactActiveClass: "exact-active",
        replace: true,
      };

      const App = {
        components: { Link },
        render(h) {
          return h("main", [h(Link, { props: routerProps }, "to-a")]);
        },
      };

      wrapper = mount(App, {
        ...routerMountOptions,
        attachTo: document.body,
        stubs: { RouterLink: RouterLinkStub },
      });

      expect(wrapper.findComponent(RouterLinkStub).props()).toMatchObject(
        routerProps
      );
    });

    it("passes HTML attributes to router link anchor tag", () => {
      const App = {
        components: { Link },
        render(h) {
          return h("main", [
            h(
              Link,
              { props: { to: "/a" }, attrs: { "aria-current": "true" } },
              "to-a"
            ),
          ]);
        },
      };

      wrapper = mount(App, {
        ...routerMountOptions,
        attachTo: document.body,
        stubs: { RouterLink: RouterLinkStub },
      });

      expect(wrapper.find("a").attributes("aria-current")).toBe("true");
    });

    (isGlobalVue3 ? it : it.skip)(
      "adds activeClass and exactActiveClass classes to anchor tag in Vue 3",
      () => {
        const routerProps = {
          to: "/a",
          activeClass: "active",
          exactActiveClass: "exact-active",
        };

        const App = {
          components: { Link },
          render(h) {
            return h("main", [h(Link, { props: routerProps }, "to-a")]);
          },
        };

        wrapper = mount(App, {
          ...routerMountOptions,
          attachTo: document.body,
          stubs: { RouterLink: RouterLinkStub },
        });

        // eslint-disable-next-line jest/no-standalone-expect -- conditional `it` is not detected as a test block
        expect(wrapper.find("a").classes()).toEqual(
          expect.arrayContaining(["active", "exact-active"])
        );
      }
    );

    it("passes prefetch prop `<router-link>` component when set to a boolean", () => {
      const App = {
        components: { Link },
        render(h) {
          return h("main", [
            h(Link, { props: { to: "/a", prefetch: true } }, "to-a"),
          ]);
        },
      };

      wrapper = mount(App, {
        ...routerMountOptions,
        attachTo: document.body,
        stubs: { RouterLink: RouterLinkStub },
      });

      expect(wrapper.findComponent(RouterLinkStub).props("prefetch")).toBe(
        true
      );
    });

    describe("when router link is clicked", () => {
      it("calls click handler", async () => {
        const clickHandlerMock = jest.fn();

        const App = {
          components: { Link },
          render(h) {
            return h("main", [
              h(
                Link,
                {
                  props: { to: "/a" },
                  on: {
                    click: clickHandlerMock,
                  },
                },
                "to-a"
              ),
            ]);
          },
        };

        wrapper = mount(App, {
          ...routerMountOptions,
          attachTo: document.body,
          stubs: { RouterLink: RouterLinkStub },
        });

        expect(clickHandlerMock).not.toHaveBeenCalled();
        await clickLink();
        if (isGlobalVue3) {
          expect(clickHandlerMock).toHaveBeenCalledWith(
            expect.any(MouseEvent),
            navigate
          );
          expect(navigate).toHaveBeenCalled();
        } else {
          expect(clickHandlerMock).toHaveBeenCalledWith(expect.any(MouseEvent));
        }
      });

      it("calls multiple click handlers", async () => {
        const clickHandlerMock1 = jest.fn();
        const clickHandlerMock2 = jest.fn();

        const App = {
          components: { Link },
          render(h) {
            return h("main", [
              h(
                Link,
                {
                  props: { to: "/a" },
                  on: {
                    click: [clickHandlerMock1, clickHandlerMock2],
                  },
                },
                "to-a"
              ),
            ]);
          },
        };

        wrapper = mount(App, {
          ...routerMountOptions,
          attachTo: document.body,
        });

        expect(clickHandlerMock1).not.toHaveBeenCalled();
        expect(clickHandlerMock2).not.toHaveBeenCalled();
        await clickLink();
        expect(clickHandlerMock1).toHaveBeenCalled();
        expect(clickHandlerMock2).toHaveBeenCalled();
      });
    });
  });
});
