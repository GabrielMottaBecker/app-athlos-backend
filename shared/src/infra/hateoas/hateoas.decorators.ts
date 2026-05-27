import { SetMetadata } from "@nestjs/common";
import type { HateoasLinks } from "./hateoas.types";

export const HATEOAS_ITEM_KEY = "hateoas:item";
export const HATEOAS_LIST_KEY = "hateoas:list";

export type HateoasItemOptions<T> = {
  basePath: string;
  itemLinks: (item: T) => HateoasLinks;
};

export type HateoasListOptions<T> = {
  basePath: string;
  itemLinks: (item: T) => HateoasLinks;
};

export const HateoasItem = <T>(
  options: HateoasItemOptions<T>,
): MethodDecorator => SetMetadata(HATEOAS_ITEM_KEY, options);

export const HateoasList = <T>(
  options: HateoasListOptions<T>,
): MethodDecorator => SetMetadata(HATEOAS_LIST_KEY, options);