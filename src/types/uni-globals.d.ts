declare const uni: {
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
  removeStorageSync(key: string): void;
  navigateTo(options: { url: string }): void;
  reLaunch(options: { url: string }): void;
  showToast(options: { title: string; icon?: string }): void;
  showModal(options: {
    title: string;
    content: string;
    editable?: boolean;
    placeholderText?: string;
    confirmText?: string;
    confirmColor?: string;
    success?: (result: { confirm: boolean; cancel: boolean; content?: string }) => void;
  }): void;
  showActionSheet(options: {
    itemList: string[];
    itemColor?: string;
    success?: (result: { tapIndex: number }) => void;
  }): void;
};

declare function onLoad(callback: (query?: Record<string, string>) => void): void;
declare function onShow(callback: () => void): void;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
