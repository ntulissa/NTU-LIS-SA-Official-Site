/// <reference types="vite/client" />

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const src: string;
  const component: FC<SVGProps<SVGSVGElement>>;
  export default component;
  export { src };
}
